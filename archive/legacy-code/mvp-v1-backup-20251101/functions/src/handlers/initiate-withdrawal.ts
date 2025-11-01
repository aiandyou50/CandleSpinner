import '../../_bufferPolyfill';
import { WalletContractV5R1, internal, beginCell, toNano, Address, SendMode, Cell } from '@ton/ton';
import { TonCenterV2Rpc, SeqnoManager } from '../lib/rpc-utils';
import { getKeyPairAndWallet } from '../lib/mnemonic-utils';

/**
 * POST /api/initiate-withdrawal (v2.4.0 - TonCenter v2)
 * 
 * ✅ v2.4.0 변경사항:
 * 1. TonCenter v3 → v2 API로 변경 (안정성 개선)
 * 2. /api/v2/sendBoc 엔드포인트 사용
 * 3. RPC 직접 전송 방식 유지 (게임 지갑 서명)
 * 4. 오류 메시지 명확화
 */

interface UserState {
  credit: number;
  canDoubleUp?: boolean;
  pendingWinnings?: number;
}

// ============================================================================
// 1. Jetton Transfer Payload 생성 (TEP-74 표준)
// ============================================================================
function buildJettonTransferPayload(
  amount: bigint,
  destination: Address,
  responseTo: Address,
  forwardTonAmount: bigint = BigInt(1)
): Cell {
  return beginCell()
    .storeUint(0xf8a7ea5, 32)      // op: jetton transfer
    .storeUint(0, 64)              // query_id
    .storeCoins(amount)            // amount to transfer
    .storeAddress(destination)     // destination wallet
    .storeAddress(responseTo)      // response destination
    .storeBit(0)                   // custom_payload (none)
    .storeCoins(forwardTonAmount)  // forward_ton_amount
    .storeBit(0)                   // forward_payload (none)
    .endCell();
}

// ============================================================================
// 2. RPC 방식 인출 (게임 지갑에서 서명) - TonCenter v2
// ============================================================================
async function withdrawViaRpc(
  rpc: TonCenterV2Rpc,
  env: any,
  walletAddress: string,
  withdrawalAmount: number,
  userJettonWalletAddress: string
): Promise<{ success: boolean; txHash: string; message: string }> {
  console.log(`[RPC] 시작: ${walletAddress} → ${withdrawalAmount} CSPIN`);

  // 환경 변수 확인
  const gameWalletMnemonic = env.GAME_WALLET_PRIVATE_KEY;
  const gameWalletAddress = env.GAME_WALLET_ADDRESS;
  const cspinTokenAddress = env.CSPIN_TOKEN_ADDRESS;

  if (!gameWalletMnemonic || !gameWalletAddress || !cspinTokenAddress) {
    throw new Error('게임 지갑 설정 오류: 필수 환경 변수 누락 (GAME_WALLET_PRIVATE_KEY, GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS)');
  }

  // 니모닉을 키 쌍 및 지갑으로 변환
  console.log(`[RPC] 니모닉을 키 쌍으로 변환 중...`);
  const { keyPair, wallet: gameWallet } = await getKeyPairAndWallet(gameWalletMnemonic);
  console.log(`[RPC] 키 쌍 변환 완료`);

  console.log(`[RPC] 게임 지갑: ${gameWallet.address.toString()}`);

  // seqno 조회
  const seqnoManager = new SeqnoManager(rpc, env.CREDIT_KV, gameWallet.address.toString());
  console.log(`[RPC] seqno 조회 시작...`);
  const seqno = await seqnoManager.getAndIncrementSeqno();
  console.log(`[RPC] seqno 조회 완료: ${seqno}`);

  // TON 잔액 확인
  console.log(`[RPC] TON 잔액 조회 시작...`);
  const tonBalance = await rpc.getBalance(gameWallet.address.toString());
  console.log(`[RPC] TON 잔액 조회 완료: ${tonBalance}`);
  
  const requiredTon = BigInt('50000000'); // 0.05 TON
  
  if (tonBalance < requiredTon) {
    throw new Error(
      `게임 지갑 TON 부족: ${(Number(tonBalance) / 1e9).toFixed(4)} TON (필요: 0.05 TON)`
    );
  }

  console.log(`[RPC] TON 잔액 확인 통과: ${(Number(tonBalance) / 1e9).toFixed(4)} TON`);

  // Jetton Transfer Payload 생성
  console.log(`[RPC] Jetton Payload 생성 시작...`);
  const jettonPayload = buildJettonTransferPayload(
    toNano(withdrawalAmount.toString()),
    Address.parse(walletAddress),
    gameWallet.address
  );
  console.log(`[RPC] Jetton Payload 생성 완료`);

  // 내부 메시지 생성
  console.log(`[RPC] 내부 메시지 생성 시작 (목적지: ${userJettonWalletAddress})`);
  const transferMessage = internal({
    to: Address.parse(userJettonWalletAddress),
    value: toNano('0.03'),
    body: jettonPayload
  });
  console.log(`[RPC] 내부 메시지 생성 완료`);

  // 트랜잭션 생성
  console.log(`[RPC] 트랜잭션 생성 시작...`);
  const transfer = gameWallet.createTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [transferMessage],
    sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS
  });
  console.log(`[RPC] 트랜잭션 생성 완료`);

  // BOC 생성 및 RPC로 전송
  console.log(`[RPC] BOC 생성 시작...`);
  const boc = transfer.toBoc().toString('base64');
  console.log(`[RPC] BOC 생성 완료 (길이: ${boc.length})`);
  console.log(`[RPC] 첫 100자: ${boc.substring(0, 100)}`);
  
  console.log(`[RPC] 📨 TonCenter v3로 BOC 전송 시작...`);

  let txHash: string;
  try {
    txHash = await rpc.sendBoc(boc);
    console.log(`[RPC] ✅ BOC 전송 성공: ${txHash}`);
  } catch (rpcError) {
    console.error(`[RPC] ❌ BOC 전송 실패:`, rpcError);
    throw new Error(`RPC BOC 전송 오류: ${rpcError instanceof Error ? rpcError.message : String(rpcError)}`);
  }

  console.log(`[RPC] ✅ 완료: ${txHash}`);

  return {
    success: true,
    txHash,
    message: `RPC 방식 인출 완료: ${withdrawalAmount} CSPIN`
  };
}

