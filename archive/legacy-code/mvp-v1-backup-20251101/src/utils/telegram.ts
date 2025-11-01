/**
 * Telegram Mini App (TMA) 유틸리티
 * TMA 환경 감지 및 상호작용 함수들
 *
 * @module utils/telegram
 */

import type { TelegramWebApp } from '../types';

// ============================================
// Telegram WebApp 접근
// ============================================

/**
 * Telegram WebApp 객체 가져오기
 * TMA 환경에서만 작동
 *
 * @example
 * ```typescript
 * const webApp = getTelegramWebApp();
 * if (webApp) {
 *   webApp.ready();
 * }
 * ```
 */
export function getTelegramWebApp(): TelegramWebApp | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as any).Telegram?.WebApp;
}

/**
 * TMA 환경 여부 확인
 *
 * @example
 * ```typescript
 * if (isTelegramMiniApp()) {
 *   console.log('Running in Telegram Mini App');
 * }
 * ```
 */
export function isTelegramMiniApp(): boolean {
  return getTelegramWebApp() !== undefined;
}

// ============================================
// TMA 초기화
// ============================================

/**
 * TMA 초기화
 * - ready() 호출
 * - 헤더색 설정
 * - 뒤로가기 버튼 설정
 *
 * @example
 * ```typescript
 * useEffect(() => {
 *   initializeTelegramWebApp();
 * }, []);
 * ```
 */
export function initializeTelegramWebApp(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  try {
    // 앱이 준비됨을 Telegram에 알림
    webApp.ready?.();

    // 헤더 색상 설정
    webApp.setHeaderColor?.({ color_key: 'bg_color' });

    // 하단 바 색상 설정
    webApp.setBottomBarColor?.({ color: '#ffffff' });

    // 배경 색상 요청
    webApp.requestViewport?.();

    if (process.env.NODE_ENV !== 'production') {
      console.log('[TMA] WebApp initialized');
    }
  } catch (error) {
    console.warn('[TMA] Failed to initialize WebApp:', error);
  }
}

// ============================================
// 사용자 정보
// ============================================

/**
 * Telegram 사용자 ID 가져오기
 *
 * @example
 * ```typescript
 * const userId = getTelegramUserId();
 * if (userId) {
 *   console.log(`User ID: ${userId}`);
 * }
 * ```
 */
export function getTelegramUserId(): number | undefined {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user?.id;
}

/**
 * Telegram 사용자 정보 가져오기
 *
 * @example
 * ```typescript
 * const user = getTelegramUserInfo();
 * if (user) {
 *   console.log(`Hello, ${user.first_name}!`);
 * }
 * ```
 */
export function getTelegramUserInfo() {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user;
}

/**
 * Init Data 문자열 가져오기
 * 서버에 사용자 검증할 때 사용
 *
 * @example
 * ```typescript
 * const initData = getTelegramInitData();
 * // 서버로 전송하여 검증
 * ```
 */
export function getTelegramInitData(): string | undefined {
  const webApp = getTelegramWebApp();
  return webApp?.initData;
}

// ============================================
// UI 제어
// ============================================

/**
 * 해제 가능한 후진 버튼 표시
 *
 * @param callback - 뒤로가기 버튼 클릭 시 호출될 함수
 * @example
 * ```typescript
 * const unsubscribe = showBackButton(() => {
 *   navigate(-1);
 * });
 *
 * // 정리
 * useEffect(() => {
 *   return unsubscribe;
 * }, []);
 * ```
 */
export function showBackButton(callback: () => void): () => void {
  const webApp = getTelegramWebApp();
  if (!webApp) return () => {};

  try {
    webApp.BackButton?.show?.();
    webApp.onEvent?.('backButtonClicked', callback);

    return () => {
      webApp.BackButton?.hide?.();
      webApp.offEvent?.('backButtonClicked', callback);
    };
  } catch (error) {
    console.warn('[TMA] Failed to show back button:', error);
    return () => {};
  }
}

