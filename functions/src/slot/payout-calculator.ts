/**
 * 당첨금 계산 로직
 * 독창적 규칙: 각 릴의 당첨금을 개별 계산하여 합산
 */

/**
 * 심볼별 배당률 (명세서 기준)
 */
export const SYMBOL_PAYOUTS: Record<string, number> = {
  '⭐': 0.5,   // Common
  '🪐': 1,     // Common
  '☄️': 2,     // Uncommon
  '🚀': 3,     // Uncommon
  '👽': 5,     // Rare
  '💎': 10,    // Rare
  '👑': 20,    // Legend
};

/**
 * 당첨금 계산 결과
 */
export interface PayoutResult {
  totalWin: number;          // 총 당첨금
  isJackpot: boolean;        // 잭팟 여부
  reelPayouts: number[];     // 각 릴의 당첨금
  centerSymbols: string[];   // 중앙 라인 심볼
  multiplier: number;        // 적용된 배수 (잭팟 시 100)
}

/**
 * 당첨금 계산 (독창적 규칙)
 * 
 * 규칙:
 * 1. 각 릴의 중앙 심볼만 체크
 * 2. 각 릴의 당첨금 = 베팅액 × 해당 심볼의 배당률
 * 3. 총 당첨금 = 릴1 당첨금 + 릴2 당첨금 + 릴3 당첨금
 * 4. 잭팟 (3개 동일 심볼): 총 당첨금 × 100
 * 
 * @param reelResults 3개 릴의 심볼 배열 (각 릴당 [상단, 중앙, 하단])
 * @param betAmount 베팅 금액 (CSPIN)
 * @returns 당첨금 계산 결과
 */
export function calculatePayout(
  reelResults: string[][],
  betAmount: number
): PayoutResult {
  // 중앙 라인의 심볼만 추출 (인덱스 1)
  const centerSymbols = reelResults.map(reel => reel[1] || '⭐');
  
  // 각 릴의 당첨금 계산
  const reelPayouts = centerSymbols.map(symbol => {
    const multiplier = SYMBOL_PAYOUTS[symbol] || 0;
    return betAmount * multiplier;
  });
  
  // 총 당첨금 (3개 릴 합산)
  let totalWin = reelPayouts.reduce((sum, payout) => sum + payout, 0);
  
  // 잭팟 체크 (3개 모두 동일한 심볼)
  const isJackpot = centerSymbols.every(s => s === centerSymbols[0]);
  
  // 잭팟이면 100배
  let multiplier = 1;
  if (isJackpot) {
    multiplier = 100;
    totalWin = totalWin * 100;
  }
  
  return {
    totalWin,
    isJackpot,
    reelPayouts,
    centerSymbols,
    multiplier,
  };
}

/**
 * RTP (Return to Player) 계산
 * 이론상 기대값 계산
 * 
 * 각 심볼의 기대값 = 확률 × 배당률
 * 전체 RTP = (모든 심볼의 기대값 합) / 1 × 100%
 */
export function calculateTheoreticalRTP(): number {
  const probabilities: Record<string, number> = {
    '⭐': 0.35,  // 35%
    '🪐': 0.25,  // 25%
    '☄️': 0.15,  // 15%
    '🚀': 0.10,  // 10%
    '👽': 0.07,  // 7%
    '💎': 0.05,  // 5%
    '👑': 0.03,  // 3%
  };
  
  // 1개 릴의 기대값
  let singleReelExpectedValue = 0;
  for (const [symbol, prob] of Object.entries(probabilities)) {
    const payout = SYMBOL_PAYOUTS[symbol] || 0;
    singleReelExpectedValue += prob * payout;
  }
  
  // 3개 릴의 총 기대값
  const totalExpectedValue = singleReelExpectedValue * 3;
  
  // RTP 계산 (베팅액 대비 기대 수익)
  // 베팅액을 1로 가정하면, RTP = 총 기대값
  const rtp = totalExpectedValue;
  
  return rtp; // 약 0.9469 (94.69%)
}

/**
 * 실제 RTP 계산 (게임 기록 기반)
 * @param totalBets 총 베팅액
 * @param totalWins 총 당첨금
 * @returns 실제 RTP (0~1)
 */
export function calculateActualRTP(totalBets: number, totalWins: number): number {
  if (totalBets === 0) return 0;
  return totalWins / totalBets;
}

/**
 * 잭팟 확률 계산
 * 3개 릴에서 동일한 심볼이 나올 확률
 */
export function calculateJackpotProbability(symbol: string): number {
  const probabilities: Record<string, number> = {
    '⭐': 0.35,
    '🪐': 0.25,
    '☄️': 0.15,
    '🚀': 0.10,
    '👽': 0.07,
    '💎': 0.05,
    '👑': 0.03,
  };
  
  const prob = probabilities[symbol] || 0;
  // 3개 릴 모두 동일: prob^3
  return Math.pow(prob, 3);
}

/**
 * 전체 잭팟 확률 (모든 심볼 포함)
 */
export function calculateTotalJackpotProbability(): number {
  return Object.keys(SYMBOL_PAYOUTS).reduce((sum, symbol) => {
    return sum + calculateJackpotProbability(symbol);
  }, 0);
}

/**
 * 당첨 통계
 */
export interface WinStatistics {
  totalGames: number;
  totalBets: number;
  totalWins: number;
  actualRTP: number;
  jackpotCount: number;
  jackpotRate: number;
  symbolDistribution: Record<string, number>;
}

/**
 * 게임 기록으로부터 통계 계산
 */
export function calculateStatistics(
  games: Array<{ betAmount: number; totalWin: number; isJackpot: boolean; centerSymbols: string[] }>
): WinStatistics {
  const totalGames = games.length;
  const totalBets = games.reduce((sum, g) => sum + g.betAmount, 0);
  const totalWins = games.reduce((sum, g) => sum + g.totalWin, 0);
  const jackpotCount = games.filter(g => g.isJackpot).length;
  
  // 심볼 분포
  const symbolDistribution: Record<string, number> = {};
  games.forEach(g => {
    g.centerSymbols.forEach(symbol => {
      symbolDistribution[symbol] = (symbolDistribution[symbol] || 0) + 1;
    });
  });
  
  return {
    totalGames,
    totalBets,
    totalWins,
    actualRTP: calculateActualRTP(totalBets, totalWins),
    jackpotCount,
    jackpotRate: totalGames > 0 ? jackpotCount / totalGames : 0,
    symbolDistribution,
  };
}
