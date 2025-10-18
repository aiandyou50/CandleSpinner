interface UserState {
  credit: number;
  canDoubleUp: boolean;
  pendingWinnings: number;
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

    // 크레딧을 0으로 설정 (인출 요청)
    const withdrawalAmount = state.credit;
    state.credit = 0;
    state.canDoubleUp = false;
    state.pendingWinnings = 0;

    // KV에 상태 저장
    await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

    return new Response(JSON.stringify({
      success: true,
      withdrawalAmount,
      newCredit: state.credit
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Initiate withdrawal error:', error);
    return new Response(JSON.stringify({
      error: '인출 요청 처리 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}