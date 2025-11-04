/**
 * 슬롯머신 확률 시뮬레이션
 * Provably Fair 알고리즘 검증
 */

import { generateReelResults } from '../functions/src/slot/provably-fair';
import { calculatePayout, calculateTheoreticalRTP } from '../functions/src/slot/payout-calculator';

const SYMBOLS = ['⭐', '🪐', '☄️', '🚀', '👽', '💎', '👑'];
const SYMBOL_PROBABILITIES = [0.35, 0.25, 0.15, 0.10, 0.07, 0.05, 0.03];

/**
 * 심볼 분포 시뮬레이션
 */
function runSymbolDistribution(iterations: number) {
  console.log(`\n🎲 심볼 분포 시뮬레이션 (${iterations.toLocaleString()}회)\n`);
  
  const symbolCounts: Record<string, number> = {};
  SYMBOLS.forEach(symbol => symbolCounts[symbol] = 0);
  
  for (let i = 0; i < iterations; i++) {
    const serverSeed = crypto.randomUUID();
    const clientSeed = crypto.randomUUID();
    const results = generateReelResults(serverSeed, clientSeed);
    
    // 각 릴의 중앙 심볼 카운트
    results.forEach(reel => {
      const centerSymbol = reel[1]; // 중앙 심볼
      if (centerSymbol) {
        symbolCounts[centerSymbol]++;
      }
    });
  }
  
  // 총 심볼 수 (3릴)
  const totalSymbols = iterations * 3;
  
  // 결과 출력
  console.log('┌─────────┬──────────┬──────────┬──────────┐');
  console.log('│ 심볼    │ 기대확률 │ 실제확률 │ 오차     │');
  console.log('├─────────┼──────────┼──────────┼──────────┤');
  
  SYMBOLS.forEach((symbol, index) => {
    const expected = SYMBOL_PROBABILITIES[index]! * 100;
    const actual = (symbolCounts[symbol]! / totalSymbols) * 100;
    const error = Math.abs(actual - expected);
    
    console.log(
      `│ ${symbol} ${symbol === '⭐' ? '별' : symbol === '🪐' ? '행성' : symbol === '☄️' ? '혜성' : symbol === '🚀' ? '로켓' : symbol === '👽' ? '외계인' : symbol === '💎' ? '다이아' : '왕관'}  │ ${expected.toFixed(2)}%   │ ${actual.toFixed(2)}%   │ ${error < 1 ? '✅' : '⚠️'} ${error.toFixed(2)}% │`
    );
  });
  
  console.log('└─────────┴──────────┴──────────┴──────────┘');
}

/**
 * RTP 시뮬레이션
 */
