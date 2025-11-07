/**
 * 언어 관리 유틸리티
 * 브라우저 언어 감지 + 쿠키 기반 저장
 */

// 지원하는 언어 목록
export const SUPPORTED_LANGUAGES = {
  'en': { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  'ko': { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  'zh-CN': { name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  'zh-TW': { name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  'ja': { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  'ru': { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  'es': { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

const LANGUAGE_COOKIE_NAME = 'preferredLanguage';
const LANGUAGE_COOKIE_EXPIRES = 365; // 1년

/**
 * 쿠키에서 언어 가져오기
 */
export function getLanguageFromCookie(): SupportedLanguage | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === LANGUAGE_COOKIE_NAME && value) {
      const lang = decodeURIComponent(value);
      if (lang in SUPPORTED_LANGUAGES) {
        return lang as SupportedLanguage;
      }
    }
  }
  return null;
}

/**
 * 쿠키에 언어 저장
 */
export function saveLanguageToCookie(language: SupportedLanguage): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + LANGUAGE_COOKIE_EXPIRES);
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(language)}; expires=${expires.toUTCString()}; path=/`;
}

/**
 * 브라우저 언어 감지
 * 지원하지 않는 언어면 'en' 반환
 */
export function detectBrowserLanguage(): SupportedLanguage {
  // 브라우저 언어 목록 가져오기
  const browserLanguages = navigator.languages || [navigator.language];
  
  console.log('[Language] Browser languages:', browserLanguages);
  
  for (const browserLang of browserLanguages) {
    // 정확한 매칭 (예: ko-KR → ko)
    const normalized = browserLang.toLowerCase();
    
    // 1. 정확한 일치 확인
    if (normalized in SUPPORTED_LANGUAGES) {
      console.log('[Language] Exact match:', normalized);
      return normalized as SupportedLanguage;
    }
    
    // 2. 중국어 특별 처리 (간체/번체)
    if (normalized.startsWith('zh')) {
      if (normalized.includes('tw') || normalized.includes('hk') || normalized.includes('mo')) {
        console.log('[Language] Detected Traditional Chinese');
        return 'zh-TW';
      } else {
        console.log('[Language] Detected Simplified Chinese');
        return 'zh-CN';
      }
    }
    
    // 3. 언어 코드만 추출 (ko-KR → ko)
    const langCode = normalized.split('-')[0];
    if (langCode && langCode in SUPPORTED_LANGUAGES) {
      console.log('[Language] Language code match:', langCode);
      return langCode as SupportedLanguage;
    }
  }
  
  console.log('[Language] No match found, using default: en');
  return 'en';
}

/**
 * 초기 언어 설정
 * 우선순위: 쿠키 > 브라우저 언어 > 기본값(en)
 */
export function getInitialLanguage(): SupportedLanguage {
  // 1. 쿠키에서 확인
  const cookieLang = getLanguageFromCookie();
  if (cookieLang) {
    console.log('[Language] Loaded from cookie:', cookieLang);
    return cookieLang;
  }
  
  // 2. 브라우저 언어 감지
  const detectedLang = detectBrowserLanguage();
  console.log('[Language] Detected from browser:', detectedLang);
  
  // 감지된 언어를 쿠키에 저장
  saveLanguageToCookie(detectedLang);
  
  return detectedLang;
}
