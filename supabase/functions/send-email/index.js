// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase_oauth

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { corsHeaders } from "../_shared/cors.js";


/**
 * @typedef {Object} EmailRequest
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject
 * @property {string} message - Email plain text message
 * @property {string} [html] - Optional HTML version of the message
 */


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  

  try {
    // Get the request body
    const { to, subject, message, html } = await req.json();

    // Validate required fields
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, or message" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const smtpHost = Deno.env.get("SMTP_HOST") || "";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER") || "";
    const smtpPass = Deno.env.get("SMTP_PASS") || "";
    const fromEmail = Deno.env.get("FROM_EMAIL") || "notifications@connecthelp.app";

    // Validate SMTP configuration
    if (!smtpHost || !smtpUser || !smtpPass) {
      return new Response(
        JSON.stringify({ error: "SMTP configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  
    // Create SMTP client
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUser,
      password: smtpPass,
    });

    // Send email
    await client.send({
      from: fromEmail,
      to: to,
      subject: subject,
      content: html || message,
      html: !!html,
    });

    await client.close();

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
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
