/**
 * 입금 확인 API
 * 사용자의 Jetton Transfer 트랜잭션을 TonCenter로 조회하고 크레딧 증가
 */

import { Env } from '../_worker';
import { getCreditData, updateCredit } from '../lib/credit-manager';
import { TonCenterClient } from '../lib/ton-client';

export async function verifyDeposit(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { walletAddress: string; txHash: string };
    const { walletAddress, txHash } = body;

    if (!walletAddress || !txHash) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing walletAddress or txHash' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // TonCenter로 트랜잭션 조회
    const tonClient = new TonCenterClient(env.TONCENTER_API_KEY);
    const transaction = await tonClient.getTransaction(txHash);

    if (!transaction) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Transaction not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 트랜잭션 검증
    // 1. To 주소가 게임 지갑인지 확인
    if (transaction.to !== env.GAME_WALLET_ADDRESS) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid recipient address' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 2. Jetton Transfer인지 확인 (op code 0x0f8a7ea5)
    if (!transaction.isJettonTransfer) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Not a Jetton Transfer' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 3. CSPIN 토큰인지 확인
    // (향후 구현: Jetton Wallet Master 주소 검증)

    // 크레딧 증가 (1 CSPIN = 1 Credit)
    const depositAmount = transaction.jettonAmount; // nanoCSPIN
    const creditToAdd = Number(depositAmount) / 1_000_000_000; // CSPIN으로 변환

    await updateCredit(env.CREDIT_KV, walletAddress, creditToAdd);

    const updatedCredit = await getCreditData(env.CREDIT_KV, walletAddress);

    return new Response(JSON.stringify({ 
      success: true, 
      credit: updatedCredit.credit,
      depositAmount: creditToAdd
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[verify-deposit Error]', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
