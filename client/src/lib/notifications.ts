import { apiRequest } from "@/lib/queryClient";
import { getStoredSession } from "@/lib/auth";
import { Notification } from "@/types";

// WebSocket connection for real-time notifications
let socket: WebSocket | null = null;

// Setup WebSocket connection
export const setupNotificationsSocket = (): void => {
  const sessionData = getStoredSession();
  if (!sessionData) return;
  
  // Close existing connection if any
  if (socket) {
    socket.close();
  }
  
  // Create new WebSocket connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  socket = new WebSocket(wsUrl);
  
  socket.addEventListener('open', () => {
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
};

// Close WebSocket connection
export const closeNotificationsSocket = (): void => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

// Subscribe to notifications
export const subscribeToNotifications = (callback: (notification: any) => void): () => void => {
  if (!socket) {
    setupNotificationsSocket();
  }
  
  const handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
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
export const formatNotification = (notification: Notification): {
  title: string;
  message: string;
  icon: string;
} => {
  // Default values
  let title = "Notificación";
  let icon = "notifications";
  
  // Set appropriate icon and title based on notification type
  switch (notification.type) {
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
    message: notification.content,
    icon
  };
};
