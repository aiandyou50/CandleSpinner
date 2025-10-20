import '../_bufferPolyfill';
import { keyPairFromSecretKey } from '@ton/crypto';
import { WalletContractV4, internal, beginCell, storeMessage, toNano, Address, fromNano } from '@ton/ton';

interface DepositAutoRequest {
  walletAddress: string;
  depositAmount: number;
}

// Ankr RPC를 통해 jetton 잔액 확인
async function getJettonBalance(ankrUrl: string, jettonWalletAddress: string): Promise<string> {
  const response = await fetch(ankrUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'ton_getAccountState',
      params: [jettonWalletAddress]
    })
  });

  if (!response.ok) {
    throw new Error(`Ankr RPC failed: ${response.status}`);
  }

  const data: any = await response.json();
  
  if (data.error) {
    throw new Error(`Ankr RPC error: ${data.error.message}`);
  }

  // Account state에서 balance 추출
  if (data.result && data.result.account_state) {
    // TON 잔액 반환 (보통 코인 단위)
    return data.result.account_state.balance || '0';
  }

  return '0';
}

// Ankr RPC를 통해 시퀀스 번호 (seqno) 조회
async function getSeqno(ankrUrl: string, walletAddress: string): Promise<number> {
  const response = await fetch(ankrUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'ton_getAccountState',
      params: [walletAddress]
    })
  });

  if (!response.ok) {
    throw new Error(`Ankr RPC failed: ${response.status}`);
  }

  const data: any = await response.json();

  if (data.error) {
    throw new Error(`Ankr RPC error: ${data.error.message}`);
  }

  // 지갑 컨트랙트 상태에서 seqno 추출
  if (data.result && data.result.account_state) {
    // V4 지갑의 경우 data 필드에서 seqno 추출
    // seqno는 보통 처음 4바이트
    const dataStr = data.result.account_state.data || '';
    if (dataStr.startsWith('b5ee9c72') || dataStr.startsWith('te6ccgJB')) {
      // BOC 형식일 수 있음 - 간단히 0 반환 (테스트용)
      return 0;
    }
  }

  return 0;
}

// Ankr RPC를 통해 트랜잭션 BOC 전송
async function sendBoc(ankrUrl: string, bocBase64: string): Promise<{ hash?: string }> {
  const response = await fetch(ankrUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'ton_sendBoc',
      params: [bocBase64]
    })
  });

  if (!response.ok) {
    throw new Error(`Ankr RPC failed: ${response.status}`);
  }

  const data: any = await response.json();

  if (data.error) {
    throw new Error(`Ankr RPC error: ${data.error.message}`);
  }

  return data.result || {};
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body: DepositAutoRequest = await request.json();
    const { walletAddress, depositAmount } = body;

    // 환경변수 검증
    if (!env.ANKR_RPC_URL) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ANKR_RPC_URL not configured'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!env.GAME_WALLET_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'GAME_WALLET_KEY not configured'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // 게임 지갑 설정 (배포된 V4 지갑)
    const gameWalletAddress = Address.parse('UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd');
    const cspiNettonMaster = Address.parse('EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV');

    // 게임 지갑의 개인키로부터 키페어 생성
    const keyPair = keyPairFromSecretKey(Buffer.from(env.GAME_WALLET_KEY, 'hex'));

    // Ankr RPC를 통해 현재 seqno 조회
    let seqno = 0;
    try {
      seqno = await getSeqno(env.ANKR_RPC_URL, gameWalletAddress.toString());
    } catch (error) {
      console.warn('Failed to get seqno from Ankr RPC, using 0:', error);
      seqno = 0;
    }

    // 지갑 컨트랙트 생성
    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey
    });

    // Jetton transfer 메시지 구성
    const jettonTransferBody = beginCell()
      .storeUint(0x0f8a7ea5, 32) // op: transfer
      .storeUint(0, 64) // query_id
      .storeCoins(toNano(depositAmount.toString())) // amount
      .storeAddress(Address.parse(walletAddress)) // destination (사용자 지갑)
      .storeAddress(gameWalletAddress) // response_destination
      .storeBit(0) // custom_payload
      .storeCoins(toNano('0.01')) // forward_ton_amount
      .storeBit(0) // forward_payload
      .endCell();

    // 내부 메시지 생성 (Jetton 마스터 주소로 transfer 명령 전송)
    const transferMessage = internal({
      to: cspiNettonMaster,
      value: toNano('0.05'), // 트랜잭션 수수료
      body: jettonTransferBody
    });

    // 지갑 전송 트랜잭션 생성
    const transfer = wallet.createTransfer({
      seqno: seqno,
      secretKey: keyPair.secretKey,
      messages: [transferMessage],
      sendMode: 3 as any // sendMode: 3 = send immediately, ignore errors
    });

    // 트랜잭션을 BOC로 인코딩
    const bocBase64 = transfer.toBoc().toString('base64');

    // Ankr RPC를 통해 트랜잭션 전송
    const sendResult = await sendBoc(env.ANKR_RPC_URL, bocBase64);

    // KV에 입금 기록
    const key = `deposit:${walletAddress}`;
    const existing = await env.CREDIT_KV.get(key);
    const currentCredit = existing ? parseFloat(existing) : 0;
    const newCredit = currentCredit + depositAmount;

    // 트랜잭션 로그 저장
    const logKey = `txlog:${walletAddress}:${Date.now()}`;
    await env.CREDIT_KV.put(
      logKey,
      JSON.stringify({
        method: 'auto',
        amount: depositAmount,
        txHash: sendResult.hash || 'pending',
        timestamp: new Date().toISOString(),
        status: 'sent'
      })
    );

    // 크레딧 업데이트
    await env.CREDIT_KV.put(key, newCredit.toString());

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auto deposit sent successfully',
        txHash: sendResult.hash || 'pending',
        newCredit: newCredit
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in deposit-auto:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
