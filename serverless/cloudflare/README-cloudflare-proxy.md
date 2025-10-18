# Cloudflare Worker RPC Proxy (example)

This folder contains a minimal Cloudflare Worker that forwards JSON-RPC POSTs to a configured RPC backend. It's intended as a small, secure proxy so browser apps can call TON RPC endpoints without CORS or exposing backend URLs/secrets.

Files
- `rpcProxyWorker.js` - the worker script. Accepts POST JSON and forwards to the configured RPC_URL (or `rpcUrl` provided in the body).
- `wrangler.toml.example` - example config for deployment.

Deployment
1. Install Wrangler: `npm install -g wrangler`
2. Copy `wrangler.toml.example` to `wrangler.toml` and set `account_id` and any other fields.
3. Set `RPC_URL` as a worker secret or var (recommended as secret):
   - `wrangler secret put RPC_URL` and paste your RPC endpoint (e.g. `https://main.ton.dev/`).
4. Publish: `wrangler publish --env production` (or `wrangler dev` for local testing).

Security notes (must consider before production)
- Restrict origins: add code that checks `request.headers.get('origin')` and only allows trusted origins.
- Rate-limit requests: add simple per-IP rate-limiting to avoid abuse.
- Authentication: for public projects consider a short-lived token or secret between frontend and worker.
- Logging & monitoring: use Cloudflare logs to monitor errors and suspicious activity.

Additional recommended settings
- `WORKER_API_KEY` (wrangler secret): set a short token and have the frontend include it in `X-API-KEY` header for extra protection.
- `ALLOWED_ORIGIN` (wrangler var): set to your production frontend host (e.g. `https://example.com`) so worker rejects other origins.

This example includes a naive in-memory rate limiter and origin/API-key checks. For production use, consider more robust rate-limiting (e.g. Cloudflare Workers KV or Durable Objects) and stricter authentication.

This is an example for PoC usage only. Harden before using in production.