/**
 * 메인 버튼 표시
 *
 * @param text - 버튼 텍스트
 * @param callback - 버튼 클릭 시 호출될 함수
 * @param options - 추가 옵션
 * @example
 * ```typescript
 * const unsubscribe = showMainButton('결제하기', async () => {
 *   await processPayment();
 * });
 * ```
 */
export function showMainButton(
  text: string,
  callback: () => void | Promise<void>,
  options?: { color?: string; text_color?: string }
): () => void {
  const webApp = getTelegramWebApp();
  if (!webApp) return () => {};

  try {
    webApp.MainButton?.setText?.(text);
    if (options?.color) {
      webApp.MainButton?.setParams?.({ color: options.color });
    }
    webApp.MainButton?.show?.();
    webApp.onEvent?.('mainButtonClicked', callback);

    return () => {
      webApp.MainButton?.hide?.();
      webApp.offEvent?.('mainButtonClicked', callback);
    };
  } catch (error) {
    console.warn('[TMA] Failed to show main button:', error);
    return () => {};
  }
}

/**
 * 메인 버튼 숨기기
 */
export function hideMainButton(): void {
  const webApp = getTelegramWebApp();
  webApp?.MainButton?.hide?.();
}

/**
 * 메인 버튼 활성화/비활성화
 */
export function setMainButtonEnabled(enabled: boolean): void {
  const webApp = getTelegramWebApp();
  if (enabled) {
    webApp?.MainButton?.enable?.();
  } else {
    webApp?.MainButton?.disable?.();
  }
}

/**
 * 메인 버튼 로딩 상태 설정
 */
export function setMainButtonLoading(loading: boolean): void {
  const webApp = getTelegramWebApp();
  if (loading) {
    webApp?.MainButton?.showProgress?.();
  } else {
    webApp?.MainButton?.hideProgress?.();
  }
}

// ============================================
// 해플틱 피드백
// ============================================

/**
 * 임팩트 해플틱 진동
 *
 * @param style - 진동 강도 ('light' | 'medium' | 'heavy')
 * @example
 * ```typescript
 * // 결과 발표 시
 * triggerHapticFeedback('medium');
 * ```
 */
export function triggerHapticFeedback(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  const webApp = getTelegramWebApp();
  try {
    const impactStyle: Record<string, any> = {
      light: { impact_style: 'light' },
      medium: { impact_style: 'medium' },
      heavy: { impact_style: 'heavy' },
    };
    webApp?.HapticFeedback?.impactOccurred?.(impactStyle[style]);
  } catch (error) {
    console.warn('[TMA] Haptic feedback not available:', error);
  }
}

/**
 * 선택 해플틱 피드백
 */
export function triggerSelectionHaptic(): void {
  const webApp = getTelegramWebApp();
  try {
    webApp?.HapticFeedback?.selectionChanged?.();
  } catch (error) {
    console.warn('[TMA] Selection haptic not available:', error);
  }
}

/**
 * 성공 해플틱 피드백
 */
export function triggerSuccessHaptic(): void {
  const webApp = getTelegramWebApp();
  try {
    webApp?.HapticFeedback?.notificationOccurred?.({ type: 'success' });
  } catch (error) {
    console.warn('[TMA] Success haptic not available:', error);
  }
}

/**
 * 오류 해플틱 피드백
 */
export function triggerErrorHaptic(): void {
  const webApp = getTelegramWebApp();
  try {
    webApp?.HapticFeedback?.notificationOccurred?.({ type: 'error' });
  } catch (error) {
    console.warn('[TMA] Error haptic not available:', error);
  }
}

// ============================================
// 클립보드
// ============================================

/**
 * 텍스트를 클립보드에 복사
 *
 * @example
 * ```typescript
 * copyToClipboard('https://example.com');
 * showToast('링크가 복사되었습니다.');
 * ```
 */
export function copyToClipboard(text: string): void {
  const webApp = getTelegramWebApp();
  try {
    webApp?.setData?.(text);
  } catch (error) {
    // 폴백: 표준 Clipboard API 사용
    navigator.clipboard.writeText(text).catch((err) => {
      console.warn('[TMA] Clipboard copy failed:', err);
    });
  }
}
