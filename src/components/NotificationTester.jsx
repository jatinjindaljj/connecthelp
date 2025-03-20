import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../utils/supabaseClient';
import { 
  getUserNotificationSettings, 
  saveUserNotificationSettings, 
  sendEmailNotification 
} from '../utils/notificationManager';

export default function NotificationTester() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    if (!user) {
      setError('You must be logged in to test notifications');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Direct database query to verify what's stored
      const { data: dbSettings, error: dbError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (dbError) throw dbError;

      // Also get settings using the manager function
      const managerSettings = await getUserNotificationSettings(user.id);

      setResults({
        dbSettings,
        managerSettings,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message);
      console.error('Error testing notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const testEmailNotification = async () => {
    if (!user) {
      setError('You must be logged in to test email notifications');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Call the Edge Function directly
      const { data: functionData, error: functionError } = await supabase.functions.invoke('test-email', {
        body: {
          to: user.email,
          subject: 'Test from ConnectHelp',
          message: 'This is a test email from ConnectHelp. If you received this, email notifications are working!'
        }
      });

      if (functionError) throw functionError;

      setResults({
        emailTest: 'Email sent successfully! Check your inbox.',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError('Error sending test email: ' + err.message);
      console.error('Error testing email:', err);
    } finally {
      setLoading(false);
    }
  };

  const fixSettings = async () => {
    if (!user) {
      setError('You must be logged in to fix settings');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Get current settings
      const { data: currentSettings, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError) throw settingsError;

      // Force update the settings with the correct format
      const fixedSettings = {
        ...currentSettings,
        notification_time: currentSettings.notification_time || '08:00:00',
        days_before_birthday: currentSettings.days_before_birthday || [7, 3, 1],
        days_before_anniversary: currentSettings.days_before_anniversary || [7, 3, 1],
        enable_email_notifications: currentSettings.enable_email_notifications !== false,
        enable_push_notifications: currentSettings.enable_push_notifications !== false
      };

      // Ensure time format is correct
      if (fixedSettings.notification_time.length === 5) {
        fixedSettings.notification_time += ':00';
      }

      // Update directly in the database
      const { error: updateError } = await supabase
        .from('notification_settings')
        .update(fixedSettings)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setResults({
        message: 'Settings fixed successfully!',
        fixedSettings,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fixing settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Sign In Required</h3>
        <p className="text-yellow-700">
          Please sign in to test notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Notification Tester</h3>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Use these tools to test and debug notification settings.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Check Notification Settings'}
          </button>

          <button
            onClick={testEmailNotification}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>

          <button
            onClick={fixSettings}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Fixing...' : 'Fix Settings Format'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            <h4 className="font-semibold">Error:</h4>
            <p>{error}</p>
          </div>
        )}

        {results && (
          <div className="p-4 bg-gray-50 text-gray-800 rounded-md">
            <h4 className="font-semibold mb-2">Results:</h4>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-64">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
