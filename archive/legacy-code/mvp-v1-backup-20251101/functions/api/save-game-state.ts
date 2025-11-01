/**
 * POST /api/save-game-state
 * 
 * 게임 상태를 KV에 저장합니다.
 * 사용 시기: 스핀 결과, 더블업 결과, 수령 등 크레딧 변경 시
 * 
 * @param {Object} body
 *   - walletAddress: 사용자 지갑 주소 (필수)
 *   - credit: 현재 크레딧 (필수)
 *   - canDoubleUp: 더블업 가능 여부 (선택)
 *   - pendingWinnings: 대기 중인 상금 (선택)
 * 
 * @example
 * POST /api/save-game-state
 * {
 *   "walletAddress": "UQ...",
 *   "credit": 1250,
 *   "canDoubleUp": false,
 *   "pendingWinnings": 0
 * }
 */

interface Env {
  CREDIT_KV: any;
}

interface GameState {
  credit: number;
  canDoubleUp?: boolean;
  pendingWinnings?: number;
  lastUpdateTime?: number;
}

interface SaveGameStateRequest {
  walletAddress: string;
  credit: number;
  canDoubleUp?: boolean;
  pendingWinnings?: number;
}

interface SaveGameStateResponse {
  success: boolean;
  message?: string;
  error?: string;
  savedState?: GameState;
}

/**
 * 게임 상태 저장 핸들러
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    // 요청 바디 파싱
    const body = await request.json() as SaveGameStateRequest;
    const { walletAddress, credit, canDoubleUp = false, pendingWinnings = 0 } = body;

    // 입력 검증
    if (!walletAddress) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing walletAddress'
        } as SaveGameStateResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof credit !== 'number' || credit < 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid credit value'
        } as SaveGameStateResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // KV에 저장할 상태
    const stateKey = `state:${walletAddress}`;
    const gameState: GameState = {
      credit: Math.floor(credit),
      canDoubleUp,
      pendingWinnings: Math.floor(pendingWinnings),
      lastUpdateTime: Date.now()
    };

    // KV에 저장
    await env.CREDIT_KV.put(stateKey, JSON.stringify(gameState));

    console.log('[save-game-state] ✅ 저장 성공:', {
      walletAddress,
      credit: gameState.credit,
      timestamp: gameState.lastUpdateTime
    });

    const response: SaveGameStateResponse = {
      success: true,
      message: 'Game state saved successfully',
      savedState: gameState
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[save-game-state] ❌ 오류:', error);

    const errorResponse: SaveGameStateResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
