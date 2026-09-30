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

const proxyUrl = window.location.origin + '/api/supabase';
const directUrl = supabaseUrl ?? 'https://placeholder.supabase.co';

// Use direct Supabase Auth first. If the browser/network blocks Supabase,
// transparently retry through the same-origin Vercel proxy.
const authFetch: typeof fetch = async (input, init) => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (requestUrl.startsWith(proxyUrl)) {
    const directRequestUrl = directUrl + requestUrl.slice(proxyUrl.length);
    try {
      const directResponse = await fetch(directRequestUrl, init);
      if (directResponse.status < 500) return directResponse;
    } catch {
      // Fall through to the proxy.
    }
  }

  return fetch(input, init);
};

export const supabaseAuth = createClient(
  directUrl,
  key,
  {
    global: { fetch: authFetch },
  },
);
