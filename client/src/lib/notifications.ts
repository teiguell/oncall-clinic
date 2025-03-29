import { apiRequest } from "@/lib/queryClient";
import { getStoredSession } from "@/lib/auth";
import { Notification } from "@/types";

// Interface for real-time WebSocket notifications
interface WSNotification {
  type: string;
  message: string;
  appointmentId?: number;
  status?: string;
  timestamp?: string;
  [key: string]: any;
}

// WebSocket connection for real-time notifications
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

// Setup WebSocket connection
export const setupNotificationsSocket = (): void => {
  const sessionData = getStoredSession();
  if (!sessionData) return;
  
  // Clear any existing reconnect timers
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  // Close existing connection if any
  if (socket) {
    socket.close();
  }
  
  // Create new WebSocket connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  socket = new WebSocket(wsUrl);
  
  socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
    // Reset reconnect attempts on successful connection
    reconnectAttempts = 0;
    
    // Authenticate the WebSocket connection
    if (socket && sessionData) {
      socket.send(JSON.stringify({
        type: 'auth',
        sessionId: sessionData.sessionId
      }));
    }
  });
  
  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  socket.addEventListener('close', (event) => {
    console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
    
    // Attempt to reconnect if not a normal closure and we haven't exceeded max attempts
    if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      
      reconnectTimer = setTimeout(() => {
        setupNotificationsSocket();
      }, RECONNECT_DELAY);
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Maximum reconnection attempts reached. Please refresh the page.');
    }
  });
};

// Close WebSocket connection
export const closeNotificationsSocket = (): void => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

// Subscribe to notifications
export const subscribeToNotifications = (callback: (notification: WSNotification) => void): () => void => {
  if (!socket) {
    setupNotificationsSocket();
  }
  
  const handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as WSNotification;
      callback(data);
    } catch (error) {
      console.error('Error parsing notification:', error);
    }
  };
  
  if (socket) {
    socket.addEventListener('message', handleMessage);
  }
  
  // Return unsubscribe function
  return () => {
    if (socket) {
      socket.removeEventListener('message', handleMessage);
    }
  };
};

// Get all notifications
export const getNotifications = async (): Promise<Notification[]> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest("GET", "/api/notifications", undefined, {
    headers: {
      Authorization: `Bearer ${sessionData.sessionId}`
    }
  });
  
  return response.json();
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {}, {
    headers: {
      Authorization: `Bearer ${sessionData.sessionId}`
    }
  });
  
  return response.json();
};

// Format notification message for display
export const formatNotification = (notification: Notification | WSNotification): {
  title: string;
  message: string;
  icon: string;
} => {
  // Default values
  let title = "Notificación";
  let icon = "notifications";
  let message = "";
  
  // Check notification source (websocket or database)
  const isWebsocketNotification = 'message' in notification;
  
  // Get the notification type
  const type = notification.type;
  
  // Get message from the correct property based on notification source
  if (isWebsocketNotification) {
    message = (notification as WSNotification).message;
  } else {
    message = (notification as Notification).content;
  }
  
  // Set appropriate icon and title based on notification type
  switch (type) {
    case 'new_appointment':
      title = "Nueva cita";
      icon = "calendar_today";
      break;
    case 'appointment_update':
      title = "Actualización de cita";
      icon = "event_note";
      break;
    case 'appointment_reminder':
      title = "Recordatorio de cita";
      icon = "alarm";
      break;
    case 'appointment_status':
      title = "Estado de cita actualizado";
      
      // Get status from the correct property
      let status: string | undefined;
      
      if (isWebsocketNotification) {
        status = (notification as WSNotification).status;
      } else if ((notification as Notification).data) {
        status = (notification as Notification).data?.status;
      }
      
      // Use different icons based on status if available
      if (status) {
        switch (status) {
          case 'confirmed':
            icon = "check_circle";
            break;
          case 'en_route':
            icon = "directions_car";
            break;
          case 'arrived':
            icon = "location_on";
            break;
          case 'in_progress':
            icon = "medical_services";
            break;
          case 'completed':
            icon = "task_alt";
            break;
          case 'canceled':
            icon = "cancel";
            break;
          default:
            icon = "event_note";
        }
      } else {
        icon = "event_note";
      }
      break;
    case 'new_review':
      title = "Nueva reseña";
      icon = "star";
      break;
    case 'payment_success':
      title = "Pago exitoso";
      icon = "check_circle";
      break;
    case 'payment_failed':
      title = "Error en el pago";
      icon = "error";
      break;
    case 'appointment_paid':
      title = "Cita pagada";
      icon = "paid";
      break;
  }
  
  return {
    title,
    message,
    icon
  };
};
