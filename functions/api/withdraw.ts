/**
 * 인출 API
 * 크레딧 차감 후 게임 지갑에서 사용자 Jetton 지갑으로 CSPIN 전송
 */

import { Env } from '../_worker';
import { getCreditData, updateCredit } from '../lib/credit-manager';
import { sendJettonTransfer } from '../lib/ton-client';

export async function withdraw(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { walletAddress: string; amount: number };
    const { walletAddress, amount } = body;

    if (!walletAddress || !amount || amount <= 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid walletAddress or amount' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 크레딧 확인
    const creditData = await getCreditData(env.CREDIT_KV, walletAddress);

    if (creditData.credit < amount) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Insufficient credit' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 크레딧 차감
    await updateCredit(env.CREDIT_KV, walletAddress, -amount);

    // Jetton Transfer 전송
    const txHash = await sendJettonTransfer(
      env.GAME_WALLET_PRIVATE_KEY,
      walletAddress,
      amount,
      env.CSPIN_TOKEN_ADDRESS,
      env.TONCENTER_API_KEY
    );

    return new Response(JSON.stringify({ 
      success: true, 
      txHash,
      amount,
      credit: creditData.credit - amount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[withdraw Error]', error);
    
    // 실패 시 크레딧 복구
    try {
      const body = await request.json() as { walletAddress: string; amount: number };
      await updateCredit(env.CREDIT_KV, body.walletAddress, body.amount);
    } catch (rollbackError) {
      console.error('[withdraw Rollback Error]', rollbackError);
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
