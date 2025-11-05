/**
 * Language Selector Component
 * Dropdown for selecting application language with flag icons
 * Uses React Portal to escape stacking context issues
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/config';
import '../styles/language-selector.css';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const currentLanguage = i18n.language as SupportedLanguage;
  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES['en-US'];

  // Update dropdown position when button is clicked
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap
        left: rect.right - 200, // 200px is min-width of dropdown, align right
        width: rect.width
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <>
      <div className="language-selector">
        <button
          ref={buttonRef}
          className="language-selector-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('language.select')}
          aria-expanded={isOpen}
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
      </div>

      {/* Render dropdown via Portal to escape stacking context */}
      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            className="language-dropdown-portal"
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
