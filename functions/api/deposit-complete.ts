// A방식: TonConnect 클라이언트 서명 + 백엔드 KV 크레딧 업데이트
export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const body: {
      walletAddress?: string;
      depositAmount?: number;
      txHash?: string;
      method?: string;
    } = await request.json();

    const { walletAddress, depositAmount, txHash, method } = body;

    // 필수 필드 검증
    if (!walletAddress || !depositAmount || !txHash) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: walletAddress, depositAmount, txHash'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // A방식: TonConnect 클라이언트 서명
    // 백엔드는 단순히 KV에 크레딧 저장
    if (method === 'direct') {
      // KV에서 기존 크레딧 읽기
      const key = `deposit:${walletAddress}`;
      const existing = await env.CREDIT_KV.get(key);
      const currentCredit = existing ? parseFloat(existing) : 0;
      const newCredit = currentCredit + depositAmount;

      // 트랜잭션 로그 저장
      const logKey = `txlog:${walletAddress}:${Date.now()}`;
      await env.CREDIT_KV.put(
        logKey,
        JSON.stringify({
          method: 'direct',
          amount: depositAmount,
          txHash: txHash,
          timestamp: new Date().toISOString(),
          status: 'confirmed'
        })
      );

      // 크레딧 업데이트
      await env.CREDIT_KV.put(key, newCredit.toString());

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Deposit recorded',
          newCredit: newCredit
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid method' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
