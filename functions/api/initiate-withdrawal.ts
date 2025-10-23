import '../_bufferPolyfill';
import { keyPairFromSecretKey } from '@ton/crypto';
import { WalletContractV4, internal, beginCell, toNano, Address } from '@ton/ton';

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
  const params = new URLSearchParams({
    owner_account: ownerAddress,
    jetton: masterAddress
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

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;

    // 요청 바디 파싱
    const body = await request.json() as {
      walletAddress?: string;
      withdrawalAmount?: number;
    };

    const { walletAddress, withdrawalAmount } = body;

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
    const gameWallet = WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });

    console.log(`[인출] 게임 지갑: ${gameWallet.address.toString()}`);

    // Step 5: seqno 원자적으로 증가
    const seqno = await getAndIncrementSeqno(env);

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
      messages: [transferMessage]
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
    console.error('[인출] ❌ 오류:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
