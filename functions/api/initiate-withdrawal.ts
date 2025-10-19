import '../_bufferPolyfill';
import TonWeb from 'tonweb';
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
    const { walletAddress, bocData }: { walletAddress: string, bocData?: any } = await request.json();

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

    // 하이브리드 접근: 프론트엔드에서 생성된 BOC를 받아서 전송
    try {
      console.log('Received bocData:', bocData);

      if (!bocData) {
        throw new Error('BOC 데이터가 제공되지 않았습니다.');
      }

      // 프론트엔드에서 생성된 메시지를 사용해서 실제 전송
      console.log('Sending BOC to tonapi.io...');

      // tonapi.io를 사용해서 BOC 전송 (라이브러리 없이 직접 API 호출)
      const sendResult = await retry(() => sendBocViaTonAPI(bocData.messageBoc), 4, 500);
      console.log('BOC sent successfully:', sendResult);

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
