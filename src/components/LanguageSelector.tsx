/**
 * Language Selector Component
 * Dropdown for selecting application language with flag icons
 * 쿠키 기반 언어 저장 + 브라우저 언어 자동 감지
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SUPPORTED_LANGUAGES, 
  type SupportedLanguage,
  getInitialLanguage,
  saveLanguageToCookie
} from '@/utils/language';
import '../styles/language-selector.css';

type LanguageSelectorProps = {
  disabled?: boolean;
};

export function LanguageSelector({ disabled = false }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage];

  // 초기 언어 설정 (마운트 시 한 번만)
  useEffect(() => {
    const initialLang = getInitialLanguage();
    setCurrentLanguage(initialLang);
    console.log('[LanguageSelector] Initial language:', initialLang);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    console.log('[LanguageSelector] Language changed:', lang);
    setCurrentLanguage(lang);
    saveLanguageToCookie(lang);
    setIsOpen(false);
    
    // 페이지 새로고침하여 언어 변경 반영
    window.location.reload();
  };

  return (
    <div
      className={`language-selector${disabled ? ' language-selector--disabled' : ''}`}
      ref={dropdownRef}
    >
      <button
        className="language-selector-button"
        onClick={() => {
          if (disabled) {
            return;
          }

          setIsOpen((prev) => !prev);
        }}
        aria-label="언어 선택"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        disabled={disabled}
      >
        <span className="language-flag">{currentLangInfo.flag}</span>
        <span className="language-name">{currentLangInfo.nativeName}</span>
        <svg
          className={`language-chevron ${isOpen ? 'open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="language-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, typeof SUPPORTED_LANGUAGES[SupportedLanguage]][]).map(
              ([code, info]) => (
                <button
                  key={code}
                  className={`language-option ${code === currentLanguage ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(code)}
                >
                  <span className="language-flag">{info.flag}</span>
                  <span className="language-name">{info.nativeName}</span>
                  {code === currentLanguage && (
                    <svg
                      className="check-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
