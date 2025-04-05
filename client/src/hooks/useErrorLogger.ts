import { useEffect, useRef } from 'react';
import { logger } from '@/lib/errorLogger';

/**
 * Hook personalizado para utilizar el sistema de logging de errores
 * Registra eventos del ciclo de vida del componente y proporciona
 * métodos para registrar errores, advertencias e información
 * 
 * @param componentName - Nombre del componente
 * @returns Objeto logger para usar en el componente
 */
const useErrorLogger = (componentName?: string) => {
  const name = componentName || 'UnnamedComponent';
  const mounted = useRef(false);
  
  // Registrar montaje y desmontaje del componente
  useEffect(() => {
    mounted.current = true;
    logger.debug(`${name} montado`);
    
    return () => {
      logger.debug(`${name} desmontado`);
      mounted.current = false;
    };
  }, [name]);
  
  // Devolver objeto con métodos para loggear
  return {
    // Loggear un error con contexto
    error: (message: string, extra?: any) => {
      if (mounted.current) {
        logger.error(`[${name}] ${message}`, extra);
      }
    },
    
    // Loggear una advertencia con contexto
    warn: (message: string, extra?: any) => {
      if (mounted.current) {
        logger.warn(`[${name}] ${message}`, extra);
      }
    },
    
    // Loggear información con contexto
    info: (message: string, extra?: any) => {
      if (mounted.current) {
        logger.info(`[${name}] ${message}`, extra);
      }
    },
    
    // Loggear mensaje de debug con contexto
    debug: (message: string, extra?: any) => {
      if (mounted.current) {
        logger.debug(`[${name}] ${message}`, extra);
      }
    },
    
    // Envolver un callback con un try/catch que loggea errores automáticamente
    wrapCallback: <T extends (...args: any[]) => any>(
      callback: T, 
      errorMessage = 'Error en callback'
    ) => {
      return ((...args: Parameters<T>): ReturnType<T> | undefined => {
        try {
          return callback(...args);
        } catch (error) {
          logger.error(`[${name}] ${errorMessage}`, { error, args });
          
          // No propagamos el error ya que lo hemos logeado
          // Si se necesita propagarlo, definir el parámetro throwAfterLog = true
          return undefined;
        }
      }) as T;
    }
  };
};

export default useErrorLogger;