/**
 * 게임 로직 (랜덤 슬롯 결과 생성)
 */

const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎'];

interface SlotResult {
  symbols: string[][]; // 3x3 grid
  winAmount: number;
}

/**
 * 랜덤 슬롯 결과 생성 (3x3)
 */
export function generateSlotResult(): SlotResult {
  const grid: string[][] = [];
  
  for (let i = 0; i < 3; i++) {
    const row: string[] = [];
    for (let j = 0; j < 3; j++) {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      row.push(SYMBOLS[randomIndex]!);
    }
    grid.push(row);
  }
  
  // 당첨 확인 (간단한 로직: 가로/세로/대각선 3개 일치)
  const winAmount = checkWin(grid);
  
  return { symbols: grid, winAmount };
}

/**
 * 당첨 확인
 */
function checkWin(grid: string[][]): number {
  // 가로 확인
  for (let i = 0; i < 3; i++) {
    if (grid[i]![0] === grid[i]![1] && grid[i]![1] === grid[i]![2]) {
      return getWinAmount(grid[i]![0]!);
    }
  }
  
  // 세로 확인
  for (let j = 0; j < 3; j++) {
    if (grid[0]![j] === grid[1]![j] && grid[1]![j] === grid[2]![j]) {
      return getWinAmount(grid[0]![j]!);
    }
  }
  
  // 대각선 확인
  if (grid[0]![0] === grid[1]![1] && grid[1]![1] === grid[2]![2]) {
    return getWinAmount(grid[0]![0]!);
  }
  if (grid[0]![2] === grid[1]![1] && grid[1]![1] === grid[2]![0]) {
    return getWinAmount(grid[0]![2]!);
  }
  
  return 0;
}

/**
 * 심볼별 당첨금
 */
function getWinAmount(symbol: string): number {
  const payouts: Record<string, number> = {
    '💎': 10,  // 다이아몬드: 10 CSPIN
    '⭐': 5,   // 별: 5 CSPIN
    '🍉': 3,   // 수박: 3 CSPIN
    '🍊': 2,   // 오렌지: 2 CSPIN
    '🍋': 2,   // 레몬: 2 CSPIN
    '🍒': 1,   // 체리: 1 CSPIN
  };
  
  return payouts[symbol] || 0;
}
