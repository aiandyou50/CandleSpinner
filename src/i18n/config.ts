/**
 * i18n Configuration
 * Supports 9 languages with browser detection and cookie persistence
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';

// Import translation files
import enUS from './locales/en-US.json';
import koKR from './locales/ko-KR.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import viVN from './locales/vi-VN.json';
import jaJP from './locales/ja-JP.json';
import ruRU from './locales/ru-RU.json';
import esES from './locales/es-ES.json';
import hiIN from './locales/hi-IN.json';

// Cookie name for language preference
export const LANGUAGE_COOKIE_NAME = 'preferredLanguage';
export const LANGUAGE_COOKIE_EXPIRES = 30; // days

// Supported languages
export const SUPPORTED_LANGUAGES = {
  'en-US': { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  'ko-KR': { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  'zh-CN': { name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  'zh-TW': { name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  'vi-VN': { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  'ja-JP': { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  'ru-RU': { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  'es-ES': { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  'hi-IN': { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Custom language detector with cookie support
const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: 'customCookie',
  lookup() {
    return Cookies.get(LANGUAGE_COOKIE_NAME);
  },
  cacheUserLanguage(lng: string) {
    Cookies.set(LANGUAGE_COOKIE_NAME, lng, { expires: LANGUAGE_COOKIE_EXPIRES });
  },
});

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': { translation: enUS },
      'ko-KR': { translation: koKR },
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
      'vi-VN': { translation: viVN },
      'ja-JP': { translation: jaJP },
      'ru-RU': { translation: ruRU },
      'es-ES': { translation: esES },
      'hi-IN': { translation: hiIN },
    },
    fallbackLng: 'en-US',
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    detection: {
      order: ['customCookie', 'navigator'],
      caches: ['customCookie'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
