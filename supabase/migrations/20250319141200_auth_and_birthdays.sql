-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: The auth schema and users table are automatically created by Supabase
-- This script focuses on creating the necessary tables for the application and RLS policies

-- Fix the contacts table by adding user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE contacts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Enable Row Level Security for contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts table
CREATE POLICY "Users can view their own contacts" 
    ON contacts 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" 
    ON contacts 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
    ON contacts 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
    ON contacts 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create birthdays table
CREATE TABLE IF NOT EXISTS public.birthdays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    relationship TEXT,
    notes TEXT,
    reminder_days INTEGER[] DEFAULT '{7,1}', -- Default reminders 7 and 1 day before
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS birthdays_user_id_idx ON birthdays(user_id);

-- Create index on birth_date for faster birthday queries
CREATE INDEX IF NOT EXISTS birthdays_birth_date_idx ON birthdays(birth_date);

-- Enable Row Level Security
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;

-- Create policies for birthdays table
CREATE POLICY "Users can view their own birthdays" 
    ON birthdays 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own birthdays" 
    ON birthdays 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own birthdays" 
    ON birthdays 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own birthdays" 
    ON birthdays 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function when a birthday is updated
DROP TRIGGER IF EXISTS update_birthdays_updated_at ON birthdays;
CREATE TRIGGER update_birthdays_updated_at
BEFORE UPDATE ON birthdays
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON birthdays TO authenticated;

-- AUTHENTICATION REFERENCE TABLES
-- Note: These tables are automatically created by Supabase Auth
-- The following is for reference only and does not need to be executed

/*
-- auth.users (created automatically by Supabase)
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid NOT NULL PRIMARY KEY, -- UUID from auth.users
  email VARCHAR(255),
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ,
  confirmation_token VARCHAR(255),
  confirmation_sent_at TIMESTAMPTZ,
  recovery_token VARCHAR(255),
  recovery_sent_at TIMESTAMPTZ,
  email_change_token VARCHAR(255),
  email_change VARCHAR(255),
  email_change_sent_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  is_super_admin BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  phone VARCHAR(15) DEFAULT NULL::character varying,
  phone_confirmed_at TIMESTAMPTZ,
  phone_change VARCHAR(15) DEFAULT ''::character varying,
  phone_change_token VARCHAR(255) DEFAULT ''::character varying,
  phone_change_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_confirm_status SMALLINT DEFAULT 0,
  banned_until TIMESTAMPTZ,
  reauthentication_token VARCHAR(255) DEFAULT ''::character varying,
  reauthentication_sent_at TIMESTAMPTZ,
  is_sso_user BOOLEAN DEFAULT false
);

-- auth.sessions (created automatically by Supabase)
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  factor_id uuid,
  aal aal_level,
  not_after TIMESTAMPTZ
);

-- auth.identities (created automatically by Supabase)
CREATE TABLE IF NOT EXISTS auth.identities (
  id text NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_data JSONB NOT NULL,
  provider text NOT NULL,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  email text GENERATED ALWAYS AS (lower(identity_data->>'email')) STORED
);
*/
