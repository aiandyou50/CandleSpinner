import { useCallback, useState } from 'react';

/**
 * 토스트 메시지 상태 타입
 */
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

/**
 * 토스트 알림 관리 hook
 * 기존의 message + messageType 분리 상태를 통합
 *
 * @example
 * ```typescript
 * const { toast, showToast } = useToast();
 *
 * showToast('성공했습니다!', 'success');
 * showToast('오류가 발생했습니다', 'error', 5000);
 * ```
 */
export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info',
      duration = 3000
    ) => {
      const id = Math.random().toString(36).slice(2, 9);

      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration,
      };

      setToast(newToast);

      // 지정된 시간 후 토스트 제거
      setTimeout(() => {
        setToast(null);
      }, duration);
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    isVisible: toast !== null,
  };
}
