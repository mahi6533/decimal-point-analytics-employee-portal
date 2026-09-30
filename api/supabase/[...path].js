export default async function handler(req, res) {
  const projectUrl = 'https://fgzjqflwmiwnugtphbov.supabase.co';
  const pathParts = req.query?.path;
  const path = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts || '');
  const query = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const upstreamUrl = projectUrl + '/' + path + query;

  const headers = new Headers();
  const incoming = req.headers || {};
  for (const [key, value] of Object.entries(incoming)) {
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
      if (!['transfer-encoding', 'connection', 'content-encoding'].includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
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
