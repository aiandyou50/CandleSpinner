/**
 * 인출 핸들러
 * RPC 방식으로 게임 지갑에서 사용자에게 Jetton Transfer
 * Cloudflare Workers 환경에서 동작하도록 최적화
 */

// Buffer 폴리필 (Cloudflare Workers용)
import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

import {
  WalletContractV5R1,
  internal,
  beginCell,
  toNano,
  Address,
  SendMode,
  Cell,
} from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

interface Env {
  CREDIT_KV: KVNamespace;
  GAME_WALLET_MNEMONIC: string;
  GAME_WALLET_ADDRESS: string;
  CSPIN_JETTON_MASTER: string;
  TONCENTER_API_KEY?: string;
}

/**
 * Jetton Transfer Payload 생성 (TEP-74 표준)
 * 입금과 동일한 구조, destination만 사용자 TON 지갑으로 변경
 */
function buildJettonTransferPayload(
  amount: bigint,
  destination: Address,  // ← 사용자 TON 지갑
  responseTo: Address,   // ← 게임 TON 지갑
  forwardTonAmount: bigint = BigInt(1)  // ✅ 1 nanoton
): Cell {
  return beginCell()
    .storeUint(0xf8a7ea5, 32)      // op: jetton transfer
    .storeUint(0, 64)              // query_id
    .storeCoins(amount)            // 인출액
    .storeAddress(destination)     // ✅ 사용자 TON 지갑
    .storeAddress(responseTo)      // 게임 TON 지갑
    .storeBit(0)                   // custom_payload (none)
    .storeCoins(forwardTonAmount)  // ✅ 1 nanoton
    .storeBit(0)                   // forward_payload (none)
    .endCell();
}

/**
 * 게임 지갑 생성 (니모닉에서 키 쌍 추출)
 */
async function getGameWallet(mnemonic: string): Promise<{
  wallet: WalletContractV5R1;
  keyPair: { publicKey: Buffer; secretKey: Buffer };
}> {
  console.log('[getGameWallet] 니모닉 → 키 쌍 변환 시작');
  
  // 니모닉 → 키 쌍
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  console.log('[getGameWallet] 키 쌍 변환 완료');
  
  // WalletV5R1 생성
  const wallet = WalletContractV5R1.create({
    publicKey: keyPair.publicKey,
    workchain: 0,
  });
  
  console.log(`[getGameWallet] 지갑 주소: ${wallet.address.toString()}`);
  
  return { wallet, keyPair };
}

/**
 * seqno 조회 및 증가 (원자성 확보)
 * KV에 저장하여 동시 요청 시 충돌 방지
 */
async function getAndIncrementSeqno(
  env: Env,
  gameWalletAddress: string
): Promise<number> {
  const key = `seqno:${gameWalletAddress}`;
  
  console.log(`[seqno] KV 조회 시작: ${key}`);
  
  // KV에서 조회
  const stored = await env.CREDIT_KV.get(key, 'json') as { seqno: number } | null;
  
  if (!stored) {
    console.log('[seqno] KV에 없음, RPC에서 실제 seqno 조회');
    
    // 첫 사용: RPC에서 실제 seqno 조회
    const apiKey = env.TONCENTER_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
      console.log('[seqno] TONCENTER_API_KEY 사용');
    } else {
      console.warn('[seqno] ⚠️ TONCENTER_API_KEY 없음 (Rate Limit 주의)');
    }
    
    const response = await fetch(
      `https://toncenter.com/api/v2/getAddressState?address=${gameWalletAddress}`,
      { headers }
    );
    
    const data = await response.json() as { ok: boolean; result?: { seqno?: number } };
    
    if (!response.ok || !data.ok) {
      throw new Error(`seqno 조회 실패: ${JSON.stringify(data)}`);
    }
    
    const currentSeqno = data.result?.seqno || 0;
    console.log(`[seqno] RPC 조회 결과: ${currentSeqno}`);
    
    // KV에 저장 (다음 seqno)
    await env.CREDIT_KV.put(key, JSON.stringify({ seqno: currentSeqno + 1 }));
    console.log(`[seqno] KV 저장 완료: ${currentSeqno + 1}`);
    
    return currentSeqno;
  }
  
  // 저장된 seqno 증가
  const nextSeqno = stored.seqno;
  console.log(`[seqno] KV 저장된 값 사용: ${nextSeqno}`);
  
  await env.CREDIT_KV.put(key, JSON.stringify({ seqno: nextSeqno + 1 }));
  console.log(`[seqno] KV 업데이트 완료: ${nextSeqno + 1}`);
  
  return nextSeqno;
}

/**
 * 게임의 Jetton Wallet 주소 계산
 * (입금의 userJettonWalletAddress와 동일한 로직)
 */
