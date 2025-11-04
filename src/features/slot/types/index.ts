/**
 * 슬롯 게임 타입 정의
 */

export interface SpinRequest {
  walletAddress: string;
  betAmount: number;
  clientSeed: string;
}

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

export interface DoubleUpRequest {
  walletAddress: string;
  choice: 'red' | 'blue';
  currentWin: number;
  gameId: string;
}

export interface DoubleUpResponse {
  success: boolean;
  result?: 'win' | 'lose';
  finalAmount?: number;
  selectedColor?: 'red' | 'blue';
  winningColor?: 'red' | 'blue';
  newCredit?: number;
  error?: string;
}

export interface RTPStats {
  date: string;
  totalGames: number;
  totalBets: number;
  totalWins: number;
  rtp: number;
}

export const SYMBOLS = ['⭐', '🪐', '☄️', '🚀', '👽', '💎', '👑'] as const;

export type Symbol = typeof SYMBOLS[number];

export type SymbolRarity = 'common' | 'uncommon' | 'rare' | 'legend';

export const SYMBOL_RARITY: Record<Symbol, SymbolRarity> = {
  '⭐': 'common',
  '🪐': 'common',
  '☄️': 'uncommon',
  '🚀': 'uncommon',
  '👽': 'rare',
  '💎': 'rare',
  '👑': 'legend',
};

export const SYMBOL_PAYOUTS: Record<Symbol, number> = {
  '⭐': 0.5,
  '🪐': 1,
  '☄️': 2,
  '🚀': 3,
  '👽': 5,
  '💎': 10,
  '👑': 20,
};
