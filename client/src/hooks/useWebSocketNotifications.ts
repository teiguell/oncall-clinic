import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/errorLogger';

interface WebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  data?: any;
}

/**
 * Hook personalizado para manejar conexiones WebSocket para notificaciones
 * 
 * @param authToken - Token de autenticación (null si no hay usuario autenticado)
 * @param endpoint - Endpoint del WebSocket (ej: '/ws')
 * @param options - Opciones de configuración
 * @returns Estado de la conexión y última notificación recibida
 */
function useWebSocketNotifications(
  authToken: string | null,
  endpoint: string,
  options: WebSocketOptions = {}
) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<number | null>(null);
  
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onConnected,
    onDisconnected,
    onError
  } = options;
  
  // Función para crear la URL del WebSocket
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = `${protocol}//${window.location.host}${endpoint}`;
    return authToken ? `${baseUrl}?token=${authToken}` : baseUrl;
  }, [authToken, endpoint]);
  
  // Función para conectar WebSocket
  const connect = useCallback(() => {
    if (!authToken) {
      logger.debug('WebSocket: No auth token provided, not connecting');
      return;
    }
    
    // Si ya existe una conexión, la cerramos
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    try {
      const wsUrl = getWebSocketUrl();
      logger.debug(`WebSocket: Connecting to ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // Manejadores de eventos
      ws.onopen = () => {
        logger.info('WebSocket: Connection established');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        if (onConnected) onConnected();
      };
      
      ws.onclose = (event) => {
        logger.info(`WebSocket: Connection closed (code: ${event.code})`, { 
          reason: event.reason,
          wasClean: event.wasClean
        });
        setIsConnected(false);
        if (onDisconnected) onDisconnected();
        
        // Intentar reconectar si está habilitado
        if (autoReconnect && authToken) {
          handleReconnect();
        }
      };
      
      ws.onerror = (error) => {
        logger.error('WebSocket: Error occurred', { error });
        if (onError) onError(error);
      };
      
      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification;
          logger.debug('WebSocket: Message received', { notification });
          setLastNotification(notification);
        } catch (error) {
          logger.error('WebSocket: Error parsing message', { 
            error, 
            data: event.data 
          });
        }
      };
    } catch (error) {
      logger.error('WebSocket: Error creating connection', { error });
    }
  }, [authToken, getWebSocketUrl, autoReconnect, onConnected, onDisconnected, onError]);
  
  // Función para manejar la reconexión
  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      logger.warn(`WebSocket: Max reconnect attempts (${maxReconnectAttempts}) reached`);
      return;
    }
    
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
    }
    
    reconnectAttemptsRef.current++;
    
    const delay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1);
    logger.info(`WebSocket: Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
    
    reconnectTimerRef.current = window.setTimeout(() => {
      connect();
    }, delay);
  }, [connect, maxReconnectAttempts, reconnectInterval]);
  
  // Función para enviar un mensaje
  const sendMessage = useCallback((message: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      logger.warn('WebSocket: Cannot send message, connection not open');
      return false;
    }
    
    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(messageStr);
      return true;
    } catch (error) {
      logger.error('WebSocket: Error sending message', { error, message });
      return false;
    }
  }, []);
  
  // Efecto para conectar/desconectar el WebSocket
  useEffect(() => {
    // Solo conectar si tenemos un token de auth
    if (authToken) {
      connect();
    } else if (wsRef.current) {
      // Si no hay token y había conexión, cerrarla
      logger.debug('WebSocket: No auth token, closing connection');
      wsRef.current.close();
      setIsConnected(false);
    }
    
    // Limpieza al desmontar
    return () => {
      if (wsRef.current) {
        logger.debug('WebSocket: Cleaning up connection');
        wsRef.current.close();
      }
      
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [authToken, connect]);
  
  return {
    isConnected,
    lastNotification,
    sendMessage
  };
}

export default useWebSocketNotifications;