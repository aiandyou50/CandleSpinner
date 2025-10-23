import '../_bufferPolyfill';
import { keyPairFromSecretKey } from '@ton/crypto';
import { WalletContractV5R1, internal, beginCell, toNano, Address, SendMode } from '@ton/ton';

/**
 * POST /api/initiate-withdrawal
 * 
 * 사용자의 크레딧을 CSPIN 토큰으로 인출합니다.
 * 
 * 요청:
 * {
 *   walletAddress: string,        // 사용자 지갑 주소
 *   withdrawalAmount: number      // 인출액 (CSPIN)
 * }
 * 
 * 응답:
 * {
 *   success: boolean,
 *   message?: string,
 *   txHash?: string,              // 트랜잭션 해시
 *   error?: string
 * }
 */

interface UserState {
  credit: number;
  canDoubleUp?: boolean;
  pendingWinnings?: number;
}

// Jetton Transfer Payload 생성 (TEP-74 표준)
function buildJettonTransferPayload(
  amount: bigint,
  destination: Address,
  responseTo: Address
): string {
  const cell = beginCell()
    .storeUint(0xf8a7ea5, 32)      // Jetton transfer opcode
    .storeUint(0, 64)              // query_id
    .storeCoins(amount)            // amount
    .storeAddress(destination)     // destination
    .storeAddress(responseTo)      // response_destination
    .storeBit(0)                   // custom_payload
    .storeCoins(BigInt(1))         // forward_ton_amount = 1 nanoton
    .storeBit(0)                   // forward_payload
    .endCell();

  return cell.toBoc().toString('base64');
}

// seqno를 원자적으로 증가시키고 반환
async function getAndIncrementSeqno(env: any): Promise<number> {
  const SEQNO_KEY = 'game_wallet_seqno';
  const maxRetries = 5;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 현재 seqno 읽기
      const current = await env.CREDIT_KV.get(SEQNO_KEY);
      const currentSeqno = current ? parseInt(current) : 0;
      const nextSeqno = currentSeqno + 1;

      // 새로운 seqno 저장 (원자적 - KV put은 원자적 연산)
      await env.CREDIT_KV.put(SEQNO_KEY, nextSeqno.toString());

      console.log(`[seqno] ${currentSeqno} → ${nextSeqno}`);
      return nextSeqno;
    } catch (error) {
      console.error(`[seqno] 시도 ${attempt + 1}/${maxRetries} 실패:`, error);
      if (attempt < maxRetries - 1) {
        await new Promise((res) => setTimeout(res, 100 * (attempt + 1)));
      }
    }
  }

  throw new Error('seqno 업데이트 실패');
}

// TonAPI를 통해 BOC 전송
async function sendBocViaTonAPI(bocBase64: string): Promise<string> {
  // 📝 참고: Ankr RPC URL은 postman.onRequestPost()에서 rpcUrl 변수로 구성됨
  // 향후 Ankr RPC 직접 사용 시 이곳에서 rpcUrl을 전달받아 사용 가능
  const url = 'https://tonapi.io/v1/blockchain/message';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify({ boc: bocBase64 })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TonAPI sendBoc 실패: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.message_hash || 'pending';
}

