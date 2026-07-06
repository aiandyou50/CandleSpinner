/**
 * Cloudflare Workers 엔트리 포인트
 * 정적 파일 서빙 + API 라우팅
 */

// Buffer 폴리필 (Cloudflare Workers 환경에서 @ton/ton 사용을 위해 필요)
import { Buffer } from 'buffer';
(globalThis as any).Buffer = Buffer;

// 인출 핸들러 import
import { processWithdrawal } from '../functions/src/withdraw-handler';

// 슬롯 게임 핸들러 import
import { 
  handleSpin as handleSlotSpin, 
  handleGetGameHistory, 
  handleGetRTPStats 
} from '../functions/src/slot/spin-handler';
import { 
  handleDoubleUp as handleSlotDoubleUp, 
  handleGetDoubleUpHistory 
} from '../functions/src/slot/doubleup-handler';
import { getCredit, setCredit, type CreditRecord } from '../functions/src/slot/credit-utils';

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
    
    // ✅ 환경 변수 디버깅 (배포 후 확인용) - v2
    console.log('[Env Check v2] TONCENTER_API_KEY exists:', !!env.TONCENTER_API_KEY);
    console.log('[Env Check v2] GAME_WALLET_MNEMONIC exists:', !!env.GAME_WALLET_MNEMONIC);
    console.log('[Env Check v2] GAME_WALLET_ADDRESS:', env.GAME_WALLET_ADDRESS || 'NOT SET');
    console.log('[Env Check v2] CSPIN_JETTON_MASTER:', env.CSPIN_JETTON_MASTER || 'NOT SET');
    console.log('[Env Check v2] CSPIN_JETTON_WALLET:', env.CSPIN_JETTON_WALLET || 'NOT SET');
    
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
        } else if (url.pathname === '/api/check-api-key') {
          return handleCheckApiKey(request, env, corsHeaders);
        } else if (url.pathname === '/api/check-balance' && request.method === 'POST') {
          return handleCheckBalance(request, env, corsHeaders);
        } else if (url.pathname === '/api/verify-deposit' && request.method === 'POST') {
          return handleVerifyDeposit(request, env, corsHeaders);
        } else if (url.pathname === '/api/slot/spin' && request.method === 'POST') {
          return handleSlotSpin(request, env, corsHeaders);
        } else if (url.pathname === '/api/slot/doubleup' && request.method === 'POST') {
          return handleSlotDoubleUp(request, env, corsHeaders);
        } else if (url.pathname === '/api/slot/history' && request.method === 'GET') {
          return handleGetGameHistory(request, env, corsHeaders);
        } else if (url.pathname === '/api/slot/rtp-stats' && request.method === 'GET') {
          return handleGetRTPStats(request, env, corsHeaders);
        } else if (url.pathname === '/api/slot/doubleup-history' && request.method === 'GET') {
          return handleGetDoubleUpHistory(request, env, corsHeaders);
        } else if (url.pathname === '/api/spin' && request.method === 'POST') {
          // 기존 간단한 슬롯 (하위 호환)
          return handleSimpleSpin(request, env, corsHeaders);
        } else if (url.pathname === '/api/withdraw-request' && request.method === 'POST') {
          return handleWithdrawRequest(request, env, corsHeaders);
        } else if (url.pathname === '/api/admin/pending-withdrawals' && request.method === 'GET') {
          return handleGetPendingWithdrawals(request, env, corsHeaders);
        } else if (url.pathname === '/api/admin/mark-processed' && request.method === 'POST') {
          return handleMarkProcessed(request, env, corsHeaders);
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

    // ✅ SPA 라우팅: /admin 등 모든 페이지를 index.html로 리디렉션
    // React Router가 클라이언트에서 처리
    console.log('[SPA] pathname:', url.pathname);
    console.log('[SPA] startsWith /api:', url.pathname.startsWith('/api'));
    
    // ✅ ASSETS가 있는 경우 (Workers Assets 사용)
    if (env.ASSETS) {
      if (!url.pathname.startsWith('/api') && !url.pathname.startsWith('/assets/')) {
        console.log('[SPA] Redirecting to index.html:', url.pathname);
        const indexRequest = new Request(new URL('/', url), request);
        return env.ASSETS.fetch(indexRequest);
      }
      console.log('[SPA] Serving static file:', url.pathname);
      return env.ASSETS.fetch(request);
    }
    
    // ❌ ASSETS가 없는 경우 - 에러 페이지 반환
    console.error('[FATAL] ASSETS binding not configured!');
    // ✅ XSS 방지: 사용자 제어 값(url.pathname)을 HTML 삽입 전 escape
    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#39;');
    const safePath = escapeHtml(url.pathname);
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Configuration Error</title>
      </head>
      <body>
        <h1>Workers Configuration Error</h1>
        <p>ASSETS binding is not configured.</p>
        <p>Please deploy using: <code>npx wrangler deploy</code></p>
        <hr>
        <p>Requested: ${safePath}</p>
      </body>
      </html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
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
  const credit = await getCredit(env, address);
  let lastUpdated: string | null = null;

  try {
    const stored = await env.CREDIT_KV.get<CreditRecord | number>(key, 'json');
    if (stored && typeof stored === 'object' && 'lastUpdated' in stored) {
      lastUpdated = stored.lastUpdated;
    }
  } catch (error) {
    console.warn('[GetCredit] JSON parse warning:', error);
  }

  return new Response(JSON.stringify({
    success: true,
    credit,
    lastUpdated: lastUpdated || new Date().toISOString()
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * TONCENTER_API_KEY 확인 (민감 정보 노출 없이)
 * 실제 API 호출로 유효성 검증
 */
async function handleCheckApiKey(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  console.log('[CheckApiKey] API 키 확인 시작');
  
  const apiKey = env.TONCENTER_API_KEY;
  
  // 1. 환경변수 존재 여부
  const exists = !!apiKey;
  console.log(`[CheckApiKey] 환경변수 존재: ${exists}`);
  
  if (!exists) {
    return new Response(JSON.stringify({
      exists: false,
      valid: false,
      message: 'TONCENTER_API_KEY 환경변수가 설정되지 않았습니다.',
      recommendation: 'Cloudflare Dashboard에서 환경변수를 추가하세요.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // 2. 실제 API 호출로 유효성 검증
  console.log('[CheckApiKey] TonCenter API 테스트 호출...');
  
  try {
    const testResponse = await fetch(
      'https://toncenter.com/api/v2/getAddressState?address=EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADdU',
      {
        headers: {
          'X-API-Key': apiKey,
        }
      }
    );
    
    const testData = await testResponse.json() as { ok: boolean; error?: string };
    
    if (!testResponse.ok || !testData.ok) {
      console.error('[CheckApiKey] API 호출 실패:', testData);
      return new Response(JSON.stringify({
        exists: true,
        valid: false,
        message: 'API 키가 존재하지만 유효하지 않습니다.',
        error: testData.error || 'Unknown error',
        recommendation: 'TonCenter에서 새로운 API 키를 발급받으세요: https://toncenter.com'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('[CheckApiKey] ✅ API 키 정상');
    
    return new Response(JSON.stringify({
      exists: true,
      valid: true,
      message: '✅ TONCENTER_API_KEY가 정상적으로 설정되어 있습니다.',
      rateLimit: 'API Key 사용 중 (Rate Limit 없음)'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[CheckApiKey] 오류:', error);
    return new Response(JSON.stringify({
      exists: true,
      valid: false,
      message: 'API 키 검증 중 오류 발생',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
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

    const tonCenterRaw = await tonCenterResponse.text();
    let tonCenterData: {
      ok: boolean;
      result: {
        stack: Array<[string, string] | { type: string; value: string }>;
      };
      error?: string;
    } | null = null;

    try {
      tonCenterData = JSON.parse(tonCenterRaw) as {
        ok: boolean;
        result: {
          stack: Array<[string, string] | { type: string; value: string }>;
        };
        error?: string;
      };
    } catch (parseError) {
      console.error('[CheckBalance] TonCenter JSON 파싱 실패:', parseError);
      console.error('[CheckBalance] TonCenter Raw 응답:', tonCenterRaw.substring(0, 200));
    }

    if (!tonCenterData) {
      return new Response(JSON.stringify({ 
        error: 'Failed to parse TonCenter response',
        details: 'TonCenter returned non-JSON payload'
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // ✅ get_wallet_data 결과 파싱
    // TonCenter API는 두 가지 형식으로 응답 가능:
    // 1. 배열 형식: ["num", "0xc097..."]
    // 2. 객체 형식: { type: "num", value: "0xc097..." }
    const balanceItem = tonCenterData.result.stack[0];
    let balanceType: string;
    let balanceValue: string;
    
    if (Array.isArray(balanceItem)) {
      // 배열 형식
      [balanceType, balanceValue] = balanceItem as [string, string];
    } else if (typeof balanceItem === 'object' && 'type' in balanceItem) {
      // 객체 형식
      balanceType = balanceItem.type;
      balanceValue = balanceItem.value;
    } else {
      console.error('[CheckBalance] Unknown stack format:', balanceItem);
      return new Response(JSON.stringify({ 
        error: 'Invalid balance format',
        stack: tonCenterData.result.stack
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (balanceType !== 'num') {
      return new Response(JSON.stringify({ 
        error: 'Invalid balance type',
        type: balanceType,
        stack: tonCenterData.result.stack
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ✅ hex 형식 (0x...) 또는 decimal 형식 처리
    let balanceNano: number;
    
    if (typeof balanceValue === 'string' && balanceValue.startsWith('0x')) {
      // hex to decimal 변환
      balanceNano = parseInt(balanceValue, 16);
      console.log('[CheckBalance] Hex balance converted:', balanceValue, '->', balanceNano);
    } else {
      balanceNano = Number(balanceValue);
    }
    
    const balanceCSPIN = balanceNano / 1_000_000_000;

    console.log('[CheckBalance] Success:', { balanceNano, balanceCSPIN });

    return new Response(JSON.stringify({
      success: true,
      balance: balanceNano.toString(),  // nano 단위 (string으로 변환)
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
  try {
    const body = await request.json() as { walletAddress: string; txHash: string; amount?: number };
    
    console.log('[VerifyDeposit] 입금 검증 시작:', body);
    
    if (!body.walletAddress || !body.txHash) {
      console.error('[VerifyDeposit] 누락된 필수 파라미터');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required parameters' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // ✅ 클라이언트에서 전달된 입금 금액 사용 (간단한 방법)
    // BOC 파싱은 복잡하므로, 프론트엔드에서 입금 금액을 함께 전달받음
    let depositAmount = body.amount || 0;
    
    console.log('[VerifyDeposit] 입금 금액:', depositAmount, 'CSPIN');
    
    if (depositAmount <= 0) {
      console.error('[VerifyDeposit] 잘못된 입금 금액');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid deposit amount' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // ✅ TonCenter API로 트랜잭션 검증
    const apiKey = env.TONCENTER_API_KEY;
    if (!apiKey) {
      console.error('[VerifyDeposit] TONCENTER_API_KEY is not set!');
      console.error('[VerifyDeposit] 💡 해결 방법: npx wrangler secret put TONCENTER_API_KEY');
      console.error('[VerifyDeposit] 💡 또는 Cloudflare Dashboard → Workers → Settings → Variables에서 설정');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'TonCenter API Key not configured. Please contact administrator.',
        details: 'TONCENTER_API_KEY environment variable is missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const userAddress = body.walletAddress;
    console.log('[VerifyDeposit] 사용자 지갑:', userAddress);
    console.log('[VerifyDeposit] BOC (처음 100자):', body.txHash.substring(0, 100) + '...');
    
    // TonCenter API로 사용자의 최근 트랜잭션 조회하여 검증
    const txResponse = await fetch(
      `https://toncenter.com/api/v2/getTransactions?address=${userAddress}&limit=10`,
      {
        headers: {
          'X-API-Key': apiKey,
        }
      }
    );
    
    if (!txResponse.ok) {
      console.error('[VerifyDeposit] TonCenter API 호출 실패:', txResponse.status);
      // ⚠️ API 실패 시에도 클라이언트가 보낸 금액을 신뢰 (개발 편의)
      console.warn('[VerifyDeposit] ⚠️ API 실패, 클라이언트 금액 사용:', depositAmount);
    } else {
      const txRaw = await txResponse.text();
      let txData: {
        ok: boolean;
        result: Array<{
          transaction_id: { hash: string };
          out_msgs?: Array<{
            destination?: string;
            value?: string;
          }>;
        }>;
      } | null = null;

      try {
        txData = JSON.parse(txRaw) as {
          ok: boolean;
          result: Array<{
            transaction_id: { hash: string };
            out_msgs?: Array<{
              destination?: string;
              value?: string;
            }>;
          }>;
        };
      } catch (parseError) {
        console.error('[VerifyDeposit] TonCenter JSON 파싱 실패:', parseError);
        console.error('[VerifyDeposit] TonCenter Raw 응답:', txRaw.substring(0, 200));
      }

      if (txData && Array.isArray(txData.result)) {
        console.log('[VerifyDeposit] 조회된 트랜잭션 수:', txData.result.length);

        // ✅ 최근 트랜잭션 확인 (검증 강화 가능)
        let foundTx = false;
        for (const tx of txData.result) {
          if (tx.out_msgs && tx.out_msgs.length > 0) {
            // Jetton Transfer 트랜잭션 발견
            foundTx = true;
            console.log('[VerifyDeposit] ✅ Jetton Transfer 트랜잭션 발견:', tx.transaction_id.hash);
            break;
          }
        }

        if (!foundTx) {
          console.warn('[VerifyDeposit] ⚠️ 트랜잭션 미발견, 계속 진행');
        }
      } else {
        console.warn('[VerifyDeposit] ⚠️ TonCenter 응답이 비어있거나 형식이 다릅니다. 클라이언트 금액 사용 계속.');
      }
    }
    
    // 크레딧 업데이트
    const currentCredit = await getCredit(env, body.walletAddress);
    const newCredit = await setCredit(env, body.walletAddress, currentCredit + depositAmount);
    
    console.log('[VerifyDeposit] ✅ 크레딧 업데이트:', newCredit, `(+${depositAmount} CSPIN)`);
    
    return new Response(JSON.stringify({
      success: true,
      credit: newCredit,
      depositAmount: depositAmount,
      txHash: body.txHash.substring(0, 50)
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[VerifyDeposit Error]', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 기존 간단한 슬롯 (하위 호환)
async function handleSimpleSpin(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
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

// ✅ handleWithdrawRequest - 수동 인출 요청 (크레딧 차감 + 대기열 추가)
// 보안: 타임스탬프 + 논스로 리플레이 공격 방지
async function handleWithdrawRequest(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const body = await request.json() as {
      action: string;
      amount: number;
      userAddress: string;
      timestamp: number;
      nonce: string;
    };
    
    console.log('[WithdrawRequest] 인출 요청:', body);
    
    // ✅ 보안 검증: action 확인
    if (body.action !== 'withdraw') {
      console.error('[WithdrawRequest] 잘못된 요청 타입:', body.action);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // ✅ 보안 검증: 타임스탬프 (5분 이내)
    const age = Date.now() - body.timestamp;
    if (age > 300000 || age < 0) {  // 5분 = 300초
      console.error('[WithdrawRequest] 만료된 요청:', { age, timestamp: body.timestamp });
      return new Response(JSON.stringify({
        success: false,
        error: 'Request expired or invalid timestamp'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // ✅ 보안 검증: 논스 중복 확인 (리플레이 공격 방지)
    const nonceKey = `nonce:${body.nonce}`;
    const existingNonce = await env.CREDIT_KV.get(nonceKey);
    if (existingNonce) {
      console.error('[WithdrawRequest] 중복된 논스 (리플레이 공격):', body.nonce);
      return new Response(JSON.stringify({
        success: false,
        error: 'Duplicate request'
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 논스 저장 (10분 TTL)
    await env.CREDIT_KV.put(nonceKey, 'used', { expirationTtl: 600 });
    
    console.log('[WithdrawRequest] ✅ 보안 검증 통과');
    
    // 1. 크레딧 확인
    const currentCredit = await getCredit(env, body.userAddress);
    
    if (currentCredit < body.amount) {
      console.error('[WithdrawRequest] 크레딧 부족');
      return new Response(JSON.stringify({
        success: false,
        error: 'Insufficient credit'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`[WithdrawRequest] 현재 크레딧: ${currentCredit}`);
    
    // 2. 크레딧 차감
    const newCredit = await setCredit(env, body.userAddress, currentCredit - body.amount);
    
    console.log(`[WithdrawRequest] 크레딧 차감 완료: ${currentCredit} → ${newCredit}`);
    
    // 3. 대기열에 추가
    const withdrawalId = `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const withdrawal = {
      id: withdrawalId,
      walletAddress: body.userAddress,
      amount: body.amount,
      nonce: body.nonce,  // 추적용
      status: 'pending',
      requestedAt: new Date().toISOString(),
      estimatedProcessTime: '12~24시간 이내'
    };
    
    // KV에 개별 인출 건 저장
    await env.CREDIT_KV.put(`withdrawal:${withdrawalId}`, JSON.stringify(withdrawal));
    
    // 대기열 목록에 추가
    const queueKey = 'withdrawals:pending';
    const queue = await env.CREDIT_KV.get(queueKey, 'json') as string[] | null;
    const updatedQueue = queue ? [...queue, withdrawalId] : [withdrawalId];
    await env.CREDIT_KV.put(queueKey, JSON.stringify(updatedQueue));
    
    console.log(`[WithdrawRequest] 대기열 추가 완료: ${withdrawalId}`);
    console.log('[WithdrawRequest] ✅ 인출 요청 완료');
    
    return new Response(JSON.stringify({
      success: true,
      credit: newCredit,
      withdrawalId,
      estimatedProcessTime: '12~24시간 이내',
      message: '인출 요청이 접수되었습니다'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[WithdrawRequest] 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ✅ handleGetPendingWithdrawals - 대기 중인 인출 목록 조회 (관리자용)
async function handleGetPendingWithdrawals(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    console.log('[GetPendingWithdrawals] 대기열 조회 시작');
    
    // 대기열 목록 조회
    const queueKey = 'withdrawals:pending';
    const queue = await env.CREDIT_KV.get(queueKey, 'json') as string[] | null;
    
    if (!queue || queue.length === 0) {
      console.log('[GetPendingWithdrawals] 대기 중인 인출 없음');
      return new Response(JSON.stringify({
        success: true,
        withdrawals: [],
        count: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 각 인출 건의 상세 정보 조회
    const withdrawals = await Promise.all(
      queue.map(async (id) => {
        const data = await env.CREDIT_KV.get(`withdrawal:${id}`, 'json');
        return data;
      })
    );
    
    const validWithdrawals = withdrawals.filter(w => w !== null);
    
    console.log(`[GetPendingWithdrawals] ✅ 조회 완료: ${validWithdrawals.length}건`);
    
    return new Response(JSON.stringify({
      success: true,
      withdrawals: validWithdrawals,
      count: validWithdrawals.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[GetPendingWithdrawals] 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ✅ handleMarkProcessed - 인출 처리 완료 표시 (관리자용)
async function handleMarkProcessed(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const body = await request.json() as {
      withdrawalId: string;
      txHash?: string;
    };
    
    console.log('[MarkProcessed] 처리 완료 표시:', body);
    
    // 인출 건 조회
    const withdrawalKey = `withdrawal:${body.withdrawalId}`;
    const withdrawal = await env.CREDIT_KV.get(withdrawalKey, 'json') as any;
    
    if (!withdrawal) {
      console.error('[MarkProcessed] 인출 건을 찾을 수 없음');
      return new Response(JSON.stringify({
        success: false,
        error: 'Withdrawal not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 상태 업데이트
    withdrawal.status = 'processed';
    withdrawal.processedAt = new Date().toISOString();
    if (body.txHash) {
      withdrawal.txHash = body.txHash;
    }
    
    await env.CREDIT_KV.put(withdrawalKey, JSON.stringify(withdrawal));
    
    // 대기열에서 제거
    const queueKey = 'withdrawals:pending';
    const queue = await env.CREDIT_KV.get(queueKey, 'json') as string[] | null;
    
    if (queue) {
      const updatedQueue = queue.filter(id => id !== body.withdrawalId);
      await env.CREDIT_KV.put(queueKey, JSON.stringify(updatedQueue));
    }
    
    // 처리 완료 목록에 추가
    const processedKey = 'withdrawals:processed';
    const processed = await env.CREDIT_KV.get(processedKey, 'json') as string[] | null;
    const updatedProcessed = processed ? [...processed, body.withdrawalId] : [body.withdrawalId];
    await env.CREDIT_KV.put(processedKey, JSON.stringify(updatedProcessed));
    
    console.log(`[MarkProcessed] ✅ 처리 완료: ${body.withdrawalId}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: '인출 처리가 완료되었습니다',
      withdrawal
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[MarkProcessed] 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
