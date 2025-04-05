import { IS_SANDBOX } from './sandbox';

// Tipos de entradas de log (exportados para uso en otros componentes)
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogEntry = {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  details?: any;
};

/**
 * Clase para manejar el registro y almacenamiento de errores
 * Implementa patrón Singleton para asegurar una sola instancia
 */
class ErrorLogger {
  private static instance: ErrorLogger;
  
  // Cantidad máxima de logs a mantener en memoria
  private readonly MAX_LOGS = 100;
  
  // Cola de logs (memoria)
  private logs: LogEntry[] = [];
  
  // Callbacks para notificar sobre nuevos logs
  private subscribers: ((log: LogEntry) => void)[] = [];
  
  private constructor() {
    this.setupWindowErrorHandlers();
  }
  
  /**
   * Obtiene la instancia única del logger
   */
  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }
  
  /**
   * Configura manejadores de error a nivel de ventana
   */
  private setupWindowErrorHandlers(): void {
    if (typeof window === 'undefined') return;
    
    // Capturar errores no controlados
    window.addEventListener('error', (event) => {
      this.error('Error no controlado', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
      
      // No prevenimos el comportamiento por defecto
    });
    
    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Promesa rechazada no controlada', {
        reason: event.reason,
      });
    });
    
    // Sobrescribir console.error para capturar logs a consola
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Loggear internamente
      this.error('Console.error:', args);
      
      // Llamar al método original
      originalConsoleError.apply(console, args);
    };
    
    // En modo de desarrollo, también capturar console.warn
    if (IS_SANDBOX) {
      const originalConsoleWarn = console.warn;
      console.warn = (...args) => {
        // Loggear como warning
        this.warn('Console.warn:', args);
        
        // Llamar al método original
        originalConsoleWarn.apply(console, args);
      };
    }
  }
  
  /**
   * Genera una entrada de log
   */
  private createLogEntry(level: LogLevel, message: string, details?: any): LogEntry {
    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      level,
      message,
      details,
    };
  }
  
  /**
   * Agrega una entrada de log a la cola
   */
  private logInternal(level: LogLevel, message: string, details?: any): LogEntry {
    const logEntry = this.createLogEntry(level, message, details);
    
    // Agregar al inicio para tener los más recientes primero
    this.logs.unshift(logEntry);
    
    // Limitar tamaño de la cola
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }
    
    // Notificar a los suscriptores
    this.subscribers.forEach(callback => callback(logEntry));
    
    return logEntry;
  }
  
  /**
   * Registra un mensaje informativo
   */
  public info(message: string, details?: any): void {
    this.logInternal('info', message, details);
  }
  
  /**
   * Registra una advertencia
   */
  public warn(message: string, details?: any): void {
    this.logInternal('warn', message, details);
  }
  
  /**
   * Registra un error
   */
  public error(message: string, details?: any): void {
    this.logInternal('error', message, details);
  }
  
  /**
   * Registra un mensaje de depuración
   * Solo se registra en modo SANDBOX
   */
  public debug(message: string, details?: any): void {
    if (IS_SANDBOX) {
      this.logInternal('debug', message, details);
    }
  }
  
  /**
   * Obtiene todos los logs almacenados
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Suscribe una función callback para recibir nuevos logs
   */
  public subscribe(callback: (log: LogEntry) => void): () => void {
    this.subscribers.push(callback);
    
    // Devuelve función para cancelar suscripción
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Limpia todos los logs
   */
  public clearLogs(): void {
    this.logs = [];
  }
}

// Exportar la instancia singleton
export const logger = ErrorLogger.getInstance();