/**
 * 더블업 미니게임 API
 * 50% 확률로 당첨금을 2배로 늘리거나 모두 잃음
 * 스핀 1회당 1번만 플레이 가능
 */

import { getCredit, setCredit } from './credit-utils';

interface Env {
  CREDIT_KV: KVNamespace;
}

/**
 * 더블업 요청
 */
export interface DoubleUpRequest {
  walletAddress: string;
  choice: 'red' | 'blue';  // 빨강 또는 파랑 선택
  currentWin: number;       // 현재 당첨금
  gameId: string;           // 원본 게임 ID (중복 방지용)
}

/**
 * 더블업 응답
 */
export interface DoubleUpResponse {
  success: boolean;
  result?: 'win' | 'lose';
  finalAmount?: number;      // 최종 금액 (성공 시 currentWin × 2, 실패 시 0)
  selectedColor?: 'red' | 'blue';
  winningColor?: 'red' | 'blue';
  newCredit?: number;
  error?: string;
}

/**
 * 더블업 처리
 */
export async function handleDoubleUp(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // 요청 파싱
    const body = await request.json() as DoubleUpRequest;
    const { walletAddress, choice, currentWin, gameId } = body;

    // 입력 검증
    if (!walletAddress || !choice || !currentWin || !gameId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (choice !== 'red' && choice !== 'blue') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid choice. Must be "red" or "blue"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (currentWin <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No winnings to double up' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. 게임 ID 검증 (이미 사용되었는지 확인)
    const doubleUpUsedKey = `doubleup_used:${gameId}`;
    const alreadyUsed = await env.CREDIT_KV.get(doubleUpUsedKey);

    if (alreadyUsed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This game has already been used for double up' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. 원본 게임 기록 확인
    const gameRecordStr = await env.CREDIT_KV.get(`game:${gameId}`);
    if (!gameRecordStr) {
      return new Response(
        JSON.stringify({ success: false, error: 'Game record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const gameRecord = JSON.parse(gameRecordStr);

    // 지갑 주소 일치 확인
    if (gameRecord.walletAddress !== walletAddress) {
      return new Response(
        JSON.stringify({ success: false, error: 'Wallet address mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 당첨금 일치 확인
    if (gameRecord.totalWin !== currentWin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Win amount mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. 난수 생성 (50% 확률)
    // Cloudflare Workers의 crypto.getRandomValues 사용
    const randomArray = new Uint8Array(1);
    crypto.getRandomValues(randomArray);
    const randomValue = randomArray[0]! % 2; // 0 또는 1
    
    const winningColor: 'red' | 'blue' = randomValue === 0 ? 'red' : 'blue';
    const isWin = choice === winningColor;

    // 4. 결과 계산
    const finalAmount = isWin ? currentWin * 2 : 0;

    // 5. 크레딧 업데이트
    // 주의: 원본 게임에서 이미 당첨금이 추가되었으므로
    // 성공 시: +currentWin (2배가 되도록)
    // 실패 시: -currentWin (당첨금 회수)
  const currentCredit = await getCredit(env, walletAddress);

    const creditChange = isWin ? currentWin : -currentWin;
  const newCredit = await setCredit(env, walletAddress, currentCredit + creditChange);

    // 6. 더블업 사용 기록 (재사용 방지, 10분 TTL)
    await env.CREDIT_KV.put(doubleUpUsedKey, 'true', { expirationTtl: 600 });

    // 7. 더블업 기록 저장
    const doubleUpRecord = {
      gameId,
      walletAddress,
      choice,
      winningColor,
      result: isWin ? 'win' : 'lose',
      originalWin: currentWin,
      finalAmount,
      creditChange,
      newCredit,
      timestamp: Date.now(),
    };

    await env.CREDIT_KV.put(
      `doubleup:${gameId}`,
      JSON.stringify(doubleUpRecord),
      { expirationTtl: 86400 * 30 } // 30일 보관
    );

    // 8. RTP 통계 업데이트 (더블업도 통계에 포함)
    if (!isWin) {
      // 실패 시 당첨금을 잃으므로 totalWins에서 차감
      await updateRTPForDoubleUp(env, -currentWin);
    } else {
      // 성공 시 추가 당첨금
      await updateRTPForDoubleUp(env, currentWin);
    }

    // 9. 응답
    const response: DoubleUpResponse = {
      success: true,
      result: isWin ? 'win' : 'lose',
      finalAmount,
      selectedColor: choice,
      winningColor,
      newCredit,
    };

    console.log('[DoubleUp] Result:', {
      wallet: walletAddress,
      choice,
      winning: winningColor,
      result: isWin ? 'WIN' : 'LOSE',
      amount: finalAmount,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[DoubleUp] Error:', error);
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
 * RTP 통계 업데이트 (더블업용)
 */
async function updateRTPForDoubleUp(env: Env, winChange: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `rtp_stats:${today}`;

    const statsStr = await env.CREDIT_KV.get(statsKey);
    if (!statsStr) return;

    const stats = JSON.parse(statsStr);
    stats.totalWins += winChange;
    stats.rtp = stats.totalBets > 0 ? (stats.totalWins / stats.totalBets) : 0;

    await env.CREDIT_KV.put(statsKey, JSON.stringify(stats), { expirationTtl: 86400 * 90 });

  } catch (error) {
    console.error('[RTP Stats] DoubleUp update failed:', error);
  }
}

/**
 * 더블업 기록 조회 API
 */
export async function handleGetDoubleUpHistory(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get('walletAddress');

    if (!walletAddress) {
      return new Response(
        JSON.stringify({ success: false, error: 'walletAddress required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // KV에서 더블업 기록 조회
    // 실제 구현에서는 인덱싱이 필요
    const history: any[] = [];

    return new Response(
      JSON.stringify({ success: true, history }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[DoubleUp History] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
