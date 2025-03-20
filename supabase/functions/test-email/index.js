// Test function to manually trigger an email notification

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.js";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body with fallback defaults
    const { to = '', subject = 'Test Email', message = 'This is a test email' } = await req.json();

    // Validate destination email
    if (!to) {
      return new Response(
        JSON.stringify({ error: "Missing required field: to (email address)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // HTML version of the message
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">ConnectHelp Test Email</h2>
        <p>This is a test email from the ConnectHelp notification system.</p>
        <p>${message}</p>
        <hr />
        <p>If you received this email, your notification system is working correctly!</p>
      </div>
    `;

    // Call the send-email function
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        to,
        subject,
        message,
        html
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Error sending email: ${errorText}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Test email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending test email:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
