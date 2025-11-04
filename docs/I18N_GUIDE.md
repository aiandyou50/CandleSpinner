# Internationalization (i18n) Implementation Guide

## Overview
CandleSpinner now supports 9 languages with automatic detection, cookie-based persistence, and comprehensive translations across all user-facing components.

## Supported Languages

| Flag | Language | Code | Native Name |
|------|----------|------|-------------|
| 🇺🇸 | English | en-US | English |
| 🇰🇷 | Korean | ko-KR | 한국어 |
| 🇨🇳 | Chinese (Simplified) | zh-CN | 简体中文 |
| 🇹🇼 | Chinese (Traditional) | zh-TW | 繁體中文 |
| 🇻🇳 | Vietnamese | vi-VN | Tiếng Việt |
| 🇯🇵 | Japanese | ja-JP | 日本語 |
| 🇷🇺 | Russian | ru-RU | Русский |
| 🇪🇸 | Spanish | es-ES | Español |
| 🇮🇳 | Hindi | hi-IN | हिन्दी |

## Features

### Automatic Language Detection
- Detects browser language on first visit
- Falls back to English (en-US) if browser language is not supported
- Respects user's system preferences

### Cookie-based Persistence
- Stores user's language preference in a cookie (`preferredLanguage`)
- Cookie expires after 30 days
- Language preference persists across sessions and page refreshes
- Cookie is site-wide (applies to all pages)

### Dynamic Font Loading
Multi-language fonts are loaded from Google Fonts:
- **Noto Sans KR** for Korean
- **Noto Sans SC** for Simplified Chinese
- **Noto Sans TC** for Traditional Chinese
- **Noto Sans JP** for Japanese
- **Noto Sans Devanagari** for Hindi
- **Poppins** and **Open Sans** for Latin scripts

## Technical Implementation

### Dependencies
```json
{
  "i18next": "^23.x",
  "react-i18next": "^14.x",
  "i18next-browser-languagedetector": "^7.x",
  "js-cookie": "^3.x"
}
```

### Configuration
The i18n system is configured in `/src/i18n/config.ts`:
- Language resources imported from JSON files
- Custom cookie detector for language persistence
- Fallback language set to English (en-US)
- Browser language detection enabled

### Translation Files
Translation files are located in `/src/i18n/locales/`:
- `en-US.json` - English (default)
- `ko-KR.json` - Korean
- `zh-CN.json` - Chinese (Simplified)
- `zh-TW.json` - Chinese (Traditional)
- `vi-VN.json` - Vietnamese
- `ja-JP.json` - Japanese
- `ru-RU.json` - Russian
- `es-ES.json` - Spanish
- `hi-IN.json` - Hindi

### Translation Keys Structure
```
app.*          - App-level strings (title, version, footer)
header.*       - Header component strings
wallet.*       - Wallet connection strings
game.*         - Game interface strings
betting.*      - Betting control strings
buttons.*      - Common button labels
deposit.*      - Deposit component strings
withdraw.*     - Withdraw component strings
results.*      - Game results strings
doubleup.*     - Double-up game strings
symbols.*      - Symbol names
rarity.*       - Rarity levels
stats.*        - Statistics strings
history.*      - Game history strings
errors.*       - Error messages
language.*     - Language selector strings
provably.*     - Provably Fair strings
```

## Usage in Components

### Basic Usage
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.subtitle')}</p>
    </div>
  );
}
```

### With Interpolation
```tsx
// Translation key: "deposit.min": "Minimum: {{amount}} CSPIN"
<p>{t('deposit.min', { amount: 10 })}</p>
```

### Language Selector Component
The `LanguageSelector` component is available for user language selection:
```tsx
import { LanguageSelector } from '@/components/LanguageSelector';

<LanguageSelector />
```

## Adding New Translations

### 1. Add Translation Key
Add the new key to all language files in `/src/i18n/locales/`:

```json
// en-US.json
{
  "newFeature": {
    "title": "New Feature Title"
  }
}

// ko-KR.json
{
  "newFeature": {
    "title": "새로운 기능 제목"
  }
}

// ... repeat for all 9 languages
```

### 2. Use in Component
```tsx
<h2>{t('newFeature.title')}</h2>
```

## Adding New Language

### 1. Create Translation File
Create a new JSON file in `/src/i18n/locales/` (e.g., `fr-FR.json`)

### 2. Add to Configuration
Update `/src/i18n/config.ts`:
```tsx
import frFR from './locales/fr-FR.json';

export const SUPPORTED_LANGUAGES = {
  // ... existing languages
  'fr-FR': { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
};

i18n.init({
  resources: {
    // ... existing resources
    'fr-FR': { translation: frFR },
  },
  // ...
});
```

### 3. Add Font Support (if needed)
Update `/index.html` to include appropriate Google Fonts for the new language.

## Testing

### Manual Testing
1. Open the application
2. Click the language selector in the top-right corner
3. Select different languages
4. Verify all UI elements update correctly
5. Refresh the page to verify cookie persistence

### Automated Testing
```bash
# Check translation key completeness
npm run test:i18n

# Verify all translations exist
npm run verify:translations
```

## Best Practices

### DO:
✅ Use translation keys for all user-facing text
✅ Keep translation keys organized by feature
✅ Use interpolation for dynamic content
✅ Test all supported languages before deployment
✅ Keep translations consistent across languages

### DON'T:
❌ Hardcode user-facing strings in components
❌ Use translation keys in non-user-facing code (logs, debug messages)
❌ Forget to add keys to all language files
❌ Use complex HTML in translation strings
❌ Assume all languages have the same text length

## Troubleshooting

### Language not changing
- Check browser console for errors
- Verify cookie is being set correctly
- Clear browser cache and cookies

### Missing translations
- Check that the key exists in all language files
- Verify the key path is correct
- Check for typos in translation keys

### Font not loading
- Check network tab for font loading errors
- Verify Google Fonts URL is correct
- Ensure fonts are specified in CSS font-family

## Future Enhancements
- [ ] Add more languages (Arabic, Portuguese, German, etc.)
- [ ] Implement RTL (Right-to-Left) support for Arabic/Hebrew
- [ ] Add translation management UI for admins
- [ ] Implement automatic translation validation
- [ ] Add language-specific number and date formatting
- [ ] Support for plural forms and gender
- [ ] Translation memory for consistency

## Support
For issues or questions about i18n implementation, please create an issue on GitHub with the `i18n` label.
