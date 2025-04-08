import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://xeguorsoyhhbsiwvzasn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZ3VvcnNveWhoYnNpd3Z6YXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MzM1OTAsImV4cCI6MjA1OTQwOTU5MH0.2paBxxmlGdEhDvDUwsSk-qyBBLAVVn8Jjt66IzmgnR4'; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to sign in with an OAuth provider
export async function signInWithOAuth(provider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider, // e.g., 'google', 'github'
    options: {
      redirectTo: 'https://cognifatigue.vercel.app/auth/callback', // Replace with your app's callback URL
    },
  });

  if (error) {
    console.error('Error during OAuth sign-in:', error.message);
  }
}
