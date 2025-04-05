# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication with email verification for your Cognitive Fatigue Detection System.

## Prerequisites

1. A Supabase account (free tier is available)
2. Your project codebase

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Create a new project
3. Choose a name and password for your project
4. Wait for your database to be provisioned

## Step 2: Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Ensure **Email** provider is enabled
3. Under **Authentication** > **Email Templates**, customize the verification email if desired
4. Go to **Authentication** > **URL Configuration**
5. Set the **Site URL** to your production URL (or http://localhost:3000 for development)
6. Add `/auth/callback` to the **Redirect URLs** (e.g., http://localhost:3000/auth/callback)

## Step 3: Get Your API Keys

1. Go to **Project Settings** > **API**
2. Copy your **Project URL** and **anon/public** key

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in your project root (copy from `.env.local.example`)
2. Add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 5: Start Your Application

```bash
npm run dev
```

## Authentication Flow

1. **Sign Up**: Users enter their details and receive a verification email
2. **Email Verification**: Users click the link in the email and are redirected to the callback page
3. **Login**: After verification, users can log in with their credentials

## Route Protection

The application is configured to restrict access to features for unauthenticated users:

1. Protected routes include: Dashboard, Tests, Profile, and Settings
2. Unauthenticated users will be redirected to the login page
3. Users with unverified emails will be redirected to the verification page

## Customizing Verification Emails

You can customize the verification email template through the Supabase dashboard:

1. Go to **Authentication** > **Email Templates** in your Supabase dashboard
2. Select the **Confirm Signup** template
3. Customize the following elements:
   - **From Name**: The sender's name (e.g., "Cognitive Fatigue Detection System")
   - **Subject**: Email subject line
   - **HTML Body**: The email content in HTML format
   - **Text Body**: Plain text version of the email

### Email Template Variables

You can use these variables in your email templates:

- `{{ .ConfirmationURL }}`: The verification link
- `{{ .SiteURL }}`: Your site URL
- `{{ .Email }}`: The user's email address

### Example HTML Template

```html
<h2>Welcome to Cognitive Fatigue Detection System!</h2>
<p>Thank you for signing up. Please confirm your email address by clicking the button below:</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
    Verify Email Address
  </a>
</p>
<p>If you didn't create this account, you can safely ignore this email.</p>
<p>Thanks,<br>The Cognitive Fatigue Detection Team</p>
```

## Troubleshooting

- **Verification Emails Not Arriving**: Check your spam folder or Supabase logs
- **Redirect Issues**: Ensure your redirect URLs are correctly configured in Supabase
- **Authentication Errors**: Check browser console for error messages

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)