// ============================================================================
// 3. 중앙화 방식 인출 (사용 안함 - 주석 처리)
// ============================================================================
/*
async function withdrawViaCentralized(
  rpc: any,
  env: any,
  walletAddress: string,
  withdrawalAmount: number,
  userJettonWalletAddress: string
): Promise<{ success: boolean; boc: string; tonAmount: string; message: string }> {
  console.log(`[중앙화] 시작: ${walletAddress} → ${withdrawalAmount} CSPIN`);

  const gameWalletAddress = env.GAME_WALLET_ADDRESS;
  const cspinTokenAddress = env.CSPIN_TOKEN_ADDRESS;

  if (!gameWalletAddress || !cspinTokenAddress) {
    throw new Error('게임 지갑/토큰 설정 오류');
  }

  // Jetton Transfer Payload 생성
  // ✅ 수정: destination = walletAddress (CSPIN을 받을 사용자)
  //         responseDestination = gameWalletAddress (응답받을 게임 지갑)
  console.log(`[중앙화] Jetton Payload 생성: ${walletAddress} ← ${withdrawalAmount} CSPIN`);
  const jettonPayload = buildJettonTransferPayload(
    toNano(withdrawalAmount.toString()),
    Address.parse(walletAddress),           // ✅ CSPIN을 받을 사용자 주소
    Address.parse(gameWalletAddress)        // ✅ 응답받을 게임 지갑
  );
  console.log(`[중앙화] Jetton Payload 생성 완료`);

  // 내부 메시지 생성
  // 이 메시지: "사용자의 Jetton 지갑에게 위의 Jetton Payload 실행해줘"
  console.log(`[중앙화] 내부 메시지 생성: ${userJettonWalletAddress}로 전송`);
  const transferMessage = internal({
    to: Address.parse(userJettonWalletAddress),  // 사용자의 Jetton 중간 지갑
    value: toNano('0.03'),                       // 가스비 0.03 TON
    body: jettonPayload                          // 위의 Jetton 페이로드 포함
  });
  console.log(`[중앙화] 내부 메시지 생성 완료`);

  // ✅ 여기서 BOC를 생성하지만, seqno는 프론트엔드에서 조회하여 사용해야 함
  // 프론트엔드에서 WalletContractV5R1를 생성하고 서명할 때:
  // seqno = await rpc.getAccountState(userWalletAddress).seqno
  // then create transfer with seqno
  
  // 현재는 단순화: 프론트엔드에서 받은 seqno 사용
  // BOC는 프론트엔드에서 생성하도록 변경 필요

  // 임시: Jetton 페이로드(op code)를 BOC로 변환
  const boc = jettonPayload.toBoc().toString('base64');
  const tonAmount = toNano('0.03').toString();

  console.log(`[중앙화] ✅ BOC 생성 완료 (길이: ${boc.length})`);

  return {
    success: true,
    boc,
    tonAmount,
    message: `중앙화 방식 트랜잭션 생성 완료 (사용자 서명 필요): ${withdrawalAmount} CSPIN`
  };
}
*/

