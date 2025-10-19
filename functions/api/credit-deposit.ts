interface UserState {
  credit: number;
  canDoubleUp: boolean;
  pendingWinnings: number;
}

import '../_bufferPolyfill';

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const { walletAddress, amount }: {
      walletAddress: string;
      amount: number;
    } = await request.json();

    // KV에서 사용자 상태 가져오기
    const stateKey = `user_${walletAddress}`;
    const stateData = await env.CREDIT_KV.get(stateKey);
    const state: UserState = stateData ? JSON.parse(stateData) : {
      credit: 0,
      canDoubleUp: false,
      pendingWinnings: 0
    };

    // 크레딧 추가
    state.credit += amount;

    // KV에 상태 저장
    await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

    return new Response(JSON.stringify({
      success: true,
      newCredit: state.credit
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Credit deposit error:', error);
    return new Response(JSON.stringify({
      error: '크레딧 충전 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}