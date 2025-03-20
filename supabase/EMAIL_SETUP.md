# Email Notification Setup for ConnectHelp

This document explains how to set up email notifications for the ConnectHelp application using Supabase Edge Functions.

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Logged in to Supabase CLI: `supabase login`
3. SMTP server credentials (for sending emails)

## Setup Steps

### 1. Set Environment Variables in Supabase

In your Supabase dashboard:

1. Go to **Settings** > **API** > **Environment Variables**
2. Add the following variables:
   - `SMTP_HOST`: Your SMTP server host (e.g., smtp.gmail.com)
   - `SMTP_PORT`: Your SMTP server port (usually 587 for TLS)
   - `SMTP_USER`: Your SMTP username/email
   - `SMTP_PASS`: Your SMTP password
   - `FROM_EMAIL`: The sender email address (e.g., notifications@connecthelp.app)

### 2. Deploy Edge Functions

From your project directory, run:

```bash
supabase functions deploy send-email --no-verify-jwt
supabase functions deploy scheduled-notifications --no-verify-jwt
supabase functions deploy test-email --no-verify-jwt
```

### 3. Set Up Scheduled Function

To run the birthday check once a day:

1. Go to **Database** > **Scheduled Functions** in the Supabase dashboard
2. Click **New Scheduled Function**
3. Select `scheduled-notifications` function
4. Set schedule to `0 8 * * *` (runs at 8 AM every day)
5. Click **Create**

### 4. Test Email Notifications

You can test the email functionality by calling the test-email function:

```javascript
// Example code to test email notifications
const { data, error } = await supabase.functions.invoke('test-email', {
  body: { 
    to: 'your-email@example.com', 
    subject: 'Test from ConnectHelp', 
    message: 'If you see this, email notifications are working!' 
  }
});

console.log(data, error);
```

## Troubleshooting

If you encounter issues with email notifications:

1. Check Supabase Edge Function logs in the dashboard
2. Verify that environment variables are set correctly
3. Make sure your SMTP credentials are valid
4. Check if your SMTP provider has any sending limits or requirements

## Notes for Mobile App Integration

For mobile apps, you can use the same notification_settings table to control user preferences. The scheduled function will check this table daily and send emails based on user preferences.

To debug notification timing issues:
1. Check browser console logs for any errors
2. Verify that notification_time is being saved correctly to Supabase
3. Look for any timezone conversion issues between client and server
