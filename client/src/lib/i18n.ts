import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '@/locales/en.json';

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
  if (lang === 'en') return enTranslations;
  
  switch (lang) {
    case 'ko': return (await import('@/locales/ko.json')).default;
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
    default: return enTranslations;
  }
};

let initialized = false;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
    },
    lng: 'en',
    supportedLngs: ['en', 'zh', 'ja', 'hi', 'es', 'fr', 'ar', 'bn', 'ru', 'pt', 'ur', 'ko'],
    fallbackLng: 'en',
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
  const targetLang = storedLang || 'en';
  
  updateDocumentDirection(targetLang);
  
  if (targetLang !== 'en' && !i18n.hasResourceBundle(targetLang, 'translation')) {
    try {
      const translations = await loadLocale(targetLang);
      i18n.addResourceBundle(targetLang, 'translation', translations, true, true);
      await i18n.changeLanguage(targetLang);
      console.log(`[i18n] Switched to ${targetLang}`);
    } catch (error) {
      console.warn(`[i18n] Failed to load ${targetLang}, using English`);
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
      console.warn(`Failed to load locale ${lang}, falling back to English`);
      i18n.changeLanguage('en');
    }
  }
});

export const changeLanguageWithPreload = async (lang: string): Promise<void> => {
  // Save language preference to localStorage for synchronization with other pages
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('tburn-language', lang);
  }
  
  if (lang === 'en') {
    await i18n.changeLanguage(lang);
    return;
  }
  
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    try {
      const translations = await loadLocale(lang);
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
    } catch (error) {
      console.warn(`[i18n] Failed to load ${lang}, falling back to English`);
      return;
    }
  }
  
  await i18n.changeLanguage(lang);
};

export default i18n;