// TonAPI를 통해 Jetton 지갑 주소 조회
async function getJettonWalletAddress(
  masterAddress: string,
  ownerAddress: string
): Promise<string> {
  const url = 'https://tonapi.io/v2/jettons/wallets';
  
  // 주소 형식 정규화 (raw format 0:xxx → user-friendly format UQA...)
  let normalizedMasterAddress = masterAddress;
  let normalizedOwnerAddress = ownerAddress;
  
  try {
    // raw format이면 user-friendly로 변환
    if (masterAddress.includes(':')) {
      normalizedMasterAddress = Address.parse(masterAddress).toString();
    }
    if (ownerAddress.includes(':')) {
      normalizedOwnerAddress = Address.parse(ownerAddress).toString();
    }
    
    console.log(`[TonAPI] 주소 정규화: master=${normalizedMasterAddress}, owner=${normalizedOwnerAddress}`);
  } catch (parseError) {
    console.error('[TonAPI] 주소 파싱 오류:', parseError);
    // 파싱 실패해도 원본 주소로 계속 시도
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

// 게임 지갑의 TON 잔액 확인
async function getGameWalletTonBalance(gameWalletAddress: string): Promise<{ balance: bigint; isEnough: boolean }> {
  try {
    const url = `https://tonapi.io/v2/accounts/${gameWalletAddress}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'accept': 'application/json' }
    });

    if (!response.ok) {
      console.warn(`[잔액 조회] 실패: ${response.status}`);
      // 실패해도 진행 시도 (잔액 조회는 선택사항)
      return { balance: BigInt(0), isEnough: true };
    }

    const data = await response.json();
    const balance = BigInt(data.balance || 0);
    
    // TON 수수료 기준: 0.05 TON (충분한 여유)
    const requiredTon = BigInt('50000000'); // 0.05 TON in nanotons
    const isEnough = balance >= requiredTon;

    console.log(`[잔액 조회] 게임 지갑: ${(Number(balance) / 1e9).toFixed(4)} TON (필요: 0.05 TON, 충분: ${isEnough})`);

    return { balance, isEnough };
  } catch (error) {
    console.error('[잔액 조회] 오류:', error);
    return { balance: BigInt(0), isEnough: true }; // 오류 시 진행
  }
}

export async function onRequestPost(context: any) {
  let env: any;
  let walletAddress: string | undefined;
  let withdrawalAmount: number | undefined;
  
  try {
    const { request, context: requestContext } = context;
    env = context.env;

    // ✅ RPC URL 구성 (Ankr API 키를 동적으로 추가)
    const backendRpcUrl = env.BACKEND_RPC_URL || 'https://rpc.ankr.com/ton_api_v2';
    const tonRpcApiKey = env.TON_RPC_API_KEY;
    const rpcUrl = tonRpcApiKey 
      ? `${backendRpcUrl}/${tonRpcApiKey}`
      : backendRpcUrl;
    
    console.log(`[RPC] 사용 중인 URL: ${rpcUrl.replace(tonRpcApiKey || '', '***API_KEY***')}`);

    // 요청 바디 파싱
    const body = await request.json() as {
      walletAddress?: string;
      withdrawalAmount?: number;
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

    console.log(`[인출] 요청: ${walletAddress} → ${withdrawalAmount} CSPIN`);

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

    // Step 3: 환경 변수 확인
    const gameWalletPrivateKey = env.GAME_WALLET_PRIVATE_KEY;
    const gameWalletAddress = env.GAME_WALLET_ADDRESS;
    const cspinTokenAddress = env.CSPIN_TOKEN_ADDRESS;

    if (!gameWalletPrivateKey || !gameWalletAddress || !cspinTokenAddress) {
      console.error('[인출] 환경변수 누락:', { gameWalletPrivateKey: !!gameWalletPrivateKey, gameWalletAddress, cspinTokenAddress });
      return new Response(
        JSON.stringify({
          success: false,
          error: '서버 설정 오류'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: 게임 지갑 생성
    const keyPair = keyPairFromSecretKey(Buffer.from(gameWalletPrivateKey, 'hex'));
    const gameWallet = WalletContractV5R1.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });

    console.log(`[인출] 게임 지갑: ${gameWallet.address.toString()}`);

    // Step 5: seqno 원자적으로 증가
    const seqno = await getAndIncrementSeqno(env);

    // Step 5.5: 게임 지갑의 TON 잔액 확인 (경고만)
    const tonStatus = await getGameWalletTonBalance(gameWallet.address.toString());
    if (!tonStatus.isEnough) {
      console.warn(`⚠️ 게임 지갑의 TON 부족: ${(Number(tonStatus.balance) / 1e9).toFixed(4)} TON`);
      // 경고만 하고 계속 진행 (실패할 가능성 있음)
    }

    // Step 6: 게임 지갑의 CSPIN Jetton 지갑 주소 조회
    const gameJettonWalletAddress = await getJettonWalletAddress(
      cspinTokenAddress,
      gameWallet.address.toString()
    );

    console.log(`[인출] 게임 Jetton 지갑: ${gameJettonWalletAddress}`);

    // Step 7: Jetton Transfer Payload 생성
    const jettonPayload = buildJettonTransferPayload(
      toNano(withdrawalAmount.toString()),
      Address.parse(walletAddress),
      gameWallet.address
    );

    // Step 8: 내부 메시지 생성
    const transferMessage = internal({
      to: Address.parse(gameJettonWalletAddress),
      value: toNano('0.03'),
      body: jettonPayload
    });

    // Step 9: 트랜잭션 생성
    const transfer = gameWallet.createTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [transferMessage],
      sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS
    });

    // Step 10: BOC 생성 및 전송
    const boc = transfer.toBoc().toString('base64');
    const txHash = await sendBocViaTonAPI(boc);

    console.log(`[인출] 트랜잭션 발송 성공: ${txHash}`);

    // Step 11: KV에서 크레딧 차감 (트랜잭션 성공 후)
    userState.credit -= withdrawalAmount;
    userState.canDoubleUp = false;
    userState.pendingWinnings = 0;

    await env.CREDIT_KV.put(stateKey, JSON.stringify(userState));

    // Step 12: 거래 로그 저장
    const txLogKey = `tx:${walletAddress}:${Date.now()}`;
    await env.CREDIT_KV.put(
      txLogKey,
      JSON.stringify({
        type: 'withdrawal',
        amount: withdrawalAmount,
        txHash,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      }),
      { expirationTtl: 86400 * 7 } // 7일 보관
    );

    console.log(`[인출] ✅ 완료: ${walletAddress} -${withdrawalAmount} CSPIN (남은 잔액: ${userState.credit})`);

    return new Response(
      JSON.stringify({
        success: true,
        message: '인출 완료',
        txHash,
        newCredit: userState.credit,
        withdrawalAmount
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('[인출] ❌ 오류:', errorMessage);
    console.error('[인출] 스택:', errorStack);

    // KV에 오류 로그 저장 (나중에 조회 가능)
    try {
      await env.CREDIT_KV.put(
        'withdrawal_last_error',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          error: errorMessage,
          stack: errorStack,
          walletAddress: walletAddress || 'unknown',
          withdrawalAmount: withdrawalAmount || 0
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
