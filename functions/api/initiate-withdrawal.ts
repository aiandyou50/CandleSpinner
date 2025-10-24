import '../_bufferPolyfill';
import { keyPairFromSecretKey } from '@ton/crypto';
import { WalletContractV5R1, internal, beginCell, toNano, Address, SendMode, Cell } from '@ton/ton';
import { AnkrRpc, SeqnoManager } from './rpc-utils';

/**
 * POST /api/initiate-withdrawal (v2)
 * 
 * 사용자의 크레딧을 CSPIN 토큰으로 인출합니다.
 * ✅ v2 개선사항:
 * 1. Ankr RPC를 정확하게 활용하여 트랜잭션 발송
 * 2. 사용자 지갑에서 가스비 지불 (게임 지갑이 아님)
 * 3. 두 가지 인출 방식 모두 지원:
 *    - RPC 방식: 게임 지갑에서 서명하여 Jetton 전송
 *    - 중앙화 방식: 사용자 지갑에서 Jetton 계약에 직접 전송 요청
 * 
 * 요청:
 * {
 *   walletAddress: string,        // 사용자 지갑 주소
 *   withdrawalAmount: number,     // 인출액 (CSPIN)
 *   mode?: 'rpc' | 'centralized'  // 인출 방식 (기본값: 'centralized')
 * }
 * 
 * 응답:
 * {
 *   success: boolean,
 *   message?: string,
 *   txHash?: string,
 *   boc?: string,                 // 트랜잭션 BOC (사용자가 서명해야 함 - centralized 모드)
 *   tonAmount?: string,           // 실제 가스 비용 (nanoTON)
 *   error?: string
 * }
 */

interface UserState {
  credit: number;
  canDoubleUp?: boolean;
  pendingWinnings?: number;
}

interface JettonTransferMessage {
  type: 'jetton';
  amount: string;
  destination: string;
  responseDestination: string;
}

