/**
 * 인출 핸들러 (Cloudflare Workers 최적화)
 * @ton/ton 라이브러리 대신 TonCenter API 직접 호출
 */

interface Env {
  CREDIT_KV: KVNamespace;
  GAME_WALLET_MNEMONIC: string;
  GAME_WALLET_ADDRESS: string;
  CSPIN_JETTON_MASTER: string;
  CSPIN_JETTON_WALLET: string;  // 게임의 Jetton Wallet 주소 (환경변수로 설정)
  TONCENTER_API_KEY?: string;
}

/**
 * 임시 구현: 백엔드에서 BOC 생성 대신 프론트엔드에서 처리하도록 변경
 * 
 * 현재 문제:
 * - @ton/ton 라이브러리가 Cloudflare Workers에서 window 객체 참조
 * - Buffer 폴리필로도 해결 안됨
 * 
 * 해결 방안:
 * 1. 프론트엔드에서 TON Connect로 트랜잭션 생성 (입금과 동일)
 * 2. 백엔드는 크레딧 차감만 담당
 * 
 * TODO: 프론트엔드 기반 인출로 변경 필요
 */
export async function processWithdrawal(
  env: Env,
  userWalletAddress: string,
  withdrawAmount: number
): Promise<{ success: boolean; txHash: string }> {
  console.log('=== 인출 처리 시작 (임시 구현) ===');
  console.log(`사용자 지갑: ${userWalletAddress}`);
  console.log(`인출 금액: ${withdrawAmount} CSPIN`);
  
  // 환경변수 확인
  const { GAME_WALLET_ADDRESS, CSPIN_JETTON_MASTER, CSPIN_JETTON_WALLET } = env;
  
  if (!GAME_WALLET_ADDRESS) {
    throw new Error('환경변수 누락: GAME_WALLET_ADDRESS');
  }
  if (!CSPIN_JETTON_MASTER) {
    throw new Error('환경변수 누락: CSPIN_JETTON_MASTER');
  }
  if (!CSPIN_JETTON_WALLET) {
    throw new Error('환경변수 누락: CSPIN_JETTON_WALLET (게임의 Jetton Wallet 주소)');
  }
  
  console.log('[환경변수] 확인 완료');
  console.log(`[환경변수] 게임 TON 지갑: ${GAME_WALLET_ADDRESS}`);
  console.log(`[환경변수] 게임 Jetton 지갑: ${CSPIN_JETTON_WALLET}`);
  console.log(`[환경변수] CSPIN Jetton Master: ${CSPIN_JETTON_MASTER}`);
  
  // ⚠️ 임시: 실제 인출은 프론트엔드에서 처리
  // 백엔드는 인출 요청 정보만 반환
  console.log('⚠️ [임시] 프론트엔드에서 인출 트랜잭션 생성 필요');
  
  return {
    success: true,
    txHash: 'pending_frontend_transaction',  // 임시
    // 프론트엔드에 전달할 정보
    gameJettonWallet: CSPIN_JETTON_WALLET,
    userWalletAddress,
    amount: withdrawAmount
  } as any;
}
