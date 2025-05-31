
import es from './locales/es';
import en from './locales/en';

// Importamos el logger para registrar eventos de i18n
import { logger } from '@/lib/errorLogger';

// SafeGuard para evitar múltiples inicializaciones
let isInitialized = false;

const initI18n = async () => {
  if (isInitialized) {
    return i18n;
  }

  try {
    logger.info('Initializing i18n...');
    
    // Verificamos que los archivos de traducción estén correctamente cargados
    if (!es || !en) {
      throw new Error('Translation files not loaded correctly');
    }
    
    // Inicializar con manejo de errores de forma sincrónica para evitar problemas de timing
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: {
          es: { translation: es },
          en: { translation: en }
        },
        fallbackLng: 'es',
        // Si una clave no existe, volvemos a 'es'
        returnEmptyString: true,
        interpolation: {
          escapeValue: false
        },
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage']
        },
        // Activar debug solo en desarrollo
        debug: import.meta.env.DEV,
        // Muy importante: esto evita el uso de t antes de que i18n esté listo
        initImmediate: false
      });
    
    isInitialized = true;
    logger.info('i18n initialized successfully', { currentLang: i18n.language });
    
    // Añadir listener para cambios de idioma
    i18n.on('languageChanged', (lang) => {
      logger.info('Language changed', { lang });
    });
    
    return i18n;
  } catch (error) {
    logger.error('Failed to initialize i18n', { error });
    // Implementación de respaldo en caso de error
    console.error('Critical i18n initialization error:', error);
    
    // Implementamos un i18n mínimo de emergencia para evitar que la app se rompa
    i18n.init({
      lng: 'es',
      resources: {
        es: {
          translation: {
            error: {
              i18n: 'Error loading translations. Please reload the page.'
            }
          }
        }
      },
      initImmediate: false
    });
    
    return i18n;
  }
};

// Iniciamos i18n inmediatamente
initI18n().catch(err => {
  console.error('Critical error in i18n initialization:', err);
});

// Helper function para traducciones seguras
export const safeT = (key: string, options?: any): string => {
  try {
    if (!i18n.isInitialized) {
      return key; // Devolver la clave como fallback si i18n no está inicializado
    }
    const translation = i18nsafeT(key, options);
    // Aseguramos que siempre devolvemos un string
    return typeof translation === 'string' ? translation : key;
  } catch (error) {
    logger.warn(`Translation error for key: ${key}`, { error });
    return key; // Devolver la clave como fallback
  }
};

export default i18n;
