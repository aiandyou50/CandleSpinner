/**
 * Cloudflare Workers 메인 진입점
 * 모든 API 라우팅 처리
 */

// Buffer 폴리필 (Cloudflare Workers 환경)
import { Buffer } from 'buffer';
(globalThis as any).Buffer = Buffer;

import { verifyDeposit } from './api/verify-deposit';
import { spin } from './api/spin';
import { withdraw } from './api/withdraw';
import { getCredit } from './api/credit';

export interface Env {
  CREDIT_KV: KVNamespace;
  GAME_WALLET_PRIVATE_KEY: string;
  GAME_WALLET_ADDRESS: string;
  CSPIN_TOKEN_ADDRESS: string;
  TONCENTER_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 헤더 설정
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONS 요청 처리 (CORS Preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API 라우팅
    try {
      if (path === '/api/credit' && request.method === 'GET') {
        return await getCredit(request, env);
      } else if (path === '/api/verify-deposit' && request.method === 'POST') {
        return await verifyDeposit(request, env);
      } else if (path === '/api/spin' && request.method === 'POST') {
        return await spin(request, env);
      } else if (path === '/api/withdraw' && request.method === 'POST') {
        return await withdraw(request, env);
      } else {
        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('[Worker Error]', error);
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal Server Error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
