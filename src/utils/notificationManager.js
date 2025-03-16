// Notification Manager for ConnectKeep

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

// Schedule daily notification at 12 AM
export const scheduleDailyNotification = async () => {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
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
    scheduleLocalNotification();
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    // Fallback: Use local notification scheduling
    scheduleLocalNotification();
    return false;
  }
};

// Fallback: Schedule local notification using setTimeout
const scheduleLocalNotification = () => {
  // Calculate time until next 12 AM
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Set to 12 AM
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  // Schedule notification
  setTimeout(() => {
    showLocalNotification();
    // Reschedule for next day
    scheduleLocalNotification();
  }, timeUntilMidnight);
  
  console.log(`Local notification scheduled for ${tomorrow.toLocaleString()}`);
};

// Show a local notification
export const showLocalNotification = async () => {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification('ConnectKeep Daily Reminder', {
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

// Check for birthdays today and return count
export const checkTodaysBirthdays = (contacts) => {
  if (!contacts || !Array.isArray(contacts)) return 0;
  
  const today = new Date();
  const todayMonth = today.getMonth(); // 0-11
  const todayDate = today.getDate(); // 1-31
  
  const birthdaysToday = contacts.filter(contact => {
    if (!contact.birthday) return false;
    
    const birthday = new Date(contact.birthday);
    return birthday.getMonth() === todayMonth && birthday.getDate() === todayDate;
  });
  
  return birthdaysToday.length;
};

// Initialize notifications system
export const initializeNotifications = async () => {
  const swRegistration = await registerServiceWorker();
  if (!swRegistration) return false;
  
  const permission = await requestNotificationPermission();
  if (!permission) return false;
  
  await scheduleDailyNotification();
  return true;
};
