/**
 * 크레딧 조회 API
 */

import { Env } from '../_worker';
import { getCreditData } from '../lib/credit-manager';

export async function getCredit(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get('address');

    if (!walletAddress) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing address parameter' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const creditData = await getCreditData(env.CREDIT_KV, walletAddress);

    return new Response(JSON.stringify({ 
      success: true, 
      credit: creditData.credit 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[getCredit Error]', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
