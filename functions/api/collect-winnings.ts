interface UserState {
  credit: number;
  canDoubleUp: boolean;
  pendingWinnings: number;
}

import '../_bufferPolyfill';

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

    if (!state.canDoubleUp) {
      return new Response(JSON.stringify({
        error: "수령할 상금이 없습니다."
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 대기 중인 상금을 크레딧에 합산
    state.credit += state.pendingWinnings;
    const collectedAmount = state.pendingWinnings;
    state.canDoubleUp = false;
    state.pendingWinnings = 0;

    // KV에 상태 저장
    await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

    return new Response(JSON.stringify({
      success: true,
      newCredit: state.credit,
      collectedAmount
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Collect winnings error:', error);
    return new Response(JSON.stringify({
      error: '상금 수령 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}