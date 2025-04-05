
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es';
import en from './locales/en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en }
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en';
import esTranslations from './locales/es';

// Initialize i18next
(async () => {
  await i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize configuration
    .init({
      resources: {
        en: {
          translation: enTranslations,
        },
        es: {
          translation: esTranslations,
        }
      },
      fallbackLng: 'es', // Default to Spanish as requested
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false, // React already escapes
      },
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage'],
      },
    });
})();

export default i18n;
