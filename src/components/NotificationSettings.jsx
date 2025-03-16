import { useState, useEffect } from 'react';
import { initializeNotifications, isNotificationSupported } from '../utils/notificationManager';

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = isNotificationSupported();
    setNotificationsSupported(supported);

    // Check if notifications are already enabled
    if (supported) {
      const permissionStatus = Notification.permission;
      setNotificationsEnabled(permissionStatus === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const success = await initializeNotifications();
      setNotificationsEnabled(success);
      
      if (success) {
        // Show success message
        alert('Daily birthday reminders enabled! You will receive a notification at 12 AM each day.');
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
    <div className="notification-settings bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-2">Daily Birthday Reminders</h3>
      <p className="text-gray-600 mb-4">
        Receive a notification at 12 AM every day to remind you to check for birthdays and special events.
      </p>
      
      {notificationsEnabled ? (
        <div className="flex items-center">
          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Notifications Enabled
          </span>
        </div>
      ) : (
        <button 
          onClick={handleEnableNotifications}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Enabling...' : 'Enable Daily Reminders'}
        </button>
      )}
    </div>
  );
}
