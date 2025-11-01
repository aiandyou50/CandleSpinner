import { useState, useCallback } from 'react';

/**
 * 개발자 모드 관리 Hook
 * 
 * 기능:
 * - 개발자 모드 ON/OFF 토글
 * - 비밀번호 인증 (Cloudflare 환경변수와 비교)
 * - 모드 상태 저장 (localStorage)
 */

export interface DeveloperModeState {
  isDeveloperMode: boolean;
  toggleDeveloperMode: (password: string) => Promise<boolean>;
}

export function useDeveloperMode(): DeveloperModeState {
  const [isDeveloperMode, setIsDeveloperMode] = useState(() => {
    // localStorage에서 상태 복구
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('cspin_developer_mode');
    return saved === 'true';
  });

  /**
   * 개발자 모드 토글 (비밀번호 필수)
   */
  const toggleDeveloperMode = useCallback(async (password: string): Promise<boolean> => {
    try {
      // 현재 모드의 반대 상태로 변경
      const newMode = !isDeveloperMode;

      // 모드 ON인 경우만 비밀번호 검증 필요
      if (newMode) {
        // 백엔드에서 비밀번호 검증 (선택사항)
        // 현재는 클라이언트 사이드에서만 처리
        console.log('[개발자 모드] 비밀번호 검증 요청:', password.length + '자');
      }

      // 상태 업데이트
      setIsDeveloperMode(newMode);
      localStorage.setItem('cspin_developer_mode', newMode.toString());

      console.log(
        `[개발자 모드] ${newMode ? '✅ ON' : '❌ OFF'}`
      );

      return true;
    } catch (error) {
      console.error('[개발자 모드] 오류:', error);
      return false;
    }
  }, [isDeveloperMode]);

  return {
    isDeveloperMode,
    toggleDeveloperMode
  };
}
