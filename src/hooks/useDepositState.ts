import { useCallback, useState } from 'react';
import { getErrorMessage } from '../utils/errors';
import * as Sentry from '@sentry/react';

/**
 * 입금 방식 타입
 */
export type DepositMethod = 'select' | 'tonconnect' | 'rpc';

/**
 * 입금 상태 인터페이스
 */
export interface DepositStateData {
  depositMethod: DepositMethod;
  depositAmount: string;
  isProcessing: boolean;
  error: string | null;
}

/**
 * 입금 상태 관리 hook
 * Deposit.tsx에서 분산된 message + messageType 상태를 통합
 * 에러 처리와 로딩 상태를 일관되게 관리
 *
 * @example
 * ```typescript
 * const depositState = useDepositState();
 *
 * depositState.setMethod('tonconnect');
 * depositState.setAmount('100');
 * depositState.setLoading(true);
 * depositState.setError('입금 실패');
 * ```
 */
export function useDepositState(initialMethod: DepositMethod = 'select') {
  const [depositMethod, setDepositMethod] = useState<DepositMethod>(initialMethod);
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 입금 방식 변경
   */
  const setMethod = useCallback((method: DepositMethod) => {
    setDepositMethod(method);
    setError(null); // 방식 변경 시 에러 초기화
  }, []);

  /**
   * 입금액 설정 (숫자만 허용)
   */
  const setAmount = useCallback((amount: string) => {
    // 숫자만 필터링
    const numericAmount = amount.replace(/[^0-9.]/g, '');
    setDepositAmount(numericAmount);
  }, []);

  /**
   * 로딩 상태 설정
   */
  const setLoading = useCallback((loading: boolean) => {
    setIsProcessing(loading);
  }, []);

  /**
   * 에러 설정 (자동으로 Sentry에 보고)
   */
  const handleError = useCallback((err: unknown, context?: Record<string, any>) => {
    const message = getErrorMessage(err);
    setError(message);

    // Sentry에 context와 함께 에러 보고
    if (err instanceof Error) {
      Sentry.captureException(err, {
        contexts: {
          deposit: {
            method: depositMethod,
            amount: depositAmount,
            ...context,
          },
        },
      });
    }
  }, [depositMethod, depositAmount]);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 입금액 유효성 검사
   */
  const validateAmount = useCallback((): { valid: boolean; error?: string } => {
    const amount = parseFloat(depositAmount);

    if (!depositAmount.trim()) {
      return { valid: false, error: '입금액을 입력하세요.' };
    }

    if (isNaN(amount) || amount <= 0) {
      return { valid: false, error: '0보다 큰 숫자를 입력하세요.' };
    }

    if (amount > 1000000) {
      return { valid: false, error: '최대 입금액(100만)을 초과했습니다.' };
    }

    return { valid: true };
  }, [depositAmount]);

  /**
   * 입금 리셋 (새 입금 시작)
   */
  const reset = useCallback(() => {
    setDepositMethod(initialMethod);
    setDepositAmount('100');
    setIsProcessing(false);
    setError(null);
  }, [initialMethod]);

  return {
    // 상태
    depositMethod,
    depositAmount,
    isProcessing,
    error,

    // 상태 업데이트 메서드
    setMethod,
    setAmount,
    setLoading,
    handleError,
    clearError,
    reset,

    // 유효성 검사
    validateAmount,
    isAmountValid: validateAmount().valid,

    // 유도된 상태
    canProceed: !isProcessing && validateAmount().valid && depositMethod !== 'select',
    isError: error !== null,
  } as const;
}
