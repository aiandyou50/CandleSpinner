// serverless/rpcProxy.js
// Simple Express proxy for TON RPC to avoid CORS issues in the browser.
// Deploy as a small Node server or serverless function (adjust exports for platform).

const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Usage: POST /rpc with body { rpcUrl, rpcBody }
app.post('/rpc', async (req, res) => {
  try {
    const { rpcUrl, rpcBody } = req.body;
    if (!rpcUrl || !rpcBody) return res.status(400).json({ error: 'rpcUrl and rpcBody required' });
    const r = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rpcBody) });
    const j = await r.text();
    res.setHeader('Content-Type', 'application/json');
    res.status(r.status).send(j);
  } catch (e) {
    console.error('proxy error', e);
    res.status(500).json({ error: String(e) });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('RPC proxy listening on', port));
}

module.exports = app;