// ============================================================================
// 1. Jetton Transfer Payload 생성 (TEP-74 표준)
// ============================================================================
function buildJettonTransferPayload(
  amount: bigint,
  destination: Address,
  responseTo: Address,
  forwardTonAmount: bigint = BigInt(1) // 1 nanoton
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
// 2. TonAPI를 통해 Jetton 지갑 주소 조회
// ============================================================================
async function getJettonWalletAddress(
  masterAddress: string,
  ownerAddress: string
): Promise<string> {
  const url = 'https://tonapi.io/v2/jettons/wallets';
  
  // 주소 형식 정규화
  let normalizedMasterAddress = masterAddress;
  let normalizedOwnerAddress = ownerAddress;
  
  try {
    if (masterAddress.includes(':')) {
      normalizedMasterAddress = Address.parse(masterAddress).toString();
    }
    if (ownerAddress.includes(':')) {
      normalizedOwnerAddress = Address.parse(ownerAddress).toString();
    }
  } catch (parseError) {
    console.warn('[TonAPI] 주소 파싱 경고:', parseError);
  }
  
  const params = new URLSearchParams({
    owner_account: normalizedOwnerAddress,
    jetton: normalizedMasterAddress
  });

  const response = await fetch(`${url}?${params}`, {
    method: 'GET',
    headers: { 'accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`TonAPI Jetton 지갑 조회 실패: ${response.status}`);
  }

  const data = await response.json();
  if (!data.addresses || data.addresses.length === 0) {
    throw new Error('Jetton 지갑 주소 없음');
  }

  return data.addresses[0];
}

// ============================================================================
// 3. RPC 방식 인출 (게임 지갑에서 서명)
// ============================================================================
async function withdrawViaRpc(
  rpc: AnkrRpc,
  env: any,
  walletAddress: string,
  withdrawalAmount: number
): Promise<{ success: boolean; txHash: string; message: string }> {
  console.log(`[인출-RPC] 시작: ${walletAddress} → ${withdrawalAmount} CSPIN`);

  // 환경 변수 확인
  const gameWalletPrivateKey = env.GAME_WALLET_PRIVATE_KEY;
  const gameWalletAddress = env.GAME_WALLET_ADDRESS;
  const cspinTokenAddress = env.CSPIN_TOKEN_ADDRESS;

  if (!gameWalletPrivateKey || !gameWalletAddress || !cspinTokenAddress) {
    throw new Error('게임 지갑 설정 오류: 필수 환경 변수 누락');
  }

  // 게임 지갑 생성
  const keyPair = keyPairFromSecretKey(Buffer.from(gameWalletPrivateKey, 'hex'));
  const gameWallet = WalletContractV5R1.create({
    publicKey: keyPair.publicKey,
    workchain: 0
  });

  console.log(`[인출-RPC] 게임 지갑: ${gameWallet.address.toString()}`);

  // seqno 조회
  const seqnoManager = new SeqnoManager(rpc, env.CREDIT_KV, gameWallet.address.toString());
  const seqno = await seqnoManager.getAndIncrementSeqno();

  // TON 잔액 확인
  const tonBalance = await rpc.getBalance(gameWallet.address.toString());
  const requiredTon = BigInt('50000000'); // 0.05 TON
  
  if (tonBalance < requiredTon) {
    throw new Error(
      `게임 지갑 TON 부족: ${(Number(tonBalance) / 1e9).toFixed(4)} TON (필요: 0.05 TON)`
    );
  }

  // Jetton 지갑 주소 조회
  const gameJettonWalletAddress = await getJettonWalletAddress(
    cspinTokenAddress,
    gameWallet.address.toString()
  );

  console.log(`[인출-RPC] 게임 Jetton 지갑: ${gameJettonWalletAddress}`);

  // Jetton Transfer Payload 생성
  const jettonPayload = buildJettonTransferPayload(
    toNano(withdrawalAmount.toString()),
    Address.parse(walletAddress),
    gameWallet.address
  );

  // 내부 메시지 생성
  const transferMessage = internal({
    to: Address.parse(gameJettonWalletAddress),
    value: toNano('0.03'),
    body: jettonPayload
  });

  // 트랜잭션 생성
  const transfer = gameWallet.createTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [transferMessage],
    sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS
  });

  // BOC 생성 및 RPC로 전송
  const boc = transfer.toBoc().toString('base64');
  const txHash = await rpc.sendBoc(boc);

  console.log(`[인출-RPC] ✅ 완료: ${txHash}`);

  return {
    success: true,
    txHash,
    message: `RPC 방식 인출 완료: ${withdrawalAmount} CSPIN`
  };
}

// ============================================================================
// 4. 중앙화 방식 인출 (사용자 지갑에서 직접 서명 가능한 트랜잭션 생성)
// ============================================================================
async function withdrawViaCentralized(
  rpc: AnkrRpc,
  env: any,
  walletAddress: string,
  withdrawalAmount: number
): Promise<{ success: boolean; boc: string; tonAmount: string; message: string }> {
  console.log(`[인출-중앙화] 시작: ${walletAddress} → ${withdrawalAmount} CSPIN`);

  const gameWalletAddress = env.GAME_WALLET_ADDRESS;
  const cspinTokenAddress = env.CSPIN_TOKEN_ADDRESS;

  if (!gameWalletAddress || !cspinTokenAddress) {
    throw new Error('게임 지갑/토큰 설정 오류: 필수 환경 변수 누락');
  }

  // 사용자의 Jetton 지갑 주소 조회
  const userJettonWalletAddress = await getJettonWalletAddress(
    cspinTokenAddress,
    walletAddress
  );

  console.log(`[인출-중앙화] 사용자 Jetton 지갑: ${userJettonWalletAddress}`);

  // Jetton Transfer Payload 생성
  // ✅ 사용자 지갑에서 서명하여 자신의 Jetton에서 게임 지갑으로 전송
  const jettonPayload = buildJettonTransferPayload(
    toNano(withdrawalAmount.toString()),
    Address.parse(gameWalletAddress),  // 게임 지갑으로 전송 (인출 = 게임 지갑에 입금)
    Address.parse(walletAddress)       // 응답은 사용자 주소로
  );

  // 내부 메시지 생성
  // ✅ 중요: 트랜잭션 수수료는 사용자 지갑에서 지불
  const transferMessage = internal({
    to: Address.parse(userJettonWalletAddress),
    value: toNano('0.03'),             // 가스 비용 (사용자 지갑에서 지불)
    body: jettonPayload
  });

  // 사용자 지갑 컨트랙트 생성
  const userWallet = WalletContractV5R1.create({
    publicKey: Buffer.alloc(32),  // 공개키 필요 없음 (사용자가 서명함)
    workchain: 0
  });

  // ✅ seqno는 사용자가 나중에 서명할 때 실제로 조회되어야 함
  // 여기서는 프론트엔드에서 최신 seqno를 조회하고 트랜잭션을 생성하는 방식 사용
  const seqno = 0; // 플레이스홀더 (프론트엔드에서 실제 seqno 사용)

  // 더미 비밀 키로 트랜잭션 생성 (사용자가 나중에 서명)
  const dummyKeyPair = {
    publicKey: Buffer.alloc(32),
    secretKey: Buffer.alloc(64)
  };

  const transfer = userWallet.createTransfer({
    seqno,
    secretKey: dummyKeyPair.secretKey,
    messages: [transferMessage],
    sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS
  });

  const boc = transfer.toBoc().toString('base64');
  const gasAmount = toNano('0.03').toString();

  console.log(`[인출-중앙화] BOC 생성 완료 (가스: ${gasAmount} nanoTON)`);

  return {
    success: true,
    boc,
    tonAmount: gasAmount,
    message: `중앙화 방식 트랜잭션 생성 완료 (사용자 서명 필요): ${withdrawalAmount} CSPIN`
  };
}


// ============================================================================
// 5. 메인 핸들러
// ============================================================================
export async function onRequestPost(context: any) {
  let env: any;
  let walletAddress: string | undefined;
  let withdrawalAmount: number | undefined;
  let withdrawalMode: 'rpc' | 'centralized' = 'centralized'; // 기본값: 중앙화 방식
  
  try {
    const { request } = context;
    env = context.env;

    // 요청 바디 파싱
    const body = await request.json() as {
      walletAddress?: string;
      withdrawalAmount?: number;
      mode?: 'rpc' | 'centralized';
    };

    walletAddress = body.walletAddress;
    withdrawalAmount = body.withdrawalAmount;
    withdrawalMode = body.mode || 'centralized';

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

    // RPC 초기화
    const ankrJsonRpcUrl = env.ANKR_JSON_RPC_HTTPS_ENDPOINT;
    if (!ankrJsonRpcUrl) {
      throw new Error('ANKR_JSON_RPC_HTTPS_ENDPOINT 환경변수 미설정');
    }
    
    const rpc = new AnkrRpc(ankrJsonRpcUrl);
    console.log(`[인출] 초기화 - 모드: ${withdrawalMode}, 금액: ${withdrawalAmount} CSPIN`);

    // Step 1: KV에서 사용자 상태 조회
    const stateKey = `state:${walletAddress}`;
    const stateData = await env.CREDIT_KV.get(stateKey);
    const userState: UserState = stateData ? JSON.parse(stateData) : {
      credit: 0,
      canDoubleUp: false,
      pendingWinnings: 0
    };

    console.log(`[인출] 현재 크레딧: ${userState.credit}`);

    // Step 2: 크레딧 확인
    if (userState.credit < withdrawalAmount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '인출할 크레딧이 부족합니다.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: 모드별 인출 실행
    let result: any;

    if (withdrawalMode === 'rpc') {
      // RPC 방식: 게임 지갑에서 즉시 서명하여 전송
      result = await withdrawViaRpc(rpc, env, walletAddress, withdrawalAmount);
    } else {
      // 중앙화 방식: 사용자가 서명할 트랜잭션 BOC 생성
      result = await withdrawViaCentralized(rpc, env, walletAddress, withdrawalAmount);
    }

    // Step 4: 크레딧 차감 (중앙화 모드에서도 즉시 차감)
    userState.credit -= withdrawalAmount;
    userState.canDoubleUp = false;
    userState.pendingWinnings = 0;

    await env.CREDIT_KV.put(stateKey, JSON.stringify(userState));

    // Step 5: 거래 로그 저장
    const txLogKey = `tx:${walletAddress}:${Date.now()}`;
    await env.CREDIT_KV.put(
      txLogKey,
      JSON.stringify({
        type: 'withdrawal',
        amount: withdrawalAmount,
        mode: withdrawalMode,
        txHash: result.txHash || 'pending',
        timestamp: new Date().toISOString(),
        status: withdrawalMode === 'rpc' ? 'confirmed' : 'pending_user_signature'
      }),
      { expirationTtl: 86400 * 7 }
    );

    console.log(`[인출] ✅ 완료 (${withdrawalMode}): ${walletAddress} -${withdrawalAmount} CSPIN`);

    return new Response(
      JSON.stringify({
        success: true,
        message: result.message,
        txHash: result.txHash,
        boc: result.boc,
        tonAmount: result.tonAmount,
        newCredit: userState.credit,
        withdrawalAmount,
        mode: withdrawalMode
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('[인출] ❌ 오류:', errorMessage);
    console.error('[인출] 스택:', errorStack);

    // KV에 오류 로그 저장
    try {
      await env.CREDIT_KV.put(
        'withdrawal_last_error',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          error: errorMessage,
          stack: errorStack,
          walletAddress: walletAddress || 'unknown',
          withdrawalAmount: withdrawalAmount || 0,
          mode: withdrawalMode
        })
      );
    } catch (logError) {
      console.error('[인출] 로그 저장 실패:', logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        errorType: error?.constructor?.name || 'Unknown'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