function runRTPSimulation(iterations: number) {
  console.log(`\n💰 RTP 시뮬레이션 (${iterations.toLocaleString()}회)\n`);
  
  let totalBet = 0;
  let totalPayout = 0;
  let jackpotCount = 0;
  let winCount = 0;
  
  const betAmount = 100; // 고정 베팅액
  
  for (let i = 0; i < iterations; i++) {
    const serverSeed = crypto.randomUUID();
    const clientSeed = crypto.randomUUID();
    const results = generateReelResults(serverSeed, clientSeed);
    
    const { totalPayout: payout, isJackpot } = calculatePayout(results, betAmount);
    
    totalBet += betAmount;
    totalPayout += payout;
    
    if (isJackpot) {
      jackpotCount++;
    }
    
    if (payout > 0) {
      winCount++;
    }
  }
  
  const actualRTP = (totalPayout / totalBet) * 100;
  const theoreticalRTP = calculateTheoreticalRTP();
  const winRate = (winCount / iterations) * 100;
  const jackpotRate = (jackpotCount / iterations) * 100;
  
  console.log('┌──────────────────────┬────────────────┐');
  console.log('│ 지표                 │ 값             │');
  console.log('├──────────────────────┼────────────────┤');
  console.log(`│ 이론적 RTP           │ ${theoreticalRTP.toFixed(2)}%        │`);
  console.log(`│ 실제 RTP             │ ${actualRTP.toFixed(2)}%        │`);
  console.log(`│ 오차                 │ ${Math.abs(actualRTP - theoreticalRTP).toFixed(2)}%         │`);
  console.log('├──────────────────────┼────────────────┤');
  console.log(`│ 총 베팅액            │ ${totalBet.toLocaleString()}       │`);
  console.log(`│ 총 당첨금            │ ${totalPayout.toLocaleString()}       │`);
  console.log(`│ 순손실               │ ${(totalBet - totalPayout).toLocaleString()}       │`);
  console.log('├──────────────────────┼────────────────┤');
  console.log(`│ 당첨률               │ ${winRate.toFixed(2)}%        │`);
  console.log(`│ 잭팟 발생률          │ ${jackpotRate.toFixed(4)}%      │`);
  console.log(`│ 잭팟 횟수            │ ${jackpotCount}회          │`);
  console.log('└──────────────────────┴────────────────┘');
  
  // RTP 검증
  if (Math.abs(actualRTP - theoreticalRTP) < 1) {
    console.log('\n✅ RTP 검증 통과! (오차 < 1%)');
  } else {
    console.log('\n⚠️ RTP 오차 주의! (더 많은 시뮬레이션 권장)');
  }
}

/**
 * 당첨금 분포 시뮬레이션
 */
function runPayoutDistribution(iterations: number) {
  console.log(`\n📊 당첨금 분포 시뮬레이션 (${iterations.toLocaleString()}회)\n`);
  
  const payoutRanges = [
    { min: 0, max: 0, label: '0 (무당첨)', count: 0 },
    { min: 1, max: 500, label: '1-500', count: 0 },
    { min: 501, max: 1000, label: '501-1000', count: 0 },
    { min: 1001, max: 2000, label: '1001-2000', count: 0 },
    { min: 2001, max: 5000, label: '2001-5000', count: 0 },
    { min: 5001, max: 10000, label: '5001-10000', count: 0 },
    { min: 10001, max: Infinity, label: '10000+ (잭팟)', count: 0 },
  ];
  
  const betAmount = 100;
  
  for (let i = 0; i < iterations; i++) {
    const serverSeed = crypto.randomUUID();
    const clientSeed = crypto.randomUUID();
    const results = generateReelResults(serverSeed, clientSeed);
    
    const { totalPayout } = calculatePayout(results, betAmount);
    
    const range = payoutRanges.find(r => totalPayout >= r.min && totalPayout <= r.max);
    if (range) {
      range.count++;
    }
  }
  
  console.log('┌────────────────┬─────────┬───────────┐');
  console.log('│ 당첨금 범위    │ 횟수    │ 비율      │');
  console.log('├────────────────┼─────────┼───────────┤');
  
  payoutRanges.forEach(range => {
    const percentage = (range.count / iterations) * 100;
    const bar = '█'.repeat(Math.round(percentage / 2));
    console.log(
      `│ ${range.label.padEnd(14)} │ ${range.count.toString().padStart(7)} │ ${percentage.toFixed(2)}% ${bar}`
    );
  });
  
  console.log('└────────────────┴─────────┴───────────┘');
}

/**
 * 메인 실행
 */
async function main() {
  console.log('🎰 슬롯머신 V2 확률 검증 도구\n');
  console.log('================================================');
  
  // 1. 심볼 분포 (10,000회)
  runSymbolDistribution(10000);
  
  // 2. 당첨금 분포 (10,000회)
  runPayoutDistribution(10000);
  
  // 3. RTP 시뮬레이션 (100,000회)
  runRTPSimulation(100000);
  
  console.log('\n================================================');
  console.log('✅ 모든 시뮬레이션 완료!\n');
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runSymbolDistribution, runRTPSimulation, runPayoutDistribution };