async function getGameJettonWalletAddress(
  env: Env
): Promise<string> {
  console.log('[getGameJettonWallet] 계산 시작');
  console.log(`[getGameJettonWallet] Jetton Master: ${env.CSPIN_JETTON_MASTER}`);
  console.log(`[getGameJettonWallet] 게임 TON 지갑: ${env.GAME_WALLET_ADDRESS}`);
  
  const apiKey = env.TONCENTER_API_KEY;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
    console.log('[getGameJettonWallet] TONCENTER_API_KEY 사용');
  } else {
    console.warn('[getGameJettonWallet] ⚠️ TONCENTER_API_KEY 없음 (Rate Limit 주의)');
  }
  
  const response = await fetch(
    `https://toncenter.com/api/v2/runGetMethod`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        address: env.CSPIN_JETTON_MASTER,  // Jetton Master
        method: 'get_wallet_address',
        stack: [
          ['tvm.Slice', Address.parse(env.GAME_WALLET_ADDRESS).toRawString()]
        ]
      })
    }
  );
  
  const data = await response.json() as {
    ok: boolean;
    result?: {
      stack?: Array<[string, { bytes?: string }]>;
    };
  };
  
  if (!response.ok || !data.ok) {
    throw new Error(`Jetton Wallet 주소 계산 실패: ${JSON.stringify(data)}`);
  }
  
  const stackItem = data.result?.stack?.[0];
  if (!stackItem || !stackItem[1]?.bytes) {
    throw new Error(`Jetton Wallet 주소 파싱 실패: ${JSON.stringify(data.result)}`);
  }
  
  const cell = Cell.fromBase64(stackItem[1].bytes);
  const address = cell.beginParse().loadAddress();
  const gameJettonWallet = address.toString({ urlSafe: true, bounceable: true });
  
  console.log(`[getGameJettonWallet] 계산 완료: ${gameJettonWallet}`);
  
  return gameJettonWallet;
}

/**
 * 인출 처리 (RPC 방식)
 * 게임 지갑에서 사용자에게 Jetton Transfer
 */
export async function processWithdrawal(
  env: Env,
  userWalletAddress: string,
  withdrawAmount: number
): Promise<{ success: boolean; txHash: string }> {
  console.log('=== 인출 처리 시작 ===');
  console.log(`사용자 지갑: ${userWalletAddress}`);
  console.log(`인출 금액: ${withdrawAmount} CSPIN`);
  
  // 1. 환경변수 확인
  const { GAME_WALLET_MNEMONIC, GAME_WALLET_ADDRESS, CSPIN_JETTON_MASTER, TONCENTER_API_KEY } = env;
  
  if (!GAME_WALLET_MNEMONIC) {
    throw new Error('환경변수 누락: GAME_WALLET_MNEMONIC');
  }
  if (!GAME_WALLET_ADDRESS) {
    throw new Error('환경변수 누락: GAME_WALLET_ADDRESS');
  }
  if (!CSPIN_JETTON_MASTER) {
    throw new Error('환경변수 누락: CSPIN_JETTON_MASTER');
  }
  
  console.log('[환경변수] 확인 완료');
  console.log(`[환경변수] TONCENTER_API_KEY: ${TONCENTER_API_KEY ? '있음' : '없음 (Rate Limit 주의)'}`);
  
  // 2. 게임 지갑 생성
  const { wallet: gameWallet, keyPair } = await getGameWallet(GAME_WALLET_MNEMONIC);
  console.log(`[게임 지갑] ${gameWallet.address.toString()}`);
  
  // 3. seqno 조회 (원자성)
  const seqno = await getAndIncrementSeqno(env, gameWallet.address.toString());
  console.log(`[seqno] ${seqno}`);
  
  // 4. 게임 Jetton Wallet 주소 계산
  const gameJettonWallet = await getGameJettonWalletAddress(env);
  console.log(`[게임 Jetton Wallet] ${gameJettonWallet}`);
  
  // 5. Jetton Transfer Payload 생성
  const amountNano = toNano(withdrawAmount.toString());
  console.log(`[금액] ${withdrawAmount} CSPIN = ${amountNano} nanotoken`);
  
  const payload = buildJettonTransferPayload(
    amountNano,
    Address.parse(userWalletAddress),  // ✅ destination: 사용자 TON 지갑
    gameWallet.address                 // responseTo: 게임 TON 지갑
  );
  console.log('[Payload] Jetton Transfer Payload 생성 완료');
  
  // 6. 내부 메시지 생성
  const internalMessage = internal({
    to: Address.parse(gameJettonWallet),  // ✅ 게임 Jetton Wallet (메시지 수신자)
    value: toNano('0.05'),                // 수수료
    body: payload
  });
  console.log('[Internal Message] 생성 완료 (수수료: 0.05 TON)');
  
  // 7. 트랜잭션 생성 (게임 지갑 서명)
  const transfer = gameWallet.createTransfer({
    seqno,
    secretKey: keyPair.secretKey,  // ✅ 게임 지갑 개인키
    messages: [internalMessage],
    sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS
  });
  console.log('[Transfer] 트랜잭션 생성 완료');
  
  // 8. BOC 생성
  const boc = transfer.toBoc().toString('base64');
  console.log(`[BOC] 생성 완료 (길이: ${boc.length})`);
  
  // 9. TonCenter v2 sendBoc
  console.log('[TonCenter] BOC 전송 시작...');
  
  const apiKey = TONCENTER_API_KEY;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
    console.log('[TonCenter] TONCENTER_API_KEY 사용');
  } else {
    console.warn('[TonCenter] ⚠️ TONCENTER_API_KEY 없음 (Rate Limit 주의)');
  }
  
  const sendResponse = await fetch(
    'https://toncenter.com/api/v2/sendBoc',
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ boc })
    }
  );
  
  const sendData = await sendResponse.json() as {
    ok: boolean;
    result?: { hash?: string };
    error?: string;
  };
  
  if (!sendResponse.ok || !sendData.ok) {
    console.error('[TonCenter] BOC 전송 실패:', sendData);
    throw new Error(`BOC 전송 실패: ${sendData.error || 'Unknown error'}`);
  }
  
  const txHash = sendData.result?.hash;
  if (!txHash) {
    throw new Error('트랜잭션 해시 없음');
  }
  
  console.log(`✅ 인출 성공: ${txHash}`);
  console.log('=== 인출 처리 완료 ===');
  
  return {
    success: true,
    txHash
  };
}