// ============================================================================
// 4. 메인 핸들러
// ============================================================================
export async function onRequestPost(context: any) {
  let env: any;
  let walletAddress: string | undefined;
  let withdrawalAmount: number | undefined;
  
  try {
    const { request } = context;
    env = context.env;

    // 디버그: context 구조 확인
    console.log('[인출-v2.4.0] 함수 시작 - context 디버그:');
    console.log(`  - context 존재: ${!!context}`);
    console.log(`  - context.env 존재: ${!!context.env}`);
    console.log(`  - context 키들:`, Object.keys(context || {}));
    if (context.env) {
      console.log(`  - context.env 키 개수: ${Object.keys(context.env).length}`);
      console.log(`  - context.env의 주요 키들:`, Object.keys(context.env).slice(0, 10));
    }

    // 요청 바디 파싱
    const body = await request.json() as {
      walletAddress?: string;
      withdrawalAmount?: number;
      userJettonWalletAddress?: string; // 프론트엔드에서 계산하여 전달
    };

    walletAddress = body.walletAddress;
    withdrawalAmount = body.withdrawalAmount;

    // 입력 검증
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ success: false, error: '지갑 주소 필수' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!withdrawalAmount || withdrawalAmount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: '유효하지 않은 인출액' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[인출-v2.4.0] 요청: ${walletAddress}, ${withdrawalAmount} CSPIN, RPC 모드`);

    // ✅ 변경: userJettonWalletAddress를 직접 사용 또는 고정값 사용
    // 임시: 고정값 사용 (실제로는 프론트에서 계산하여 전달해야 함)
    let userJettonWalletAddress = body.userJettonWalletAddress;
    
    if (!userJettonWalletAddress) {
      // ⚠️ 임시: 환경변수에서 사용자 Jetton 지갑 주소 받기 또는 계산
      // 현재: 오류 발생
      throw new Error(
        '사용자 Jetton 지갑 주소 필요\n' +
        'userJettonWalletAddress를 요청에 포함시키거나 환경변수 설정 필요'
      );
    }

    // TonCenter v2 RPC 초기화
    // 디버그: 환경변수 확인
    console.log('[인출-v2.4.0] 환경변수 디버그:');
    console.log(`  - TONCENTER_API_KEY 존재: ${!!env.TONCENTER_API_KEY}`);
    console.log(`  - TONCENTER_API_KEY 타입: ${typeof env.TONCENTER_API_KEY}`);
    console.log(`  - TONCENTER_API_KEY 길이: ${env.TONCENTER_API_KEY?.length || 0}`);
    console.log(`  - env 객체 키들:`, Object.keys(env || {}).filter(k => k.includes('API') || k.includes('KEY')));
    
    const tonCenterApiKey = env.TONCENTER_API_KEY;
    if (!tonCenterApiKey) {
      console.error('[인출-v2.4.0] ❌ TONCENTER_API_KEY 없음!');
      console.error('[인출-v2.4.0] 사용 가능한 환경변수:', Object.keys(env || {}));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'TonCenter API 키가 설정되지 않았습니다.',
          debug: {
            hasEnv: !!env,
            envKeys: Object.keys(env || {}).length,
            apiKeyExists: !!env.TONCENTER_API_KEY
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const rpc = new TonCenterV2Rpc(tonCenterApiKey);
    console.log(`[인출-v2.4.0] TonCenter v2 RPC 초기화 완료`);

    // KV에서 사용자 상태 조회
    const stateKey = `state:${walletAddress}`;
    const stateData = await env.CREDIT_KV.get(stateKey);
    const userState: UserState = stateData ? JSON.parse(stateData) : {
      credit: 0,
      canDoubleUp: false,
      pendingWinnings: 0
    };

    console.log(`[인출-v3] 현재 크레딧: ${userState.credit}`);

    // 크레딧 확인
    if (userState.credit < withdrawalAmount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '인출할 크레딧이 부족합니다.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // RPC 방식 인출 실행
    const result = await withdrawViaRpc(rpc, env, walletAddress, withdrawalAmount, userJettonWalletAddress);

    // 크레딧 차감
    userState.credit -= withdrawalAmount;
    userState.canDoubleUp = false;
    userState.pendingWinnings = 0;

    await env.CREDIT_KV.put(stateKey, JSON.stringify(userState));

    // 거래 로그 저장
    const txLogKey = `tx:${walletAddress}:${Date.now()}`;
    await env.CREDIT_KV.put(
      txLogKey,
      JSON.stringify({
        type: 'withdrawal',
        amount: withdrawalAmount,
        mode: 'rpc',
        txHash: result.txHash,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      }),
      { expirationTtl: 86400 * 7 }
    );

    console.log(`[인출-v2.4.0] ✅ 완료: ${walletAddress} -${withdrawalAmount} CSPIN`);

    return new Response(
      JSON.stringify({
        success: true,
        message: result.message,
        txHash: result.txHash,
        newCredit: userState.credit,
        withdrawalAmount,
        mode: 'rpc'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('[인출-v2.4.0] ❌ 오류:', errorMessage);
    console.error('[인출-v2.4.0] 스택:', errorStack);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: {
          walletAddress,
          withdrawalAmount
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}