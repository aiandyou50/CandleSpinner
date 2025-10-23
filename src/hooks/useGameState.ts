import { useCallback, useState, useEffect } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';

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
 * KV 동기화:
 * - 신규 사용자: initialCredit (1000)으로 시작
 * - 기존 사용자: 지갑 연결 시 KV에서 조회하여 적용
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
  const wallet = useTonWallet();
  const [userCredit, setUserCredit] = useState(initialCredit);
  const [isInitialized, setIsInitialized] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [lastWinnings, setLastWinnings] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  /**
   * KV에서 크레딧을 다시 로드하는 함수 (수동 리프레시용)
   */
  const refreshCreditFromKV = useCallback(async () => {
    if (!wallet?.account?.address) return;

    try {
      const response = await fetch(
        `/api/get-credit?walletAddress=${encodeURIComponent(wallet.account!.address)}`
      );
      
      if (!response.ok) {
        console.warn('[useGameState] 크레딧 재조회 실패');
        return;
      }

      const data = await response.json() as { credit: number };
      // KV에 저장된 크레딧으로 설정
      setUserCredit(Math.max(0, data.credit));
      console.log('[useGameState] 🔄 KV 크레딧 재로드:', data.credit);
    } catch (error) {
      console.error('[useGameState] KV 재조회 오류:', error);
    }
  }, [wallet?.account?.address]);

  /**
   * 지갑 연결 시 KV에서 크레딧 조회 (초기 로드)
   * 신규 사용자: initialCredit 유지
   * 기존 사용자: KV 값 적용
   */
  useEffect(() => {
    if (!wallet?.account?.address) return;
    if (isInitialized) return; // 중복 조회 방지

    const loadCreditFromKV = async () => {
      try {
        const response = await fetch(
          `/api/get-credit?walletAddress=${encodeURIComponent(wallet.account!.address)}`
        );
        
        if (!response.ok) {
          console.warn('[useGameState] 크레딧 조회 실패, 기본값 사용');
          setIsInitialized(true);
          return;
        }

        const data = await response.json() as { credit: number };
        // KV에 저장된 크레딧으로 설정 (0이면 신규 사용자 또는 모두 출금)
        setUserCredit(Math.max(0, data.credit));
        console.log('[useGameState] KV 크레딧 로드:', data.credit);
      } catch (error) {
        console.error('[useGameState] KV 조회 오류:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadCreditFromKV();
  }, [wallet?.account?.address, isInitialized]);

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
    refreshCreditFromKV,

    // 유도된 상태
    canSpin: userCredit >= betAmount && !isSpinning,
  } as const;
}
