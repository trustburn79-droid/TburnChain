import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
] as const;

export type LanguageCode = typeof languages[number]['code'];

const RTL_LANGUAGES = ['ar', 'ur'];

const updateDocumentDirection = (lang: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
  }
};

const loadLocale = async (lang: string): Promise<Record<string, unknown>> => {
  switch (lang) {
    case 'en': return en;
    case 'zh': return (await import('@/locales/zh.json')).default;
    case 'ja': return (await import('@/locales/ja.json')).default;
    case 'hi': return (await import('@/locales/hi.json')).default;
    case 'es': return (await import('@/locales/es.json')).default;
    case 'fr': return (await import('@/locales/fr.json')).default;
    case 'ar': return (await import('@/locales/ar.json')).default;
    case 'bn': return (await import('@/locales/bn.json')).default;
    case 'ru': return (await import('@/locales/ru.json')).default;
    case 'pt': return (await import('@/locales/pt.json')).default;
    case 'ur': return (await import('@/locales/ur.json')).default;
    case 'ko': return (await import('@/locales/ko.json')).default;
    default: return en;
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    supportedLngs: ['en', 'zh', 'ja', 'hi', 'es', 'fr', 'ar', 'bn', 'ru', 'pt', 'ur', 'ko'],
    load: 'languageOnly',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      caches: ['localStorage'],
      lookupLocalStorage: 'tburn-language',
    },
  });

i18n.on('initialized', async () => {
  const lang = i18n.language;
  updateDocumentDirection(lang);
  
  if (lang !== 'en' && !i18n.hasResourceBundle(lang, 'translation')) {
    try {
      const translations = await loadLocale(lang);
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
    } catch (error) {
      console.warn(`Failed to load locale ${lang}, falling back to English`);
    }
  }
});

i18n.on('languageChanged', async (lang) => {
  updateDocumentDirection(lang);
  
  if (lang !== 'en' && !i18n.hasResourceBundle(lang, 'translation')) {
    try {
      const translations = await loadLocale(lang);
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
    } catch (error) {
      console.warn(`Failed to load locale ${lang}, falling back to English`);
      i18n.changeLanguage('en');
    }
  }
});

export default i18n;
