// src/store.ts
import { create } from 'zustand';

interface GameState {
  credit: number;
  message: string;
  isProcessing: boolean;
  userCspinJettonWallet: string;
  showDoubleUp: boolean;
  lastWinnings: number;
  reelSymbols: string[];
  setCredit: (credit: number) => void;
  setMessage: (message: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setUserCspinJettonWallet: (wallet: string) => void;
  setShowDoubleUp: (show: boolean) => void;
  setLastWinnings: (winnings: number) => void;
  setReelSymbols: (symbols: string[]) => void;
  startSpin: () => void;
  endSpin: (newCredit: number, reels: string[], winnings: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  credit: 1000,
  message: '게임을 시작하려면 지갑을 연결하세요.',
  isProcessing: false,
  userCspinJettonWallet: '',
  showDoubleUp: false,
  lastWinnings: 0,
  reelSymbols: ['⭐', '🪐', '💎'],
  setCredit: (credit) => set({ credit }),
  setMessage: (message) => set({ message }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setUserCspinJettonWallet: (wallet) => set({ userCspinJettonWallet: wallet }),
  setShowDoubleUp: (show) => set({ showDoubleUp: show }),
  setLastWinnings: (winnings) => set({ lastWinnings: winnings }),
  setReelSymbols: (symbols) => set({ reelSymbols: symbols }),
  startSpin: () => set({ isProcessing: true, showDoubleUp: false, message: '스핀 중...' }),
  endSpin: (newCredit, reels, winnings) => {
    set({
      isProcessing: false,
      credit: newCredit,
      reelSymbols: reels,
      lastWinnings: winnings,
      showDoubleUp: winnings > 0,
      message: winnings > 0 ? `당첨! 획득 상금: ${winnings}` : '아쉽지만 다음 기회에...',
    });
  },
}));
