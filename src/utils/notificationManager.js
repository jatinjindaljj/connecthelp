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
      
    if (error) {
      console.error('Error fetching notification settings:', error.message);
      return null;
    }
    
    console.log('Retrieved notification settings:', data);
    return data;
  } catch (error) {
    console.error('Error fetching notification settings:', error.message);
    return null;
  }
};

// Save user's notification settings
export const saveUserNotificationSettings = async (userId, settings) => {
  if (!userId) return false;
  

  try {
    // Ensure time format is correct (HH:MM:SS)
    let notificationTime = settings.notification_time || '08:00';
    if (notificationTime.length === 5) {
      notificationTime += ':00'; // Add seconds if not present
    }
    
    const { error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        notification_time: notificationTime,
        days_before_birthday: settings.days_before_birthday || [7, 3, 1],
        days_before_anniversary: settings.days_before_anniversary || [7, 3, 1],
        enable_email_notifications: settings.enable_email_notifications,
        enable_push_notifications: settings.enable_push_notifications
      });
      
    if (error) {
      console.error('Error saving notification settings:', error.message);
      return false;
    }
    
    console.log('Notification settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error.message);
    return false;
  }
};

// Send email notification
export const sendEmailNotification = async (userId, subject, message) => {
  if (!userId) return false;
  
  try {
    // Get user's notification settings
    const settings = await getUserNotificationSettings(userId);
    if (!settings || !settings.enable_email_notifications) {
      return false;
    }
    
    // Get user's email
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData?.user?.email;
    
    if (!userEmail) {
      console.error('User email not found');
      return false;
    }
    
    // Send email using Supabase Edge Functions
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: userEmail,
        subject,
        message
      }
    });
    
    if (error) {
      console.error('Error sending email notification:', error.message);
      return false;
    }
    
    console.log('Email notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error.message);
    return false;
  }
};

// Schedule notification based on user preferences
export const scheduleNotification = async (userId) => {
  if (!userId) {
    return false;
  }

  try {
    // Get user's notification settings
    const settings = await getUserNotificationSettings(userId);
    if (!settings) {
      console.error('No notification settings found for user');
      return false;
    }
    
    console.log('Scheduling notifications with settings:', settings);
    
    // Handle email notifications
    if (settings.enable_email_notifications) {
      // This will be handled by a cron job on the server
      console.log('Email notifications enabled');
    }
    
    // Handle push notifications
    if (settings.enable_push_notifications && isNotificationSupported()) {
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
    }
    
    return false;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    // Fallback: Use default local notification scheduling
    if (isNotificationSupported()) {
      scheduleLocalNotification(8, 0, userId);
    }
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
    
    // Also send email notification if enabled
    const settings = await getUserNotificationSettings(userId);
    if (settings && settings.enable_email_notifications && birthdaysToday.length > 0) {
      await sendEmailNotification(
        userId,
        `You have ${birthdaysToday.length} birthday(s) today`,
        'Check for birthday wishes and special events today!'
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

// Initialize notifications system
export const initializeNotifications = async (userId) => {
  if (!userId) return false;
  
  try {
    const registration = await registerServiceWorker();
    if (registration) {
      const permission = await requestNotificationPermission();
      if (permission) {
        return await scheduleNotification(userId);
      }
    }
    return false;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

// Debug notification time
export const debugNotificationTime = async (userId) => {
  if (!userId) return null;
  
  try {
    // Get raw data from database
    const { data: rawData, error: rawError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (rawError) throw rawError;
    
    // Get user's notification settings through the regular function
    const processedSettings = await getUserNotificationSettings(userId);
    
    // Check if time format needs correction
    let needsCorrection = false;
    let correctedTime = null;
    
    if (rawData && rawData.notification_time) {
      const timeStr = rawData.notification_time;
      // Check if time needs the seconds part
      if (timeStr.length === 5 && timeStr.includes(':')) {
        needsCorrection = true;
        correctedTime = timeStr + ':00';
        
        // Apply the fix
        const { error: fixError } = await supabase
          .from('notification_settings')
          .update({ notification_time: correctedTime })
          .eq('user_id', userId);
          
        if (fixError) throw fixError;
      }
    }
    
    return {
      raw: rawData,
      processed: processedSettings,
      timeFormatIssue: needsCorrection,
      correctedTime: correctedTime,
      diagnosticInfo: {
        timeType: rawData?.notification_time ? typeof rawData.notification_time : null,
        timeLength: rawData?.notification_time ? rawData.notification_time.length : null,
        timeFormat: rawData?.notification_time ? rawData.notification_time : null
      }
    };
  } catch (error) {
    console.error('Error debugging notification time:', error.message);
    return {
      error: error.message,
      stack: error.stack
    };
  }
};
