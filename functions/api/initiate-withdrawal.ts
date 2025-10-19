import '../_bufferPolyfill';
import { TonClient, WalletContractV4, Address, toNano, beginCell, internal } from '@ton/ton';
import { keyPairFromSecretKey } from '@ton/crypto';

// Cloudflare Functions 환경에서는 Node's Buffer가 항상 존재하지 않습니다.
// 작은 헥스 -> Uint8Array 변환 유틸을 사용해 Buffer 의존성을 제거합니다.
function hexToBytes(hex: string): Uint8Array {
  if (!hex) return new Uint8Array();
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  const len = normalized.length;
  const bytes = new Uint8Array(Math.ceil(len / 2));
  for (let i = 0; i < len; i += 2) {
    bytes[i / 2] = parseInt(normalized.substr(i, 2), 16);
  }
  return bytes;
}

interface UserState {
  credit: number;
  canDoubleUp: boolean;
  pendingWinnings: number;
}

// Simple retry helper with exponential backoff for transient errors (e.g., 429 rate limit)
async function retry<T>(fn: () => Promise<T>, attempts = 3, baseDelay = 500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const msg = err && err.message ? String(err.message) : '';
      // If it's 429 or network, retry; otherwise break early
      if (/\b429\b/.test(msg) || /rate limit/i.test(msg) || /ECONNRESET|ETIMEDOUT/.test(msg)) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Direct API call to get jetton wallet address using tonapi.io
async function getJettonWalletAddress(masterAddress: string, ownerAddress: string): Promise<string> {
  const url = 'https://tonapi.io/v1/jetton/getWalletAddress';
  const params = new URLSearchParams({
    account: ownerAddress,
    jetton: masterAddress
  });

  const response = await fetch(`${url}?${params}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TonAPI getWalletAddress failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.wallet_address.address;
}

// Direct API call to send BOC using tonapi.io
async function sendBoc(bocBase64: string): Promise<any> {
  const url = 'https://tonapi.io/v1/blockchain/message';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify({ boc: bocBase64 })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TonAPI sendBoc failed: ${response.status} ${text}`);
  }

  return await response.json();
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const { walletAddress }: { walletAddress: string } = await request.json();

    // KV에서 사용자 상태 가져오기
    const stateKey = `user_${walletAddress}`;
    const stateData = await env.CREDIT_KV.get(stateKey);
    const state: UserState = stateData ? JSON.parse(stateData) : {
      credit: 0,
      canDoubleUp: false,
      pendingWinnings: 0
    };

    const withdrawalAmount = state.credit;

    if (withdrawalAmount <= 0) {
      return new Response(JSON.stringify({
        error: '인출할 수 있는 크레딧이 없습니다.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 실제 CSPIN 토큰 전송 로직
    try {
      console.log('Starting blockchain transfer for wallet:', walletAddress);

      // 환경 변수에서 게임 월렛 정보 가져오기
      const gameWalletPrivateKey = env.GAME_WALLET_PRIVATE_KEY;
      const cspinMasterContract = env.CSPIN_MASTER_CONTRACT || 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';

      if (!gameWalletPrivateKey) {
        throw new Error('게임 월렛 프라이빗 키가 설정되지 않았습니다.');
      }

      console.log('Environment variables loaded');

      // Use @ton/ton library with tonapi.io (free TON API)
      const client = new TonClient({
        endpoint: 'https://tonapi.io/v1/jsonRPC',
        timeout: 15000
      });

      console.log('TON client initialized');

      // 게임 월렛 키페어 생성
      const keyPair = keyPairFromSecretKey(hexToBytes(gameWalletPrivateKey) as unknown as Buffer);
      const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0
      });

      const walletContract = client.open(wallet);
      const walletAddressObj = wallet.address;
      console.log('Wallet contract opened:', walletAddressObj.toString());

      // 수신자 주소
      const recipientAddress = Address.parse(walletAddress);
      console.log('Recipient parsed');

      // CSPIN 마스터 컨트랙트 주소
      const cspinMasterAddress = Address.parse(cspinMasterContract);
      console.log('Master contract parsed');

      // 게임 월렛의 CSPIN Jetton 월렛 주소 계산
      const jettonWalletAddress = await retry(() => client.runMethod(
        cspinMasterAddress,
        'get_wallet_address',
        [{
          type: 'slice',
          cell: beginCell().storeAddress(walletAddressObj).endCell()
        }]
      ), 4, 500);

      const gameJettonWalletAddress = jettonWalletAddress.stack.readAddress();
      console.log('Jetton wallet address:', gameJettonWalletAddress.toString());

      // Jetton 전송 메시지 생성
      const transferMessage = beginCell()
        .storeUint(0xf8a7ea5, 32) // op: transfer
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(withdrawalAmount.toString())) // amount
        .storeAddress(recipientAddress) // destination
        .storeAddress(walletAddressObj) // response_destination
        .storeBit(false) // custom_payload
        .storeCoins(toNano('0.01')) // forward_ton_amount
        .storeBit(false) // forward_payload
        .endCell();

      console.log('Transfer message created');

      // 트랜잭션 전송
      const seqno = await retry(() => walletContract.getSeqno(), 4, 300);
      console.log('Seqno obtained:', seqno);

      const transfer = walletContract.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
          internal({
            to: gameJettonWalletAddress,
            value: toNano('0.05'), // TON 수수료
            body: transferMessage
          })
        ]
      });

      console.log('Transfer created, sending...');
      await retry(() => walletContract.send(transfer), 4, 500);
      console.log('Transfer sent successfully');

      // KV에서 크레딧 차감
      state.credit = 0;
      state.canDoubleUp = false;
      state.pendingWinnings = 0;

      // KV에 상태 저장
      await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

      return new Response(JSON.stringify({
        success: true,
        withdrawalAmount,
        newCredit: state.credit,
        message: `✅ 실제 CSPIN 토큰 ${withdrawalAmount}개가 ${walletAddress}로 전송되었습니다.`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (blockchainError: any) {
      console.error('Blockchain transfer error:', blockchainError);
      console.error('Stack:', blockchainError.stack);

      const msg = blockchainError && blockchainError.message ? String(blockchainError.message) : '';
      // Detect rate-limit / 429
      if (/\b429\b/.test(msg) || /rate limit/i.test(msg)) {
        return new Response(JSON.stringify({
          error: `블록체인 전송 실패: 서비스가 과도한 요청을 받고 있어 잠시 후 다시 시도해 주세요. (${msg})`,
          withdrawalAmount: 0,
          newCredit: state.credit
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 기타 오류는 500으로 반환
      return new Response(JSON.stringify({
        error: `블록체인 전송 실패: ${msg}`,
        withdrawalAmount: 0,
        newCredit: state.credit
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error: any) {
    console.error('Initiate withdrawal error:', error);
    return new Response(JSON.stringify({
      error: '인출 요청 처리 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
