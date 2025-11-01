/**
 * 백엔드 입금 엔드포인트 (단순화)
 * 
 * 기능:
 * 1. 사용자 입금 기록 저장
 * 2. KV에 크레딧 업데이트
 * 3. 트랜잭션 로그 기록
 */

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const body = await request.json() as {
      walletAddress?: string;
      depositAmount?: number;
      txHash?: string;
      method?: string;
    };

    const { walletAddress, depositAmount, txHash, method } = body;

    // 입력 검증
    if (!walletAddress || !depositAmount || depositAmount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid walletAddress or depositAmount'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // KV에 기존 잔액 조회
    const balanceKey = `balance:${walletAddress}`;
    const existing = await env.CREDIT_KV.get(balanceKey);
    const currentBalance = existing ? parseFloat(existing) : 0;
    const newBalance = currentBalance + depositAmount;

    // 트랜잭션 로그 저장
    const txLogKey = `tx:${walletAddress}:${Date.now()}`;
    await env.CREDIT_KV.put(
      txLogKey,
      JSON.stringify({
        type: 'deposit',
        amount: depositAmount,
        method: method || 'tonconnect',
        txHash: txHash || 'pending',
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      }),
      { expirationTtl: 86400 * 7 } // 7일 보관
    );

    // 잔액 업데이트
    await env.CREDIT_KV.put(balanceKey, newBalance.toString());

    // 게임 상태 업데이트
    const stateKey = `state:${walletAddress}`;
    const stateData = await env.CREDIT_KV.get(stateKey);
    const state = stateData ? JSON.parse(stateData) : {
      credit: 0,
      canDoubleUp: false,
      pendingWinnings: 0
    };
    
    state.credit = newBalance;
    await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Deposit successful',
        newBalance: newBalance,
        newCredit: newBalance
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Deposit error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
