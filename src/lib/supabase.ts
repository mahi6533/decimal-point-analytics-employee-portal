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

// Auth normally uses the same-origin Vercel route. If that route returns a
// gateway error, retry the exact request directly against Supabase. This
// keeps one Supabase client/session store while allowing the app to survive
// a proxy-region or Vercel upstream problem.
const authFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);

  if (response.status < 500 || !supabaseUrl) return response;

  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const proxyPrefix = window.location.origin + '/api/supabase';
  if (!requestUrl.startsWith(proxyPrefix)) return response;

  const directUrl = supabaseUrl + requestUrl.slice(proxyPrefix.length);
  try {
    return await fetch(directUrl, init);
  } catch {
    return response;
  }
};

export const supabaseAuth = createClient(
  window.location.origin + '/api/supabase',
  key,
  {
    global: { fetch: authFetch },
  },
);
