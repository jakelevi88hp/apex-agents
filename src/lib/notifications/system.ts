/**
 * Notification System
 * 
 * Handles real-time notifications for workflow completion and other events
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

class NotificationSystem {
  private listeners: Set<(notification: Notification) => void> = new Set();
  private notifications: Notification[] = [];

  /**
   * Subscribe to notifications
   */
  subscribe(callback: (notification: Notification) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Send a notification
   */
  notify(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(fullNotification);
    this.listeners.forEach(listener => listener(fullNotification));

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('notifications', JSON.stringify(this.notifications.slice(0, 50)));
      } catch (e) {
        console.error('Failed to store notifications:', e);
      }
    }

    return fullNotification.id;
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return this.notifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.updateStorage();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.updateStorage();
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.updateStorage();
  }

  /**
   * Load notifications from storage
   */
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('notifications');
        if (stored) {
          this.notifications = JSON.parse(stored).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));
        }
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    }
  }

  private updateStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('notifications', JSON.stringify(this.notifications.slice(0, 50)));
      } catch (e) {
        console.error('Failed to update notifications:', e);
      }
    }
  }
}

// Singleton instance
export const notificationSystem = new NotificationSystem();

// Load notifications on initialization
if (typeof window !== 'undefined') {
  notificationSystem.loadFromStorage();
}

// Helper functions for common notification types
export const notifySuccess = (title: string, message: string, actionUrl?: string) => {
  return notificationSystem.notify({
    type: 'success',
    title,
    message,
    actionUrl,
  });
};

export const notifyError = (title: string, message: string) => {
  return notificationSystem.notify({
    type: 'error',
    title,
    message,
  });
};

export const notifyInfo = (title: string, message: string, actionUrl?: string) => {
  return notificationSystem.notify({
    type: 'info',
    title,
    message,
    actionUrl,
  });
};

export const notifyWarning = (title: string, message: string) => {
  return notificationSystem.notify({
    type: 'warning',
    title,
    message,
  });
};

// Workflow-specific notifications
export const notifyWorkflowComplete = (workflowName: string, duration: number) => {
  return notifySuccess(
    'Workflow Completed',
    `"${workflowName}" finished successfully in ${duration}s`,
    '/dashboard/workflows'
  );
};

export const notifyWorkflowFailed = (workflowName: string, error: string) => {
  return notifyError(
    'Workflow Failed',
    `"${workflowName}" failed: ${error}`
  );
};

export const notifyAgentCreated = (agentName: string) => {
  return notifySuccess(
    'Agent Created',
    `"${agentName}" is now active and ready to use`,
    '/dashboard/agents'
  );
};

