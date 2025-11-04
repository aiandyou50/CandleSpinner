/**
 * 슬롯 스핀 API
 * Provably Fair 알고리즘 기반 공정한 게임 결과 생성
 */

import { generateServerSeed, hashServerSeed, generateReelResults } from './provably-fair';
import { calculatePayout } from './payout-calculator';

interface Env {
  CREDIT_KV: KVNamespace;
}

/**
 * 슬롯 스핀 요청
 */
export interface SpinRequest {
  walletAddress: string;
  betAmount: number;
  clientSeed: string;
}

/**
 * 슬롯 스핀 응답
 */
export interface SpinResponse {
  success: boolean;
  result?: string[][];           // 3개 릴의 심볼
  winAmount?: number;            // 당첨금
  isJackpot?: boolean;           // 잭팟 여부
  centerSymbols?: string[];      // 중앙 라인 심볼
  reelPayouts?: number[];        // 각 릴의 당첨금
  serverSeedHash?: string;       // 서버 시드 해시 (공개)
  nonce?: number;                // 논스
  gameId?: string;               // 게임 ID (더블업용)
  newCredit?: number;            // 업데이트된 크레딧
  error?: string;
}

/**
 * 슬롯 스핀 처리
 */
export async function handleSpin(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // 요청 파싱
    const body = await request.json() as SpinRequest;
    const { walletAddress, betAmount, clientSeed } = body;

    // 입력 검증
    if (!walletAddress || !betAmount || !clientSeed) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 베팅 금액 범위 확인 (10~1000 CSPIN)
    if (betAmount < 10 || betAmount > 1000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bet amount must be between 10 and 1000 CSPIN' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. 크레딧 확인
    const creditKey = `credit:${walletAddress}`;
    const creditStr = await env.CREDIT_KV.get(creditKey);
    const currentCredit = creditStr ? parseInt(creditStr) : 0;

    if (currentCredit < betAmount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient credit',
          currentCredit 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. 서버 시드 가져오기 또는 생성
    const serverSeedKey = `server_seed:${walletAddress}`;
    let serverSeed = await env.CREDIT_KV.get(serverSeedKey);
    
    if (!serverSeed) {
      serverSeed = generateServerSeed();
      await env.CREDIT_KV.put(serverSeedKey, serverSeed);
    }

    // 3. 논스 증가
    const nonceKey = `nonce:${walletAddress}`;
    const nonceStr = await env.CREDIT_KV.get(nonceKey);
    const currentNonce = nonceStr ? parseInt(nonceStr) + 1 : 1;
    await env.CREDIT_KV.put(nonceKey, currentNonce.toString());

    // 4. Provably Fair 결과 생성
    const reelResults = await generateReelResults(serverSeed, clientSeed, currentNonce);

    // 5. 당첨금 계산
    const { totalWin, isJackpot, reelPayouts, centerSymbols } = calculatePayout(reelResults, betAmount);

    // 6. 크레딧 업데이트 (베팅액 차감 + 당첨금 추가)
    const newCredit = currentCredit - betAmount + totalWin;
    await env.CREDIT_KV.put(creditKey, newCredit.toString());

    // 7. 게임 기록 저장
    const gameId = `${Date.now()}_${walletAddress}_${currentNonce}`;
    const gameRecord = {
      gameId,
      walletAddress,
      betAmount,
      reelResults,
      centerSymbols,
      totalWin,
      isJackpot,
      reelPayouts,
      serverSeedHash: await hashServerSeed(serverSeed),
      clientSeed,
      nonce: currentNonce,
      timestamp: Date.now(),
      newCredit,
    };

    // KV에 30일간 보관
    await env.CREDIT_KV.put(
      `game:${gameId}`,
      JSON.stringify(gameRecord),
      { expirationTtl: 86400 * 30 }
    );

    // 8. RTP 통계 업데이트
    await updateRTPStats(env, walletAddress, betAmount, totalWin);

    // 9. 응답
    const response: SpinResponse = {
      success: true,
      result: reelResults,
      winAmount: totalWin,
      isJackpot,
      centerSymbols,
      reelPayouts,
      serverSeedHash: await hashServerSeed(serverSeed),
      nonce: currentNonce,
      gameId,
      newCredit,
    };

    console.log('[Spin] Success:', {
      wallet: walletAddress,
      bet: betAmount,
      win: totalWin,
      jackpot: isJackpot,
      symbols: centerSymbols,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Spin] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * RTP 통계 업데이트
 */
async function updateRTPStats(
  env: Env,
  walletAddress: string,
  betAmount: number,
  winAmount: number
): Promise<void> {
  try {
    // 오늘 날짜 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `rtp_stats:${today}`;

    // 기존 통계 가져오기
    const statsStr = await env.CREDIT_KV.get(statsKey);
    const stats = statsStr ? JSON.parse(statsStr) : {
      date: today,
      totalGames: 0,
      totalBets: 0,
      totalWins: 0,
      rtp: 0,
    };

    // 통계 업데이트
    stats.totalGames += 1;
    stats.totalBets += betAmount;
    stats.totalWins += winAmount;
    stats.rtp = stats.totalBets > 0 ? (stats.totalWins / stats.totalBets) : 0;

    // 저장 (90일간 보관)
    await env.CREDIT_KV.put(statsKey, JSON.stringify(stats), { expirationTtl: 86400 * 90 });

  } catch (error) {
    console.error('[RTP Stats] Update failed:', error);
    // 통계 업데이트 실패는 게임 진행에 영향 없음
  }
}

/**
 * 게임 기록 조회 API
 */
export async function handleGetGameHistory(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get('walletAddress');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!walletAddress) {
      return new Response(
        JSON.stringify({ success: false, error: 'walletAddress required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // KV에서 게임 기록 조회 (최근 50개)
    // 실제 구현에서는 인덱싱이 필요할 수 있음
    const games: any[] = [];

    // 간단한 구현: 최근 게임 ID로 검색
    // 프로덕션에서는 더 효율적인 방법 필요

    return new Response(
      JSON.stringify({ success: true, games }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Game History] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * RTP 통계 조회 API
 */
export async function handleGetRTPStats(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // 오늘 날짜
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `rtp_stats:${today}`;

    const statsStr = await env.CREDIT_KV.get(statsKey);
    const stats = statsStr ? JSON.parse(statsStr) : {
      date: today,
      totalGames: 0,
      totalBets: 0,
      totalWins: 0,
      rtp: 0,
    };

    return new Response(
      JSON.stringify({ success: true, stats }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[RTP Stats] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
