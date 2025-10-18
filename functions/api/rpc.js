export async function onRequest(context) {
  const { request, env } = context
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY'
    }})
  }
  if (request.method !== 'POST') return new Response('Only POST', { status: 405 })

  const origin = request.headers.get('origin') || ''
  const allowedOriginEnv = (env.ALLOWED_ORIGIN || '').toString();
  const allowedList = allowedOriginEnv.split(',').map(s => s.trim()).filter(Boolean);

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
    return new Response(JSON.stringify({ error: 'origin not allowed', origin: origin, allowed: allowedList }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  }
  const key = request.headers.get('x-api-key') || ''
  if (env.FUNCTION_API_KEY && env.FUNCTION_API_KEY !== key) {
    return new Response(JSON.stringify({ error: 'invalid api key' }), { status: 401 })
  }

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return new Response('Expected application/json', { status: 400 })
  const body = await request.json()
  const backend = env.BACKEND_RPC_URL || body.rpcUrl
  if (!backend) return new Response(JSON.stringify({ error: 'no rpc backend configured' }), { status: 400 })

  try {
    const resp = await fetch(backend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.rpcBody ?? body)
    })
    const text = await resp.text()
    const headers = { 'Content-Type': resp.headers.get('Content-Type') || 'application/json' }
    headers['Access-Control-Allow-Origin'] = origin || '*'
    return new Response(text, { status: resp.status, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
