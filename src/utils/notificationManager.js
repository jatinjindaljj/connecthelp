// Notification Manager for ConnectKeep
import supabase from './supabaseClient';

// Check if the browser supports service workers and notifications
export const isNotificationSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

// Register service worker
export const registerServiceWorker = async () => {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get user's notification settings
export const getUserNotificationSettings = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching notification settings:', error.message);
    return null;
  }
};

// Schedule notification based on user preferences
export const scheduleNotification = async (userId) => {
  if (!isNotificationSupported() || !userId) {
    return false;
  }

  try {
    // Get user's notification settings
    const settings = await getUserNotificationSettings(userId);
    if (!settings || !settings.enable_push_notifications) {
      return false;
    }
    
    // Parse notification time (format: HH:MM:SS)
    const timeString = settings.notification_time || '08:00:00';
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const registration = await navigator.serviceWorker.ready;
    
    // Check if Periodic Sync API is available
    if ('periodicSync' in registration) {
      // Request permission for background sync
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync',
      });
      
      if (status.state === 'granted') {
        // Register periodic sync with tag and minimum interval
        await registration.periodicSync.register('daily-birthday-reminder', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        });
        console.log('Periodic sync registered for daily birthday reminders');
        return true;
      }
    }
    
    // Fallback: Use local notification scheduling
    scheduleLocalNotification(hours, minutes, userId);
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    // Fallback: Use default local notification scheduling
    scheduleLocalNotification(8, 0, userId);
    return false;
  }
};

// Fallback: Schedule local notification using setTimeout
const scheduleLocalNotification = (hours = 8, minutes = 0, userId) => {
  // Calculate time until next notification
  const now = new Date();
  const nextNotification = new Date(now);
  
  // Set notification time for today
  nextNotification.setHours(hours, minutes, 0, 0);
  
  // If the time has already passed today, schedule for tomorrow
  if (nextNotification <= now) {
    nextNotification.setDate(nextNotification.getDate() + 1);
  }
  
  const timeUntilNotification = nextNotification.getTime() - now.getTime();
  
  // Schedule notification
  setTimeout(() => {
    showLocalNotification(userId);
    // Reschedule for next day
    scheduleLocalNotification(hours, minutes, userId);
  }, timeUntilNotification);
  
  console.log(`Local notification scheduled for ${nextNotification.toLocaleString()}`);
};

// Show a local notification
export const showLocalNotification = async (userId) => {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check for birthdays today and return count
    const contacts = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId);
    
    const birthdaysToday = contacts.data.filter(contact => {
      if (!contact.birthday) return false;
      
      const birthday = new Date(contact.birthday);
      const today = new Date();
      return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate();
    });
    
    await registration.showNotification(`You have ${birthdaysToday.length} birthday(s) today`, {
      body: 'Check for birthday wishes and special events today!',
      icon: '/notification-icon.png',
      badge: '/notification-badge.png',
      data: {
        url: '/contacts'
      },
      requireInteraction: true // Notification persists until user interacts with it
    });
    
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

// Initialize notifications system
export const initializeNotifications = async (userId) => {
  const swRegistration = await registerServiceWorker();
  if (!swRegistration) return false;
  
  const permission = await requestNotificationPermission();
  if (!permission) return false;
  
  await scheduleNotification(userId);
  return true;
};
