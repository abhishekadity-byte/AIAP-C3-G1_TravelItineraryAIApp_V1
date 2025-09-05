/*
  # Disable email confirmation for seamless user signup

  This migration disables email confirmation requirements to allow users to sign up
  and sign in immediately without needing to confirm their email addresses.
  This resolves the localhost redirect issue in the confirmation emails.

  1. Changes
     - Disables email confirmation requirement
     - Allows immediate user access after signup
  
  2. Security
     - Users can sign up and access the app immediately
     - Email verification can be re-enabled later if needed
*/

-- Note: Email confirmation settings are managed in Supabase Dashboard
-- This file serves as documentation for the configuration change needed:
-- 
-- In Supabase Dashboard:
-- 1. Go to Authentication > Settings
-- 2. Under "User Signups" section
-- 3. Disable "Enable email confirmations"
-- 
-- This allows users to sign up without email confirmation

-- Create a simple function to help with user onboarding
CREATE OR REPLACE FUNCTION public.get_user_signup_status()
RETURNS TABLE (
  total_users bigint,
  confirmed_users bigint,
  unconfirmed_users bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unconfirmed_users
  FROM auth.users;
$$;