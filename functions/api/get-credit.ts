/**
 * GET /api/get-credit
 * 
 * 지갑 주소로 KV에 저장된 크레딧을 조회합니다.
 * 프론트엔드가 페이지 새로고침 후 크레딧을 복구하기 위해 사용됩니다.
 * 
 * @param walletAddress - 사용자 TON 지갑 주소 (쿼리 파라미터)
 * @returns { credit: number } - 현재 크레딧 잔액
 * 
 * @example
 * GET /api/get-credit?walletAddress=UQ...
 * Response: { "credit": 1000 }
 */

// Cloudflare Worker 환경 (wrangler.toml 기반)
interface Env {
  CREDIT_KV: any; // Cloudflare KVNamespace
}

export interface CreditResponse {
  credit: number;
  walletAddress?: string;
  timestamp?: number;
}

interface GameState {
  credit: number;
  lastTxHash?: string;
  lastTxTime?: number;
}

/**
 * KV에서 게임 상태를 조회합니다 (SSOT [산출물3]의 getKVState 재사용)
 */
async function getKVState(kvNamespace: any, key: string): Promise<GameState | null> {
  try {
    const data = await kvNamespace.get(key);
    if (!data) return null;
    return JSON.parse(data) as GameState;
  } catch (error) {
    console.error('[getKVState] KV 조회 실패:', error);
    return null;
  }
}

/**
 * GET /api/get-credit 핸들러
 */
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 요청 메서드 확인
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 쿼리 파라미터에서 walletAddress 추출
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get('walletAddress');

    if (!walletAddress) {
      return new Response(JSON.stringify({ error: 'Missing walletAddress parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[get-credit] 조회 요청:', walletAddress);

    // KV에서 해당 지갑의 상태 조회
    const gameState = await getKVState(env.CREDIT_KV, walletAddress);

    // 크레딧이 없으면 0 반환
    const credit = gameState?.credit || 0;

    const response: CreditResponse = {
      credit,
      walletAddress,
      timestamp: Date.now(),
    };

    console.log('[get-credit] ✅ 조회 성공:', { walletAddress, credit });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // 항상 최신값 조회
      },
    });
  } catch (error) {
    console.error('[get-credit] ❌ 오류:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
