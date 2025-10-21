import { useCallback, useState } from 'react';

/**
 * 게임 상태 인터페이스
 */
export interface GameStateData {
  userCredit: number;
  betAmount: number;
  lastWinnings: number;
  isSpinning: boolean;
}

/**
 * 게임 상태 관리 hook
 * Zustand와 useState의 혼합 사용을 제거하고 단일 hook으로 통합
 *
 * @example
 * ```typescript
 * const gameState = useGameState();
 * gameState.updateCredit(100); // 크레딧 업데이트
 * gameState.setBetAmount(50);  // 베팅액 설정
 * gameState.startSpin();       // 스핀 시작
 * ```
 */
export function useGameState(initialCredit = 1000) {
  const [userCredit, setUserCredit] = useState(initialCredit);
  const [betAmount, setBetAmount] = useState(100);
  const [lastWinnings, setLastWinnings] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  /**
   * 크레딧 업데이트 (음수 방지)
   * @param amount 변경할 금액 (음수도 가능)
   */
  const updateCredit = useCallback((amount: number) => {
    setUserCredit((prev) => Math.max(0, prev + amount));
  }, []);

  /**
   * 크레딧을 절대값으로 설정
   */
  const setCredit = useCallback((credit: number) => {
    setUserCredit(Math.max(0, credit));
  }, []);

  /**
   * 베팅액 설정 (유효성 검사)
   */
  const setBet = useCallback((amount: number) => {
    if (amount > 0 && amount <= userCredit) {
      setBetAmount(amount);
    }
  }, [userCredit]);

  /**
   * 스핀 시작
   */
  const startSpin = useCallback(() => {
    if (userCredit >= betAmount && !isSpinning) {
      setIsSpinning(true);
    }
  }, [userCredit, betAmount, isSpinning]);

  /**
   * 스핀 종료
   */
  const endSpin = useCallback((winnings: number) => {
    setLastWinnings(winnings);
    setUserCredit((prev) => Math.max(0, prev - betAmount + winnings));
    setIsSpinning(false);
  }, [betAmount]);

  /**
   * 게임 리셋 (테스트용)
   */
  const resetGame = useCallback(() => {
    setUserCredit(initialCredit);
    setBetAmount(100);
    setLastWinnings(0);
    setIsSpinning(false);
  }, [initialCredit]);

  return {
    // 상태
    userCredit,
    betAmount,
    lastWinnings,
    isSpinning,

    // 상태 업데이트 메서드
    updateCredit,
    setCredit,
    setBet,
    setLastWinnings,
    startSpin,
    endSpin,
    resetGame,

    // 유도된 상태
    canSpin: userCredit >= betAmount && !isSpinning,
  } as const;
}
