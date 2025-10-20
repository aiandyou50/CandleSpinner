export async function onRequest(context: any) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY'
    }});
  }
  if (request.method !== 'POST') return new Response('Only POST', { status: 405 });

  const origin = request.headers.get('origin') || '';
  const allowedOriginEnv = (env.ALLOWED_ORIGIN || '').toString();
  const allowedList = allowedOriginEnv.split(',').map((s: string) => s.trim()).filter(Boolean);

  const isOriginAllowed = (() => {
    // If no allowed list configured, allow by default (useful for PoC)
    if (allowedList.length === 0) return true;
    if (!origin) return false;
    try {
      const originHost = new URL(origin).host.toLowerCase();
      for (const item of allowedList) {
        if (item === '*') return true;
        // wildcard subdomain: *.example.com
        if (item.startsWith('*.')) {
          const domain = item.slice(2).toLowerCase();
          if (originHost === domain || originHost.endsWith('.' + domain)) return true;
          continue;
        }
        // normalize item to host or origin
        try {
          const itemOrigin = new URL(item).origin;
          if (origin === itemOrigin) return true;
          const itemHost = new URL(itemOrigin).host.toLowerCase();
          if (originHost === itemHost) return true;
        } catch (e) {
          const itemHost = item.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
          if (originHost === itemHost) return true;
        }
      }
    } catch (e) {
      // if origin is not a valid URL, fallback to string includes
      for (const item of allowedList) {
        if (item === '*') return true;
        if (origin.includes(item)) return true;
      }
    }
    return false;
  })();

  if (!isOriginAllowed) {
    return new Response(JSON.stringify({ error: 'origin not allowed', origin: origin, allowed: allowedList }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }
  const key = request.headers.get('x-api-key') || '';
  if (env.FUNCTION_API_KEY && env.FUNCTION_API_KEY !== key) {
    return new Response(JSON.stringify({ error: 'invalid api key' }), { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return new Response('Expected application/json', { status: 400 });
  const body = await request.json();
  const backend = env.BACKEND_RPC_URL || body.rpcUrl || 'https://toncenter.com/api/v2/jsonRPC';
  if (!backend) return new Response(JSON.stringify({ error: 'no rpc backend configured' }), { status: 400 });

  // helper: fetch with a couple retries for transient backend errors (522/5xx)
  async function fetchWithRetries(url: string, init: RequestInit, attempts = 3, backoffMs = 300) {
    let lastError: any = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const r = await fetch(url, init);
        const text = await r.text().catch(() => null);
        return { ok: r.ok, status: r.status, text };
      } catch (e) {
        lastError = e;
        // small backoff before retrying
        await new Promise(res => setTimeout(res, backoffMs));
      }
    }
    return { ok: false, status: null, text: null, error: lastError && String(lastError) };
  }

  const init = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body.rpcBody ?? body)
  };

  const proxyResp = await fetchWithRetries(backend, init, 3, 350);

  // Always include CORS header so the browser JS can read the body when the request fails
  const respHeaders = { 'Access-Control-Allow-Origin': origin || '*', 'Content-Type': 'application/json' };

  if (proxyResp.error) {
    return new Response(JSON.stringify({ error: 'backend fetch error', message: proxyResp.error, backend }), { status: 502, headers: respHeaders });
  }

  // If backend returned a non-2xx status, surface it with the body (if any) for easier debugging
  if (!proxyResp.ok) {
    const bodyText = proxyResp.text || null;
    // If backend returned JSON, try to parse and forward it; otherwise include as text
    let parsed = null;
    try { parsed = bodyText ? JSON.parse(bodyText) : null; } catch (e) { parsed = null; }
    const payload = {
      error: 'backend returned non-2xx',
      backend,
      status: proxyResp.status,
      body: parsed ?? bodyText
    };
    return new Response(JSON.stringify(payload), { status: proxyResp.status || 502, headers: respHeaders });
  }

  // Success: backend returned 2xx. Attempt to forward the exact body and content-type if possible.
  const contentTypeResp = 'application/json';
  const finalHeaders = { 'Access-Control-Allow-Origin': origin || '*', 'Content-Type': contentTypeResp };
  return new Response(proxyResp.text || '', { status: proxyResp.status || 200, headers: finalHeaders });
}