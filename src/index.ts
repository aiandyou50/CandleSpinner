/**
 * Cloudflare Workers 엔트리 포인트
 * 정적 파일 서빙 + API 라우팅
 */

// Buffer 폴리필 (Cloudflare Workers 환경에서 @ton/ton 사용을 위해 필요)
import { Buffer } from 'buffer';
(globalThis as any).Buffer = Buffer;

export interface Env {
  ASSETS: Fetcher;
  CREDIT_KV: KVNamespace;
  GAME_WALLET_MNEMONIC: string;
  GAME_WALLET_ADDRESS: string;
  CSPIN_JETTON_MASTER: string;
  CSPIN_JETTON_WALLET: string;  // ✅ 게임의 Jetton Wallet 주소
  TONCENTER_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // ✅ 환경 변수 디버깅 (배포 후 확인용)
    console.log('[Env Check] TONCENTER_API_KEY exists:', !!env.TONCENTER_API_KEY);
    console.log('[Env Check] GAME_WALLET_MNEMONIC exists:', !!env.GAME_WALLET_MNEMONIC);
    console.log('[Env Check] GAME_WALLET_ADDRESS:', env.GAME_WALLET_ADDRESS || 'NOT SET');
    console.log('[Env Check] CSPIN_JETTON_MASTER:', env.CSPIN_JETTON_MASTER || 'NOT SET');
    console.log('[Env Check] CSPIN_JETTON_WALLET:', env.CSPIN_JETTON_WALLET || 'NOT SET');
    
    // CORS 헤더 (TON Connect 호환)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, User-Agent',
      'Access-Control-Max-Age': '86400',
    };

    // OPTIONS 요청 (CORS Preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    // ✅ TON Connect Manifest 파일 특별 처리
    if (url.pathname === '/tonconnect-manifest.json') {
      console.log('[Manifest] Serving tonconnect-manifest.json from:', url.hostname);
      console.log('[Manifest] Request origin:', request.headers.get('Origin'));
      
      // ASSETS에서 파일 가져오기
      const response = await env.ASSETS.fetch(request);
      
      // 응답이 성공적이면 CORS 헤더 추가
      if (response.ok) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        newHeaders.set('Content-Type', 'application/json; charset=utf-8');
        newHeaders.set('Cache-Control', 'public, max-age=3600');
        newHeaders.set('X-Content-Type-Options', 'nosniff');
        
        console.log('[Manifest] Successfully served with CORS headers');
        
        return new Response(response.body, {
          status: response.status,
          headers: newHeaders,
        });
      }
      
      console.error('[Manifest] File not found in ASSETS');
      return new Response(JSON.stringify({ error: 'Manifest not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // API 라우팅
    if (url.pathname.startsWith('/api/')) {
      try {
        // API 라우트 처리
        if (url.pathname === '/api/credit') {
          return handleGetCredit(request, env, corsHeaders);
        } else if (url.pathname === '/api/check-balance' && request.method === 'POST') {
          return handleCheckBalance(request, env, corsHeaders);
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

/**
 * TonCenter API를 사용한 Jetton 잔액 확인
 * API Key를 사용하여 Rate Limit 회피
 */
async function handleCheckBalance(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const body = await request.json() as { jettonWalletAddress: string };
    
    if (!body.jettonWalletAddress) {
      return new Response(JSON.stringify({ error: 'Missing jettonWalletAddress' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[CheckBalance] Request:', body.jettonWalletAddress);

    // TonCenter API 호출 (runGetMethod: get_wallet_data)
    const tonCenterUrl = 'https://toncenter.com/api/v2/runGetMethod';
    const apiKey = env.TONCENTER_API_KEY;
    
    // ✅ API Key 확인
    if (!apiKey) {
      console.error('[CheckBalance] TONCENTER_API_KEY is not set!');
      return new Response(JSON.stringify({ 
        error: 'TonCenter API Key not configured',
        message: 'Please set TONCENTER_API_KEY in Cloudflare Dashboard'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('[CheckBalance] Using API Key:', apiKey.substring(0, 10) + '...');
    
    const tonCenterResponse = await fetch(tonCenterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,  // ✅ API Key 추가
      },
      body: JSON.stringify({
        address: body.jettonWalletAddress,
        method: 'get_wallet_data',
        stack: []
      }),
    });

    console.log('[CheckBalance] TonCenter status:', tonCenterResponse.status);

    if (!tonCenterResponse.ok) {
      const errorText = await tonCenterResponse.text();
      console.error('[TonCenter Error]', tonCenterResponse.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: 'TonCenter API error',
        status: tonCenterResponse.status,
        details: errorText
      }), {
        status: tonCenterResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tonCenterData = await tonCenterResponse.json() as {
      ok: boolean;
      result: {
        stack: Array<{ type: string; value: string }>;
      };
      error?: string;
    };

    console.log('[CheckBalance] TonCenter response:', JSON.stringify(tonCenterData));

    if (!tonCenterData.ok) {
      // Jetton Wallet이 초기화되지 않은 경우 (CSPIN을 한 번도 받지 않음)
      if (tonCenterData.error && tonCenterData.error.includes('exit code -13')) {
        return new Response(JSON.stringify({ 
          error: 'Jetton Wallet not initialized',
          balance: '0',
          balanceCSPIN: 0,
          message: 'CSPIN 토큰을 한 번도 받지 않은 지갑입니다'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        error: 'Invalid TonCenter response',
        data: tonCenterData
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // get_wallet_data 결과 파싱
    // stack[0] = balance (number)
    const balanceItem = tonCenterData.result.stack[0];
    if (!balanceItem || balanceItem.type !== 'num') {
      return new Response(JSON.stringify({ 
        error: 'Invalid balance format',
        stack: tonCenterData.result.stack
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const balance = balanceItem.value;
    const balanceCSPIN = Number(balance) / 1_000_000_000;

    console.log('[CheckBalance] Success:', { balance, balanceCSPIN });

    return new Response(JSON.stringify({
      success: true,
      balance: balance,  // nano 단위
      balanceCSPIN: balanceCSPIN,  // CSPIN 단위
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[CheckBalance Error]', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
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
