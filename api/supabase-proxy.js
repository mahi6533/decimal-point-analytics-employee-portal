export const config = { runtime: 'edge' };

export default async function handler(req) {
  const projectUrl = 'https://fgzjqflwmiwnugtphbov.supabase.co';
  const incomingUrl = new URL(req.url);
  const forwardedPath = incomingUrl.searchParams.get('path') || '';
  const cleanPath = forwardedPath.startsWith('/') ? forwardedPath : '/' + forwardedPath;
  const query = incomingUrl.searchParams.get('query') || '';
  const upstreamUrl = projectUrl + cleanPath + (query ? '?' + query : '');

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.delete('connection');

  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (publishableKey && !headers.has('apikey')) {
    headers.set('apikey', publishableKey);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
      redirect: 'manual',
      cache: 'no-store',
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('connection');
    responseHeaders.set('cache-control', 'no-store');

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Supabase Auth proxy could not reach the upstream service.',
      detail: error instanceof Error ? error.message : String(error),
      upstream: upstreamUrl,
    }), {
      status: 502,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    });
  }
}
