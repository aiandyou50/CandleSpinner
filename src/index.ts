/**
 * Cloudflare Workers 엔트리 포인트
 * 정적 파일 서빙 + API 라우팅
 */

export interface Env {
  ASSETS: Fetcher;
  CREDIT_KV: KVNamespace;
  GAME_WALLET_MNEMONI: string;
  GAME_WALLET_ADDRESS: string;
  CSPIN_JETTON_MASTER: string;
  CSPIN_JETTON_WALLET: string;
  TONCENTER_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONS 요청 (CORS Preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API 라우팅
    if (url.pathname.startsWith('/api/')) {
      try {
        // API 라우트 처리
        if (url.pathname === '/api/credit') {
          return handleGetCredit(request, env, corsHeaders);
        } else if (url.pathname === '/api/verify-deposit' && request.method === 'POST') {
          return handleVerifyDeposit(request, env, corsHeaders);
        } else if (url.pathname === '/api/spin' && request.method === 'POST') {
          return handleSpin(request, env, corsHeaders);
        } else if (url.pathname === '/api/withdraw' && request.method === 'POST') {
          return handleWithdraw(request, env, corsHeaders);
        }
        
        return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('[API Error]', error);
        return new Response(JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal Server Error'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 정적 파일 서빙 (React 앱)
    return env.ASSETS.fetch(request);
  },
};

// API 핸들러 (간단한 구현)
async function handleGetCredit(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get('address');
  
  if (!address) {
    return new Response(JSON.stringify({ error: 'Missing address' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const key = `credit:${address}`;
  const data = await env.CREDIT_KV.get(key, 'json') as { credit: number } | null;
  
  return new Response(JSON.stringify({
    success: true,
    credit: data?.credit || 0,
    lastUpdated: new Date().toISOString()
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleVerifyDeposit(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const body = await request.json() as { walletAddress: string; txHash: string };
  
  // TODO: TonCenter API로 트랜잭션 검증
  // 임시 구현: 10 CSPIN 추가
  const key = `credit:${body.walletAddress}`;
  const current = await env.CREDIT_KV.get(key, 'json') as { credit: number } | null;
  const newCredit = (current?.credit || 0) + 10;
  
  await env.CREDIT_KV.put(key, JSON.stringify({
    credit: newCredit,
    lastUpdated: new Date().toISOString()
  }));
  
  return new Response(JSON.stringify({
    success: true,
    credit: newCredit,
    depositAmount: 10
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSpin(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const body = await request.json() as { walletAddress: string };
  
  // 크레딧 확인 및 차감
  const key = `credit:${body.walletAddress}`;
  const current = await env.CREDIT_KV.get(key, 'json') as { credit: number } | null;
  
  if (!current || current.credit < 1) {
    return new Response(JSON.stringify({ error: 'Insufficient credit' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  // 랜덤 슬롯 결과 생성
  const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎'];
  const result: string[][] = [];
  for (let i = 0; i < 3; i++) {
    const row: string[] = [];
    for (let j = 0; j < 3; j++) {
      row.push(symbols[Math.floor(Math.random() * symbols.length)]!);
    }
    result.push(row);
  }
  
  // 당첨 확인 (간단한 로직)
  let winAmount = 0;
  // 가로 확인
  for (let i = 0; i < 3; i++) {
    if (result[i]![0] === result[i]![1] && result[i]![1] === result[i]![2]) {
      winAmount = 5;
    }
  }
  
  const newCredit = current.credit - 1 + winAmount;
  await env.CREDIT_KV.put(key, JSON.stringify({
    credit: newCredit,
    lastUpdated: new Date().toISOString()
  }));
  
  return new Response(JSON.stringify({
    success: true,
    result,
    winAmount,
    credit: newCredit
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleWithdraw(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const body = await request.json() as { walletAddress: string; amount: number };
  
  // TODO: Jetton Transfer 구현
  // 임시 구현: 크레딧만 차감
  const key = `credit:${body.walletAddress}`;
  const current = await env.CREDIT_KV.get(key, 'json') as { credit: number } | null;
  
  if (!current || current.credit < body.amount) {
    return new Response(JSON.stringify({ error: 'Insufficient credit' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  const newCredit = current.credit - body.amount;
  await env.CREDIT_KV.put(key, JSON.stringify({
    credit: newCredit,
    lastUpdated: new Date().toISOString()
  }));
  
  return new Response(JSON.stringify({
    success: true,
    txHash: 'temp_tx_hash',
    amount: body.amount,
    credit: newCredit
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
