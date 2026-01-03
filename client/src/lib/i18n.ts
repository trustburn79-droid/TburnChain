import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import koTranslations from '@/locales/ko.json';

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
  if (lang === 'ko') return koTranslations;
  
  switch (lang) {
    case 'en': return (await import('@/locales/en.json')).default;
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
    default: return koTranslations;
  }
};

let initialized = false;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: {
        translation: koTranslations,
      },
    },
    lng: 'ko',
    supportedLngs: ['en', 'zh', 'ja', 'hi', 'es', 'fr', 'ar', 'bn', 'ru', 'pt', 'ur', 'ko'],
    fallbackLng: 'ko',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    returnNull: false,
  });

export const initializeI18n = async (): Promise<void> => {
  if (initialized) {
    console.log('[i18n] Already initialized, skipping...');
    return;
  }
  initialized = true;
  
  const storedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('tburn-language') : null;
  const targetLang = storedLang || 'ko';
  
  updateDocumentDirection(targetLang);
  
  if (targetLang !== 'ko' && !i18n.hasResourceBundle(targetLang, 'translation')) {
    try {
      const translations = await loadLocale(targetLang);
      i18n.addResourceBundle(targetLang, 'translation', translations, true, true);
      await i18n.changeLanguage(targetLang);
      console.log(`[i18n] Switched to ${targetLang}`);
    } catch (error) {
      console.warn(`[i18n] Failed to load ${targetLang}, using Korean`);
    }
  }
  
  console.log(`[i18n] Initialized with ${i18n.language}`);
};

i18n.on('languageChanged', async (lang) => {
  updateDocumentDirection(lang);
  
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    try {
      const translations = await loadLocale(lang);
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
    } catch (error) {
      console.warn(`Failed to load locale ${lang}, falling back to Korean`);
      i18n.changeLanguage('ko');
    }
  }
});

export default i18n;
