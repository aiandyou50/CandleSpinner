// 심볼 정의 (산출물 1 기반)
const SYMBOLS = {
  "⭐": { multiplier: 0.5, probability: 35 },
  "🪐": { multiplier: 1, probability: 25 },
  "☄️": { multiplier: 2, probability: 15 },
  "🚀": { multiplier: 3, probability: 10 },
  "👽": { multiplier: 5, probability: 7 },
  "💎": { multiplier: 10, probability: 5 },
  "👑": { multiplier: 20, probability: 3 }
};

// 0-99 사이의 숫자를 받아 심볼을 반환하는 확률 헬퍼 함수
function getSymbolFromProbability(value: number): string {
  if (value < 35) return "⭐";
  if (value < 60) return "🪐";
  if (value < 75) return "☄️";
  if (value < 85) return "🚀";
  if (value < 92) return "👽";
  if (value < 97) return "💎";
  return "👑";
}

// 간단한 해시 함수 (실제로는 crypto 사용)
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  return Math.abs(hash);
}

// 시드로부터 숫자 생성
function generateNumberFromSeed(seed: string, index: number): number {
  return simpleHash(seed + index.toString()) % 100;
}

// KV 데이터 타입
interface UserState {
  credit: number;
  canDoubleUp: boolean;
  pendingWinnings: number;
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const { walletAddress, betAmount, clientSeed }: {
      walletAddress: string;
      betAmount: number;
      clientSeed: string;
    } = await request.json();

    // KV에서 사용자 상태 가져오기
    const stateKey = `user_${walletAddress}`;
    const stateData = await env.CREDIT_KV.get(stateKey);
    const state: UserState = stateData ? JSON.parse(stateData) : {
      credit: 0,
      canDoubleUp: false,
      pendingWinnings: 0
    };

    // 1. 유효성 검사
    if (betAmount > state.credit) {
      return new Response(JSON.stringify({
        error: "크레딧이 부족합니다."
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (state.canDoubleUp) {
      return new Response(JSON.stringify({
        error: "미니게임 결과를 먼저 처리해야 합니다."
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. 크레딧 차감
    state.credit -= betAmount;

    // 3. Provably Fair 기반 릴 결과 생성
    const serverSeed = Math.random().toString(36);
    const hashedServerSeed = simpleHash(serverSeed).toString();
    const combinedSeed = (simpleHash(serverSeed + clientSeed)).toString();

    const reel1_value = generateNumberFromSeed(combinedSeed, 1);
    const reel2_value = generateNumberFromSeed(combinedSeed, 2);
    const reel3_value = generateNumberFromSeed(combinedSeed, 3);

    const reels = [
      getSymbolFromProbability(reel1_value),
      getSymbolFromProbability(reel2_value),
      getSymbolFromProbability(reel3_value)
    ];

    // 4. 당첨금 계산
    let winnings = 0;
    const symbolCounts: { [key: string]: number } = {};

    // 심볼 개수 세기
    reels.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });

    // 각 심볼별 당첨금 계산
    for (const [symbol, count] of Object.entries(symbolCounts)) {
      const multiplier = SYMBOLS[symbol as keyof typeof SYMBOLS].multiplier;
      const individualPayout = betAmount * multiplier;
      winnings += individualPayout * count;
    }

    // 5. 잭팟 처리 (3개 모두 같은 심볼)
    const isJackpot = reels[0] === reels[1] && reels[1] === reels[2];
    if (isJackpot) {
      winnings *= 100; // 잭팟 보너스
    }

    // 6. 상태 저장
    if (winnings > 0) {
      state.canDoubleUp = true;
      state.pendingWinnings = winnings;
    }

    // KV에 상태 저장
    await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

    // 7. 결과 반환
    return new Response(JSON.stringify({
      reels,
      winnings,
      newCredit: state.credit,
      isJackpot,
      hashedServerSeed,
      serverSeed
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Spin error:', error);
    return new Response(JSON.stringify({
      error: '서버 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}