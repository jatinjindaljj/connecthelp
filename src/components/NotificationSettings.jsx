import { useState, useEffect } from 'react';
import { 
  initializeNotifications, 
  isNotificationSupported, 
  getUserNotificationSettings,
  saveUserNotificationSettings
} from '../utils/notificationManager';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Bell, Mail } from 'lucide-react';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    notification_time: '08:00',
    days_before_birthday: [7, 3, 1],
    days_before_anniversary: [7, 3, 1],
    enable_email_notifications: true,
    enable_push_notifications: true
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = isNotificationSupported();
    setNotificationsSupported(supported);

    // Check if notifications are already enabled
    if (supported) {
      const permissionStatus = Notification.permission;
      setNotificationsEnabled(permissionStatus === 'granted');
    }
    
    // Fetch user's notification settings
    if (user) {
      fetchNotificationSettings();
    }
  }, [user]);

  const fetchNotificationSettings = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching notification settings for user:', user.id);
      const data = await getUserNotificationSettings(user.id);
      
      if (data) {
        console.log('Retrieved settings:', data);
        // Convert time format from HH:MM:SS to HH:MM for input compatibility
        const timeOnly = data.notification_time ? data.notification_time.substring(0, 5) : '08:00';
        
        setSettings({
          notification_time: timeOnly,
          days_before_birthday: data.days_before_birthday || [7, 3, 1],
          days_before_anniversary: data.days_before_anniversary || [7, 3, 1],
          enable_email_notifications: data.enable_email_notifications,
          enable_push_notifications: data.enable_push_notifications
        });
      } else {
        console.log('No settings found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error.message);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const success = await initializeNotifications(user.id);
      setNotificationsEnabled(success);
      
      if (success) {
        // Update settings in database
        await saveSettings({
          ...settings,
          enable_push_notifications: true
        });
        
        // Show success message
        alert(`Birthday reminders enabled! You will receive a notification at ${formatTime(settings.notification_time)} each day.`);
      } else {
        // Show error message
        alert('Failed to enable notifications. Please check your browser settings and try again.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('An error occurred while enabling notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const saveSettings = async (settingsToSave = settings) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      console.log('Saving notification settings:', settingsToSave);
      const success = await saveUserNotificationSettings(user.id, settingsToSave);
      
      if (!success) {
        throw new Error('Failed to save notification settings');
      }
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error.message);
      alert('Failed to save notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!user) {
    return (
      <div className="notification-settings bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Sign In Required</h3>
        <p className="text-yellow-700">
          Please sign in to manage your notification settings.
        </p>
      </div>
    );
  }

  if (!notificationsSupported) {
    return (
      <div className="notification-settings bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Notifications Not Supported</h3>
        <p className="text-yellow-700">
          Your browser doesn't support notifications. To receive daily reminders, please use a modern browser like Chrome, Firefox, or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="notification-settings bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
      
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md">
          Settings saved successfully!
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium mb-2">Notification Time</h4>
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-gray-500 mr-2" />
            <label htmlFor="notification_time" className="text-gray-600 mr-3">
              Daily reminder time:
            </label>
            <input
              type="time"
              id="notification_time"
              name="notification_time"
              value={settings.notification_time}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
            />
            <span className="ml-3 text-gray-500">
              ({formatTime(settings.notification_time)})
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            You will receive notifications at this time each day for upcoming birthdays and anniversaries.
          </p>
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-2">Notification Types</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable_push_notifications"
                name="enable_push_notifications"
                checked={settings.enable_push_notifications}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
              />
              <Bell className="w-5 h-5 text-gray-500 mr-2" />
              <label htmlFor="enable_push_notifications" className="text-gray-600">
                Browser push notifications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable_email_notifications"
                name="enable_email_notifications"
                checked={settings.enable_email_notifications}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
              />
              <Mail className="w-5 h-5 text-gray-500 mr-2" />
              <label htmlFor="enable_email_notifications" className="text-gray-600">
                Email notifications
              </label>
              <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">New!</span>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            <p>Email notifications will be sent to: {user.email}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          {!notificationsEnabled && settings.enable_push_notifications ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">
                  Browser notifications are not enabled yet.
                </p>
                <button 
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enabling...' : 'Enable Browser Notifications'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button 
                onClick={() => saveSettings()}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
