/**
 * Notification Manager for EcclesiaSys
 * Handles permission requests and sending notifications
 */

class NotificationManager {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async sendNotification(title, options = {}) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    // Use Service Worker if available for background notifications
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // In a real scenario, this would be triggered by a push event from the server
      // Here we provide a way to trigger local notifications via the SW
      return navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/logo192.png',
          badge: '/favicon.svg',
          ...options
        });
      });
    }

    // Fallback to browser Notification API
    return new Notification(title, {
      icon: '/logo192.png',
      ...options
    });
  }

  static async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered with scope:', registration.scope);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
}

export default NotificationManager;
