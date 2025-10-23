/**
 * GET /api/debug-withdrawal
 * 
 * 인출 로직의 설정 상태를 확인합니다.
 * (개발용 - 배포 시 제거)
 */

interface Env {
  CREDIT_KV: any;
  GAME_WALLET_PRIVATE_KEY: string;
  GAME_WALLET_ADDRESS: string;
  CSPIN_TOKEN_ADDRESS: string;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context;

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      hasPrivateKey: !!env.GAME_WALLET_PRIVATE_KEY,
      privateKeyLength: env.GAME_WALLET_PRIVATE_KEY?.length || 0,
      gameWalletAddress: env.GAME_WALLET_ADDRESS || '없음',
      cspinTokenAddress: env.CSPIN_TOKEN_ADDRESS || '없음'
    },
    status: {
      privateKeyValid: !!env.GAME_WALLET_PRIVATE_KEY && env.GAME_WALLET_PRIVATE_KEY.length > 0,
      gameWalletValid: !!env.GAME_WALLET_ADDRESS,
      cspinTokenValid: !!env.CSPIN_TOKEN_ADDRESS
    }
  };

  console.log('[debug-withdrawal] 진단:', diagnostics);

  return new Response(
    JSON.stringify(diagnostics, null, 2),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
