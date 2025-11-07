/**
 * useLanguage Hook
 * 현재 언어 상태 관리 및 번역 함수 제공
 */

import { useState, useEffect } from 'react';
import { getInitialLanguage, type SupportedLanguage } from '@/utils/language';
import { getTranslations, type Translations } from '@/utils/translations';

export function useLanguage() {
  // ✅ 초기값을 getInitialLanguage()의 결과로 직접 설정
  const initialLang = getInitialLanguage();
  const [language, setLanguage] = useState<SupportedLanguage>(initialLang);
  const [translations, setTranslations] = useState<Translations>(getTranslations(initialLang));

  useEffect(() => {
    // 마운트 시 다시 한 번 확인 (혹시 모를 상태 불일치 방지)
    const currentLang = getInitialLanguage();
    if (currentLang !== language) {
      setLanguage(currentLang);
      setTranslations(getTranslations(currentLang));
    }
    
    console.log('[useLanguage] Language initialized:', language);
    console.log('[useLanguage] deposit.title:', translations.deposit.title);
    console.log('[useLanguage] buttons.deposit:', translations.buttons.deposit);
  }, []);

  return {
    language,
    translations,
    t: translations,
  };
}
