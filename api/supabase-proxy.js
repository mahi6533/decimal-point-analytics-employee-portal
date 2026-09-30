export default async function handler(req, res) {
  const projectUrl = 'https://fgzjqflwmiwnugtphbov.supabase.co';
  const incomingUrl = new URL(req.url || '/', 'https://vercel.local');
  const forwardedPath = incomingUrl.searchParams.get('path') || '';
  const cleanPath = forwardedPath.startsWith('/') ? forwardedPath : '/' + forwardedPath;
  const query = incomingUrl.searchParams.get('query') || '';
  const upstreamUrl = projectUrl + cleanPath + (query ? '?' + query : '');

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (!value || ['host', 'content-length', 'connection'].includes(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }

  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (publishableKey && !headers.has('apikey')) headers.set('apikey', publishableKey);

  let body;
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) body = req.body;
    else if (req.body != null) body = JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    const responseHeaders = {};
    upstream.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection', 'content-encoding'].includes(key.toLowerCase())) responseHeaders[key] = value;
    });

    const data = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status).setHeader('Cache-Control', 'no-store');
    for (const [key, value] of Object.entries(responseHeaders)) res.setHeader(key, value);
    return res.status(upstream.status).send(data);
  } catch (error) {
    return res.status(502).json({
      error: 'Supabase Auth proxy could not reach the upstream service.',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
