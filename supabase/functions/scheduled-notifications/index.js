// Scheduled function to send daily birthday notifications
// This function should be scheduled to run once per day

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JS months are 0-indexed
    const currentDay = now.getDate();
    
    // Format as MM-DD for comparison
    const todayString = `${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
    
    console.log(`Checking for birthdays on ${todayString}`);
    
    // Get all users with notification settings enabled for email
    const { data: notificationSettings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('user_id, notification_time')
      .eq('enable_email_notifications', true);
      
    if (settingsError) {
      throw settingsError;
    }
    
    console.log(`Found ${notificationSettings.length} users with email notifications enabled`);
    
    // Process each user
    for (const setting of notificationSettings) {
      const userId = setting.user_id;
      
      // Get user's contacts with birthdays today
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId);
        
      if (contactsError) {
        console.error(`Error fetching contacts for user ${userId}:`, contactsError);
        continue;
      }
      
      // Filter contacts with birthdays today
      const birthdaysToday = contacts.filter(contact => {
        if (!contact.birthday) return false;
        
        // Extract month and day from birthday (format: YYYY-MM-DD)
        const birthdayDate = new Date(contact.birthday);
        const birthdayMonth = birthdayDate.getMonth() + 1;
        const birthdayDay = birthdayDate.getDate();
        
        // Compare with today
        return birthdayMonth === currentMonth && birthdayDay === currentDay;
      });
      
      if (birthdaysToday.length === 0) {
        console.log(`No birthdays today for user ${userId}`);
        continue;
      }
      
      console.log(`Found ${birthdaysToday.length} birthdays today for user ${userId}`);
      
      // Get user's email
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !userData?.user?.email) {
        console.error(`Error fetching user ${userId}:`, userError);
        continue;
      }
      
      const userEmail = userData.user.email;
      
      // Generate email content
      const subject = `You have ${birthdaysToday.length} birthday(s) today!`;
      
      let message = `Hello,\n\nYou have ${birthdaysToday.length} contact(s) with birthdays today:\n\n`;
      
      birthdaysToday.forEach(contact => {
        const age = contact.birthday ? calculateAge(contact.birthday) : null;
        message += `- ${contact.first_name} ${contact.last_name}${age ? ` (turning ${age})` : ''}\n`;
      });
      
      message += `\nLog in to ConnectHelp to send them your wishes!\n\nBest regards,\nThe ConnectHelp Team`;
      
      // Generate HTML version
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Birthday Reminders</h2>
          <p>Hello,</p>
          <p>You have <strong>${birthdaysToday.length}</strong> contact(s) with birthdays today:</p>
          <ul>
            ${birthdaysToday.map(contact => {
              const age = contact.birthday ? calculateAge(contact.birthday) : null;
              return `<li><strong>${contact.first_name} ${contact.last_name}</strong>${age ? ` (turning ${age})` : ''}</li>`;
            }).join('')}
          </ul>
          <p>Log in to <a href="https://connecthelp.app" style="color: #3b82f6; text-decoration: none;">ConnectHelp</a> to send them your wishes!</p>
          <p>Best regards,<br>The ConnectHelp Team</p>
        </div>
      `;
      
      // Send email notification
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          to: userEmail,
          subject,
          message,
          html
        })
      });
      
      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error(`Error sending email to ${userEmail}:`, errorText);
      } else {
        console.log(`Successfully sent birthday notification email to ${userEmail}`);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Scheduled notifications processed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing scheduled notifications:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Helper function to calculate age
function calculateAge(birthday) {
  const birthDate = new Date(birthday);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
