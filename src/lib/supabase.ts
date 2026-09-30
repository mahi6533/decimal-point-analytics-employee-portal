import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment.');
}

const key = supabasePublishableKey ?? 'placeholder-key';

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  key,
);

// Authentication uses a same-origin Vercel proxy so browsers on networks that
// cannot reach *.supabase.co can still sign in/sign up securely.
export const supabaseAuth = createClient(
  window.location.origin + '/api/supabase',
  key,
);
