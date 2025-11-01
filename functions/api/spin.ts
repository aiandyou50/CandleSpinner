/**
 * 게임 실행 API (Spin)
 * 크레딧 차감하고 랜덤 슬롯 결과 생성
 */

import { Env } from '../_worker';
import { getCreditData, updateCredit } from '../lib/credit-manager';
import { generateSlotResult } from '../lib/game-logic';

export async function spin(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { walletAddress: string };
    const { walletAddress } = body;

    if (!walletAddress) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing walletAddress' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 크레딧 확인
    const creditData = await getCreditData(env.CREDIT_KV, walletAddress);
    const SPIN_COST = 1;

    if (creditData.credit < SPIN_COST) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Insufficient credit' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 크레딧 차감
    await updateCredit(env.CREDIT_KV, walletAddress, -SPIN_COST);

    // 슬롯 결과 생성
    const result = generateSlotResult();

    // 당첨 시 크레딧 증가
    if (result.winAmount > 0) {
      await updateCredit(env.CREDIT_KV, walletAddress, result.winAmount);
    }

    // 최종 크레딧 조회
    const updatedCredit = await getCreditData(env.CREDIT_KV, walletAddress);

    return new Response(JSON.stringify({ 
      success: true, 
      result: result.symbols,
      winAmount: result.winAmount,
      credit: updatedCredit.credit
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[spin Error]', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
