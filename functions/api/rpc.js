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
  const allowedOrigin = env.ALLOWED_ORIGIN || ''
  if (allowedOrigin && origin && !origin.includes(allowedOrigin)) {
    return new Response(JSON.stringify({ error: 'origin not allowed' }), { status: 403 })
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
