/**
 * RPC 직접 입금 엔드포인트 (v2.1.0 A/B 테스트용)
 * 
 * 주의: 이 엔드포인트는 백엔드에서 직접 트랜잭션을 처리합니다.
 * 보안 위험이 있으므로 테스트 목적으로만 사용되어야 합니다.
 * 프로덕션에서는 TonConnect (/api/deposit) 사용 권장
 */

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const body = await request.json() as {
      walletAddress?: string;
      depositAmount?: number;
    };

    const { walletAddress, depositAmount } = body;

    // 입력 검증
    if (!walletAddress || !depositAmount || depositAmount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '유효하지 않은 입금액 또는 지갑 주소'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // KV에서 기존 잔액 조회
    const balanceKey = `balance:${walletAddress}`;
    const existing = await env.CREDIT_KV.get(balanceKey);
    const currentBalance = existing ? parseFloat(existing) : 0;
    const newBalance = currentBalance + depositAmount;

    // ⚠️ RPC 직접 호출은 실제 TON 트랜잭션을 생성하지 않음 (테스트용)
    // 실제 구현에서는:
    // 1. TON Center v3 API 사용 (TONCENTER_API_KEY 필요)
    // 2. 게임 지갑의 프라이빗 키로 서명
    // 3. 트랜잭션 전송 후 확인 대기
    // 4. 블록체인 검증 후 크레딧 추가

    // 테스트용: 즉시 KV에 저장
    await env.CREDIT_KV.put(balanceKey, newBalance.toString());

    // 트랜잭션 로그 저장 (7일 TTL)
    const txLogKey = `tx:${walletAddress}:${Date.now()}`;
    await env.CREDIT_KV.put(
      txLogKey,
      JSON.stringify({
        type: 'deposit',
        amount: depositAmount,
        method: 'rpc-direct',
        txHash: `rpc-test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'pending'
      }),
      { expirationTtl: 7 * 24 * 60 * 60 } // 7일 TTL
    );

    // 게임 상태 업데이트
    const stateKey = `state:${walletAddress}`;
    const existingState = await env.CREDIT_KV.get(stateKey);
    let gameState = existingState ? JSON.parse(existingState) : { credit: 0, canDoubleUp: false, pendingWinnings: 0 };
    gameState.credit = newBalance;
    await env.CREDIT_KV.put(stateKey, JSON.stringify(gameState));

    console.log(`[RPC Deposit] ${walletAddress}: +${depositAmount} CSPIN (총: ${newBalance})`);

    return new Response(
      JSON.stringify({
        success: true,
        newBalance,
        newCredit: newBalance,
        txHash: `rpc-test-${Date.now()}`
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[RPC Deposit Error]', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
