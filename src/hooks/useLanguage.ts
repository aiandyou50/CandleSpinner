/**
 * useLanguage Hook
 * 현재 언어 상태 관리 및 번역 함수 제공
 */

import { useState, useEffect } from 'react';
import { getInitialLanguage, type SupportedLanguage } from '@/utils/language';
import { getTranslations, type Translations } from '@/utils/translations';

export function useLanguage() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [translations, setTranslations] = useState<Translations>(getTranslations('en'));

  useEffect(() => {
    const initialLang = getInitialLanguage();
    setLanguage(initialLang);
    setTranslations(getTranslations(initialLang));
    
    console.log('[useLanguage] Language initialized:', initialLang);
  }, []);

  return {
    language,
    translations,
    t: translations,
  };
}
