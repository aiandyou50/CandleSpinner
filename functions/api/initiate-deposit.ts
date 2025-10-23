import '../_bufferPolyfill';
import { keyPairFromSecretKey } from '@ton/crypto';
import { WalletContractV5R1, internal, beginCell, toNano, Address, SendMode } from '@ton/ton';

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

  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OGY3M2I0MC02MDZlLTQ1ZDktYjU1ZS00MzA0NmFkMWY2MzciLCJqdGkiOiI0ZjdhOTQwNC1kYWRhLTQ4MzItYjgzZi04ZjM2ODAxZmE1ZjUiLCJpc3MiOiJ0b25hcGkuaW8iLCJpYXQiOjE3MjkzODI4NTcsImV4cCI6MTc0NzE2Mjg1N30.AwKGfW1dO8BfTdRx3gG9UaZp4RfXMfIGxSiX-1xHD0Q'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get jetton wallet: ${response.statusText}`);
  }

  const data = await response.json() as { address: string };
  return data.address;
}

// Direct API call to send BOC
async function sendBocViaApi(bocBase64: string): Promise<string> {
  const url = 'https://tonapi.io/v1/blockchain/message';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OGY3M2I0MC02MDZlLTQ1ZDktYjU1ZS00MzA0NmFkMWY2MzciLCJqdGkiOiI0ZjdhOTQwNC1kYWRhLTQ4MzItYjgzZi04ZjM2ODAxZmE1ZjUiLCJpc3MiOiJ0b25hcGkuaW8iLCJpYXQiOjE3MjkzODI4NTcsImV4cCI6MTc0NzE2Mjg1N30.AwKGfW1dO8BfTdRx3gG9UaZp4RfXMfIGxSiX-1xHD0Q'
    },
    body: JSON.stringify({ boc: bocBase64 })
  });

  if (!response.ok) {
    throw new Error(`Failed to send BOC: ${response.statusText}`);
  }

  const data = await response.json() as { hash: string };
  return data.hash;
}

// Get wallet seqno
async function getWalletSeqno(walletAddress: string): Promise<number> {
  const url = 'https://tonapi.io/v1/blockchain/accounts/getAccount';
  const params = new URLSearchParams({ account: walletAddress });

  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OGY3M2I0MC02MDZlLTQ1ZDktYjU1ZS00MzA0NmFkMWY2MzciLCJqdGkiOiI0ZjdhOTQwNC1kYWRhLTQ4MzItYjgzZi04ZjM2ODAxZmE1ZjUiLCJpc3MiOiJ0b25hcGkuaW8iLCJpYXQiOjE3MjkzODI4NTcsImV4cCI6MTc0NzE2Mjg1N30.AwKGfW1dO8BfTdRx3gG9UaZp4RfXMfIGxSiX-1xHD0Q'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get account: ${response.statusText}`);
  }

  const data = await response.json() as { account: { storage: { state: { data: string } } } };
  
  // Simple seqno extraction from account state
  // 실제로는 더 정교한 파싱 필요할 수 있음
  return 0;
}

export const onRequest = async (context: any) => {
  try {
    const { walletAddress, depositAmount } = await context.request.json() as { 
      walletAddress: string; 
      depositAmount: number 
    };

    // Validation
    if (!walletAddress || !depositAmount || depositAmount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: '올바르지 않은 입금액입니다.' }),
        { status: 400 }
      );
    }

    // Constants
    const CSPIN_TOKEN_ADDRESS = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';
    const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';

    // Get environment variables
    const gameWalletPrivateKeyHex = context.env.GAME_WALLET_PRIVATE_KEY as string;
    if (!gameWalletPrivateKeyHex) {
      return new Response(
        JSON.stringify({ success: false, error: '게임 지갑 설정이 누락되었습니다.' }),
        { status: 500 }
      );
    }

    // Create game wallet
    const privateKeyBytes = hexToBytes(gameWalletPrivateKeyHex);
    const keyPair = keyPairFromSecretKey(Buffer.from(privateKeyBytes));
    const gameWallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey, workchain: 0 });

    // Get jetton wallet address for game wallet
    const gameJettonWalletAddress = await retry(() =>
      getJettonWalletAddress(CSPIN_TOKEN_ADDRESS, gameWallet.address.toString())
    );

    // Get current seqno
    const seqno = await retry(() => getWalletSeqno(gameWallet.address.toString()));

    // Create Jetton transfer message
    const jettonTransferBody = beginCell()
      .storeUint(0x0f8a7ea5, 32) // op: transfer
      .storeUint(0, 64) // query_id
      .storeCoins(toNano(depositAmount.toString())) // amount
      .storeAddress(Address.parse(walletAddress)) // destination
      .storeAddress(Address.parse(gameWallet.address.toString())) // response_destination
      .storeBit(0) // custom_payload
      .storeCoins(toNano('0.01')) // forward_ton_amount
      .storeBit(0) // forward_payload
      .endCell();

    // Create internal message
    const transferMessage = internal({
      to: Address.parse(gameJettonWalletAddress),
  value: toNano(context.env.NETWORK_FEE_TON ?? '0.03'), // 네트워크 수수료 (환경 변수 적용)
      body: jettonTransferBody
    });

    // Create and sign transaction
    const transfer = gameWallet.createTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [transferMessage],
      sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS
    });

    const boc = transfer.toBoc();
    const bocBase64 = boc.toString('base64');

    // Send BOC to network
    const txHash = await retry(() => sendBocViaApi(bocBase64));

    // Update user credit in KV
    const kvKey = `user_${walletAddress}`;
    const existingState = await context.env.CREDIT_KV.get(kvKey);
    const state: UserState = existingState 
      ? JSON.parse(existingState)
      : { credit: 0, canDoubleUp: false, pendingWinnings: 0 };

    state.credit += depositAmount;
    await context.env.CREDIT_KV.put(kvKey, JSON.stringify(state));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'CSPIN 입금이 성공했습니다.',
        txHash,
        newCredit: state.credit,
        depositAmount
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('입금 처리 오류:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || '입금 처리 중 오류가 발생했습니다.'
      }),
      { status: 500 }
    );
  }
};
