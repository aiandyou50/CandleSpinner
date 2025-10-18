// 간단한 해시 함수
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

interface UserState {
  credit: number;
  canDoubleUp: boolean;
  pendingWinnings: number;
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const { walletAddress, choice, clientSeed }: {
      walletAddress: string;
      choice: 'red' | 'blue';
      clientSeed: string;
    } = await request.json();

    // KV에서 사용자 상태 가져오기
    const stateKey = `user_${walletAddress}`;
    const stateData = await env.CREDIT_KV.get(stateKey);
    const state: UserState = stateData ? JSON.parse(stateData) : {
      credit: 0,
      canDoubleUp: false,
      pendingWinnings: 0
    };

    // 유효성 검사
    if (!state.canDoubleUp) {
      return new Response(JSON.stringify({
        error: "미니게임을 플레이할 수 없습니다."
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const winningsAtStake = state.pendingWinnings;
    state.canDoubleUp = false;
    state.pendingWinnings = 0;

    // Provably Fair 기반 50% 확률 계산
    const serverSeed = Math.random().toString(36);
    const resultValue = simpleHash(serverSeed + clientSeed) % 2;
    const winningChoice = resultValue === 0 ? 'red' : 'blue';

    const hasWon = choice === winningChoice;

    if (hasWon) {
      // 성공: 상금 2배
      const newWinnings = winningsAtStake * 2;
      state.credit += newWinnings;

      await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

      return new Response(JSON.stringify({
        won: true,
        newWinnings
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // 실패: 상금 소멸
      await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

      return new Response(JSON.stringify({
        won: false,
        newWinnings: 0
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Double up error:', error);
    return new Response(JSON.stringify({
      error: '미니게임 처리 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}