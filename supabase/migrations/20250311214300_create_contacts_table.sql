-- Create contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create access policies
CREATE POLICY "Users can manage their contacts" ON contacts
FOR ALL USING (auth.uid() = user_id);
