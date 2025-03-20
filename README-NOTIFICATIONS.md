# ConnectHelp Notification System

This README explains how to fix notification timing issues and set up the email notification system.

## 1. Notification Timing Fix

The issue with notification time not being saved properly has been fixed. The main issue was:

1. Time format inconsistency (some times were stored as `HH:MM` while the database expected `HH:MM:SS`)
2. Proper time handling in the NotificationSettings component
3. Improved debugging and error handling

## 2. Email Notification System Setup

### Prerequisites

- Supabase project with Edge Functions capability
- SMTP server credentials (e.g., from Gmail, SendGrid, etc.)

### Environment Variables

Set these in your Supabase dashboard (Settings > API > Environment Variables):

- `SMTP_HOST`: Your SMTP server (e.g., smtp.gmail.com)
- `SMTP_PORT`: Usually 587 for TLS
- `SMTP_USER`: Your email/username
- `SMTP_PASS`: Your password or app password
- `FROM_EMAIL`: The sender email address

### Deployment Steps

1. Install the Supabase CLI if not already installed:
   ```
   npm install -g supabase
   ```

2. Login to Supabase CLI:
   ```
   supabase login
   ```

3. Link your project (if not already linked):
   ```
   supabase link --project-ref your-project-ref
   ```

4. Deploy the Edge Functions:
   ```
   supabase functions deploy send-email --no-verify-jwt
   supabase functions deploy test-email --no-verify-jwt
   supabase functions deploy scheduled-notifications --no-verify-jwt
   ```

5. Set up a scheduled task in Supabase:
   - Go to Database > Scheduled Functions
   - Create a new task that runs `scheduled-notifications` daily (e.g., `0 8 * * *`)

## 3. Debugging Tools

A new debugging component has been added to help troubleshoot notification issues:

1. Go to Settings > Notifications
2. Use the Notification Tester section to:
   - Check settings format and storage
   - Send a test email
   - Fix settings format if there are issues

## 4. Mobile App Integration

For the mobile app to properly use the notification settings:

1. Ensure the NotificationSettings component uses the same format across both web and mobile
2. The time picker should use the same HH:MM:SS format
3. Time zone handling should be consistent

## 5. Common Issues & Solutions

### Notification Time Resets on Refresh

This was caused by:
- Time format inconsistency (fixed)
- Settings not being properly retrieved (fixed)

### Email Notifications Not Working

Check:
1. SMTP credentials are correct
2. Environment variables are set
3. Edge Functions are deployed
4. User has email notifications enabled in settings

### Push Notifications Not Working

Check:
1. Service Worker is registered
2. Notification permissions are granted
3. Push notifications are enabled in settings

## Questions & Support

For any issues with the notification system, use the NotificationTester component to diagnose and fix common problems. The diagnostic data can help identify the specific issue.
