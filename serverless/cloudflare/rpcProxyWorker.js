addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// naive in-memory rate limiter (best-effort; per-worker-instance)
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT = 60; // requests per window per IP
const ipCounters = new Map();

function getClientIp(request) {
  // Cloudflare provides CF-Connecting-IP, but in dev it might be undefined
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown'
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) })
  }

  if (request.method !== 'POST') return new Response('Only POST', { status: 405, headers: corsHeaders(request) })

  try {
    const origin = request.headers.get('origin') || ''
    const allowedOrigin = ALLOWED_ORIGIN || ''
    if (allowedOrigin && origin && !origin.includes(allowedOrigin)) {
      return new Response(JSON.stringify({ error: 'origin not allowed' }), { status: 403, headers: corsHeaders(request) })
    }

    const apiKeyHeader = request.headers.get('x-api-key') || ''
    if (WORKER_API_KEY && WORKER_API_KEY.length > 0 && apiKeyHeader !== WORKER_API_KEY) {
      return new Response(JSON.stringify({ error: 'invalid api key' }), { status: 401, headers: corsHeaders(request) })
    }

    const clientIp = getClientIp(request)
    const now = Date.now()
    const info = ipCounters.get(clientIp) || { ts: now, count: 0 }
    if (now - info.ts > RATE_WINDOW_MS) {
      info.ts = now; info.count = 0
    }
    info.count++
    ipCounters.set(clientIp, info)
    if (info.count > RATE_LIMIT) {
      return new Response(JSON.stringify({ error: 'rate limit exceeded' }), { status: 429, headers: corsHeaders(request) })
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) return new Response('Expected application/json', { status: 400, headers: corsHeaders(request) })
    const body = await request.json()

    const backend = RPC_URL || body.rpcUrl
    if (!backend) return new Response(JSON.stringify({ error: 'no rpc backend configured' }), { status: 400, headers: corsHeaders(request) })

    const rpcBody = body.rpcBody ?? body

    const resp = await fetch(backend, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rpcBody) })
    const text = await resp.text()
    const headers = { 'Content-Type': resp.headers.get('Content-Type') || 'application/json', ...corsHeaders(request) }
    return new Response(text, { status: resp.status, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders(request) })
  }
}

function corsHeaders(request) {
  const origin = request.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY',
  }
}

