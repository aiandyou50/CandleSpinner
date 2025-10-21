import { useEffect, useState, useCallback } from 'react';
import { getTelegramWebApp, initializeTelegramWebApp } from '../utils/telegram';
import type { TelegramWebApp } from '../types';

/**
 * Telegram WebApp 초기화 및 상태 관리 hook
 * App.tsx의 중복 초기화 코드를 통합
 *
 * TMA vs 일반 웹 환경에서 자동으로 WebApp을 초기화하고 관리합니다.
 * 
 * @param onReady - WebApp 준비 완료 시 콜백
 * @example
 * ```typescript
 * const webApp = useTelegramWebApp(async () => {
 *   console.log('Telegram WebApp 준비됨');
 * });
 *
 * // webApp이 undefined면 일반 웹 환경
 * if (webApp) {
 *   webApp.showMainButton({
 *     text: '시작하기',
 *     onClick: () => console.log('clicked'),
 *   });
 * }
 * ```
 */
export function useTelegramWebApp(onReady?: () => void | Promise<void>) {
  const [webApp, setWebApp] = useState<TelegramWebApp | undefined>(undefined);
  const [isTMA, setIsTMA] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTelegramWebApp = async () => {
      try {
        // Telegram WebApp 객체 가져오기
        const tma = getTelegramWebApp();

        if (tma) {
          // TMA 환경: 초기화 수행
          setIsTMA(true);
          initializeTelegramWebApp();
          setWebApp(tma);

          // 사용자 데이터 준비
          if (tma.ready) {
            tma.ready();
          }

          // onReady 콜백 실행
          if (onReady) {
            await onReady();
          }

          setIsReady(true);
        } else {
          // 일반 웹 환경: webApp undefined 유지
          setIsTMA(false);
          setIsReady(true);

          // onReady 콜백 실행 (웹 환경)
          if (onReady) {
            await onReady();
          }
        }
      } catch (error) {
        console.error('Telegram WebApp 초기화 실패:', error);
        setIsReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    initTelegramWebApp();
  }, [onReady]);

  /**
   * 뒤로가기 버튼 표시/숨김
   */
  const showBackButton = useCallback((show = true) => {
    if (!webApp) return;
    try {
      if (show) {
        webApp.BackButton?.show?.();
      } else {
        webApp.BackButton?.hide?.();
      }
    } catch (error) {
      console.error('BackButton 제어 실패:', error);
    }
  }, [webApp]);

  /**
   * 메인 버튼 표시/숨김
   */
  const showMainButton = useCallback((show = true, text = '확인') => {
    if (!webApp || !webApp.MainButton) return;
    try {
      if (show) {
        webApp.MainButton.setText?.(text);
        webApp.MainButton.show?.();
      } else {
        webApp.MainButton.hide?.();
      }
    } catch (error) {
      console.error('MainButton 제어 실패:', error);
    }
  }, [webApp]);

  /**
   * 메인 버튼 클릭 핸들러 설정 (onEvent 사용)
   */
  const onMainButtonClick = useCallback((handler: () => void) => {
    if (!webApp || !webApp.onEvent) return;
    try {
      webApp.onEvent?.('mainButtonClicked', handler);
    } catch (error) {
      console.error('MainButton 클릭 핸들러 설정 실패:', error);
    }
  }, [webApp]);

  /**
   * 다이얼로그 표시
   */
  const showAlert = useCallback((message: string) => {
    if (!webApp) return;
    try {
      // WebApp API에서 showAlert 미지원 시 alert 사용
      if ((webApp as any).showAlert) {
        (webApp as any).showAlert(message);
      } else {
        alert(message);
      }
    } catch (error) {
      console.error('Alert 표시 실패:', error);
      alert(message);
    }
  }, [webApp]);

  /**
   * 확인 다이얼로그 표시
   */
  const showConfirm = useCallback((message: string): Promise<boolean> => {
    if (!webApp) return Promise.resolve(false);
    try {
      if ((webApp as any).showConfirm) {
        return new Promise((resolve) => {
          (webApp as any).showConfirm(message, (ok: boolean) => {
            resolve(ok);
          });
        });
      } else {
        return Promise.resolve(confirm(message));
      }
    } catch (error) {
      console.error('Confirm 표시 실패:', error);
      return Promise.resolve(confirm(message));
    }
  }, [webApp]);

  /**
   * 햅틱 피드백
   */
  const hapticFeedback = useCallback(() => {
    if (!webApp || !webApp.HapticFeedback) return;
    try {
      webApp.HapticFeedback.impactOccurred?.({ impact_style: 'light' });
    } catch (error) {
      console.error('Haptic Feedback 실패:', error);
    }
  }, [webApp]);

  return {
    // 상태
    webApp,
    isTMA,
    isReady,
    isLoading,

    // 메서드
    showBackButton,
    showMainButton,
    onMainButtonClick,
    showAlert,
    showConfirm,
    hapticFeedback,
  };
}
