addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Simple RPC proxy worker.
 * Expects POST with JSON body: { rpcUrl: string (optional), rpcBody: object }
 * If RPC_URL secret is set in worker env, that will be used instead of rpcUrl from client.
 * This worker forwards the request to the configured RPC backend and returns the response.
 * SECURITY: Add origin checks or auth in production.
 */
async function handleRequest(request) {
  if (request.method !== 'POST') return new Response('Only POST', { status: 405 })
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) return new Response('Expected application/json', { status: 400 })
    const body = await request.json()
    // prefer configured backend RPC_URL secret
    const backend = RPC_URL || body.rpcUrl
    if (!backend) return new Response(JSON.stringify({ error: 'no rpc backend configured' }), { status: 400 })

    const rpcBody = body.rpcBody ?? body

    const resp = await fetch(backend, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rpcBody) })
    const text = await resp.text()
    return new Response(text, { status: resp.status, headers: { 'Content-Type': resp.headers.get('Content-Type') || 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
