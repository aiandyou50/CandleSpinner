import '../_bufferPolyfill';
import TonWeb from 'tonweb';
import { keyPairFromSecretKey } from '@ton/crypto';
import { WalletContractV4, internal, beginCell, storeMessage, toNano, Address, fromNano, TonClient4 } from '@ton/ton';

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
async function sendBocViaTonAPI(bocBase64: string): Promise<any> {
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
    const { walletAddress, withdrawalAmount, action, txBoc }: {
      walletAddress: string,
      withdrawalAmount: number,
      action?: string,
      txBoc?: string
    } = await request.json();

    // KV에서 사용자 상태 가져오기
    const stateKey = `user_${walletAddress}`;
    const stateData = await env.CREDIT_KV.get(stateKey);
    const state: UserState = stateData ? JSON.parse(stateData) : {
      credit: 0,
      canDoubleUp: false,
      pendingWinnings: 0
    };

    // 크레딧 검증만 하는 경우 (프론트엔드에서 트랜잭션 발생 전)
    if (action === 'verify_only') {
      if (state.credit < withdrawalAmount) {
        return new Response(JSON.stringify({
          canWithdraw: false,
          error: '인출할 수 있는 크레딧이 부족합니다.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        canWithdraw: true,
        availableCredit: state.credit
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 최종 처리 (트랜잭션 성공 후 크레딧 차감)
    if (action === 'finalize') {
      if (state.credit < withdrawalAmount) {
        return new Response(JSON.stringify({
          error: '크레딧이 부족합니다.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 크레딧 차감
      state.credit -= withdrawalAmount;
      state.canDoubleUp = false;
      state.pendingWinnings = 0;

      // KV에 상태 저장
      await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

      return new Response(JSON.stringify({
        success: true,
        withdrawalAmount,
        newCredit: state.credit,
        message: `크레딧 차감 완료: ${withdrawalAmount} CSPIN`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 기존 로직 (시뮬레이션 모드)
    if (withdrawalAmount <= 0 || state.credit < withdrawalAmount) {
      return new Response(JSON.stringify({
        error: '인출할 수 있는 크레딧이 부족합니다.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 실제 블록체인 전송 로직
    try {
      console.log(`Processing withdrawal: ${withdrawalAmount} CSPIN to ${walletAddress}`);

      // 게임 월렛 프라이빗 키 가져오기
      const gameWalletPrivateKey = env.GAME_WALLET_PRIVATE_KEY;
      if (!gameWalletPrivateKey) {
        throw new Error('게임 월렛 프라이빗 키가 설정되지 않았습니다.');
      }

      // 키 페어 생성
      const keyPair = keyPairFromSecretKey(Buffer.from(gameWalletPrivateKey, 'hex'));
      
      // 게임 월렛 컨트랙트 생성
      const gameWallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
      
      // TON 클라이언트 (TonClient4 사용)
      const client = new TonClient4({ endpoint: 'https://mainnet-v4.tonhubapi.com' });

      // CSPIN 제톤 전송 메시지 생성
      const jettonTransferBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // op: transfer
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(withdrawalAmount.toString())) // amount
        .storeAddress(Address.parse(walletAddress)) // destination
        .storeAddress(Address.parse(gameWallet.address.toString())) // response_destination
        .storeBit(0) // custom_payload
        .storeCoins(toNano('0.01')) // forward_ton_amount
        .storeBit(0) // forward_payload
        .endCell();

      // CSPIN 지갑 주소 계산 (게임 월렛의 CSPIN 지갑)
      const cspinMasterAddress = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';
      const gameJettonWalletAddress = await getJettonWalletAddress(cspinMasterAddress, gameWallet.address.toString());

      // 내부 메시지 생성
      const transferMessage = internal({
        to: gameJettonWalletAddress,
        value: toNano('0.03'), // 수수료 낮춤
        body: jettonTransferBody
      });

      // 트랜잭션 전송 (seqno는 0으로 가정, 실제 운영 시 KV에 저장해서 관리)
      const seqno = 0;
      const transfer = gameWallet.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [transferMessage]
      });

      // BOC 생성 및 전송
      const boc = transfer.toBoc();
      const bocBase64 = boc.toString('base64');
      
      await sendBocViaTonAPI(bocBase64);

      console.log('Withdrawal transaction sent successfully');

      // KV에서 크레딧 차감
      state.credit -= withdrawalAmount;
      state.canDoubleUp = false;
      state.pendingWinnings = 0;

      // KV에 상태 저장
      await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

      return new Response(JSON.stringify({
        success: true,
        withdrawalAmount,
        newCredit: state.credit,
        message: `✅ ${withdrawalAmount} CSPIN 토큰이 ${walletAddress}로 전송되었습니다.`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (blockchainError: any) {
      console.error('Blockchain transfer error:', blockchainError);

      return new Response(JSON.stringify({
        error: `블록체인 전송 실패: ${blockchainError.message || '알 수 없는 오류'}`,
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
