import { Notification } from '@shared/schema';

// Interface for WebSocket notifications, which have a different structure
// than database notifications
interface WSNotification {
  type: string;
  message?: string;
  appointmentId?: number;
  status?: string;
  timestamp?: string;
  [key: string]: any;
}

// Union type for handling both types of notifications
type AnyNotification = Notification | WSNotification;

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 3000;
const subscribers: ((notification: WSNotification) => void)[] = [];

export const setupNotificationsSocket = (): void => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      reconnectAttempts = 0;
      
      // Authenticate the WebSocket connection
      if (socket && socket.readyState === WebSocket.OPEN) {
        const sessionId = localStorage.getItem('sessionToken');
        if (sessionId) {
          socket.send(JSON.stringify({ type: 'auth', sessionId }));
        }
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        subscribers.forEach(callback => callback(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason);
      
      // Attempt to reconnect unless the connection was closed intentionally
      if (event.code !== 1000) {
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          setTimeout(setupNotificationsSocket, RECONNECT_DELAY_MS);
        } else {
          console.error('Maximum reconnection attempts reached');
        }
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Error setting up WebSocket:', error);
  }
};

export const closeNotificationsSocket = (): void => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(1000, 'Closing connection intentionally');
    socket = null;
  }
};

export const subscribeToNotifications = (callback: (notification: AnyNotification) => void): () => void => {
  subscribers.push(callback as (notification: WSNotification) => void);
  
  const handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (error) {
      console.error('Error parsing notification:', error);
    }
  };
  
  return () => {
    const index = subscribers.indexOf(callback as (notification: WSNotification) => void);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await fetch('/api/notifications');
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  
  return await response.json();
};

export const formatNotification = (notification: AnyNotification): {
  title: string;
  message: string;
  time: string;
  href?: string;
} => {
  // Get the current i18next instance
  const t = i18next.t.bind(i18next);

  // Handle different notification structures
  const timestamp = 'createdAt' in notification 
    ? new Date(notification.createdAt)
    : ('timestamp' in notification && notification.timestamp)
      ? new Date(notification.timestamp) 
      : new Date();
  
  const time = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let title = '';
  let message = '';
  let href = undefined;
  
  // Extract data from Notification structure
  const notificationData = 'data' in notification 
    ? (notification.data as any || {})
    : {};
  
  // Get message from different fields depending on notification structure
  const notificationMessage = 'message' in notification 
    ? notification.message 
    : 'content' in notification 
      ? notification.content
      : '';
  
  // Get status and appointmentId depending on structure
  const status = 'status' in notification 
    ? notification.status 
    : notificationData.status;
  
  const appointmentId = 'appointmentId' in notification 
    ? notification.appointmentId 
    : notificationData.appointmentId;
  
  const statusText = status ? t(`appointment.status.${status}`) : t('notifications.unknown');
  
  switch (notification.type) {
    case 'appointment_status':
      title = t('notifications.titleLabels.statusUpdate');
      message = t('notifications.appointment.statusUpdate', { status: statusText });
      href = appointmentId ? `/appointments/${appointmentId}` : undefined;
      break;
    case 'new_appointment':
      title = t('notifications.titleLabels.newAppointment');
      message = notificationMessage || t('notifications.appointment.new');
      href = appointmentId ? `/appointments/${appointmentId}` : undefined;
      break;
    case 'appointment_reminder':
      title = t('notifications.titleLabels.reminder');
      message = notificationMessage || t('notifications.appointment.reminder');
      href = appointmentId ? `/appointments/${appointmentId}` : undefined;
      break;
    case 'payment_success':
      title = t('notifications.titleLabels.paymentSuccess');
      message = notificationMessage || t('notifications.payment.success');
      href = appointmentId ? `/appointments/${appointmentId}` : undefined;
      break;
    case 'review_received':
      title = t('notifications.titleLabels.newReview');
      message = notificationMessage || t('notifications.review.received');
      href = '/dashboard';
      break;
    default:
      title = notification.type.replace(/_/g, ' ');
      message = notificationMessage || '';
  }
  
  return {
    title,
    message,
    time,
    href,
  };
};