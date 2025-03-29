import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface WSNotification {
  type: string;
  appointmentId?: string | number;
  newStatus?: string;
  message?: string;
  timestamp: number;
  [key: string]: any; // Allow for additional properties
}

interface WebSocketNotificationResult {
  isConnected: boolean;
  lastNotification: WSNotification | null;
  notifications: WSNotification[];
  clearNotifications: () => void;
  reconnect: () => void;
}

interface WebSocketNotificationsOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
  onNotification?: (notification: WSNotification) => void;
}

/**
 * Hook for handling WebSocket notifications with i18n support
 * @param token JWT token for authentication
 * @param wsUrl WebSocket server URL
 * @param options Configuration options
 * @returns WebSocketNotificationResult
 */
const useWebSocketNotifications = (
  token: string | null,
  wsUrl: string,
  options: WebSocketNotificationsOptions = {}
): WebSocketNotificationResult => {
  // Extract options with defaults
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onConnected,
    onDisconnected,
    onError,
    onNotification
  } = options;

  // State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<WSNotification | null>(null);
  const [notifications, setNotifications] = useState<WSNotification[]>([]);

  // Refs to avoid dependency issues in effects
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // i18n translation hook
  const { t, i18n } = useTranslation();
  
  // Format and show notification toast with translations
  const showNotificationToast = useCallback((notification: WSNotification) => {
    let title = '';
    let content = '';
    
    // Determine title based on notification type
    if (notification.type === 'appointment_status') {
      title = t('notifications.titleLabels.appointment');
      
      // Translate the appointment status
      const status = notification.newStatus ? 
        t(`appointmentStatus.${notification.newStatus}`) : 
        t('notifications.status.unknown');
        
      content = t('notifications.status.updated', { status });
    } else if (notification.type === 'payment') {
      title = t('notifications.titleLabels.payment');
      
      // Determine if payment was successful or failed
      if (notification.status === 'success') {
        content = t('notifications.paymentSuccess', { amount: notification.amount });
      } else {
        content = t('notifications.paymentFailed', { amount: notification.amount });
      }
    } else if (notification.type === 'system') {
      title = t('notifications.titleLabels.system');
      content = notification.message || t('common.na');
    } else if (notification.type === 'review') {
      title = t('notifications.titleLabels.newReview');
      content = t('notifications.review.received');
    }

    // Show toast with translated content
    toast.info(`${title}: ${content}`);
  }, [t]);

  // Handle reconnection logic
  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current += 1;
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        toast.warning(t('errors.websocket.reconnecting'));
        setupWebSocket();
      }, reconnectInterval);
    }
  }, [maxReconnectAttempts, reconnectInterval, t]);

  // Set up WebSocket connection
  const setupWebSocket = useCallback(() => {
    if (!token) {
      console.warn('No authentication token provided. WebSocket connection aborted.');
      return;
    }

    // Close existing connection if there is one
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    // Determine protocol (ws or wss)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const fullWsUrl = wsUrl.startsWith('ws') ? wsUrl : `${protocol}//${window.location.host}${wsUrl}`;
    
    // Create new WebSocket
    wsRef.current = new WebSocket(fullWsUrl);

    // Handle connection opened
    wsRef.current.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      // Send authentication message once connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'auth',
          sessionId: token
        }));
      }
      
      if (onConnected) onConnected();
    };

    // Handle incoming messages
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSNotification;
        
        // Update state with the new notification
        setLastNotification(data);
        setNotifications(prev => [data, ...prev].slice(0, 50)); // Limit to 50 notifications
        
        // Show toast notification
        showNotificationToast(data);
        
        // Call custom callback if provided
        if (onNotification) onNotification(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    // Handle connection close
    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      
      if (onDisconnected) onDisconnected();
      
      // Auto reconnect if enabled
      if (autoReconnect) {
        reconnect();
      }
    };

    // Handle errors
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error(t('errors.websocket.connectionFailed'));
      
      if (onError) onError(error);
    };
  }, [
    token, 
    wsUrl, 
    autoReconnect, 
    onConnected, 
    onDisconnected, 
    onError, 
    onNotification, 
    reconnect, 
    showNotificationToast,
    t
  ]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Set up WebSocket when component mounts or token changes
  useEffect(() => {
    setupWebSocket();

    // Clean up on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, setupWebSocket]);

  // Re-subscribe to WebSocket when language changes to update notifications
  useEffect(() => {
    if (isConnected && wsRef.current) {
      // Language has changed, we don't need to reconnect
      // But we might want to update any cached translated content
    }
  }, [i18n.language, isConnected]);

  return {
    isConnected,
    lastNotification,
    notifications,
    clearNotifications,
    reconnect
  };
};

export default useWebSocketNotifications;