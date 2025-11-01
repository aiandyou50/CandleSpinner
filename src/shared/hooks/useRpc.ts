// src/hooks/useRpc.ts
import { useState } from 'react';
// src/hooks/useRpc.ts
import type { PingResult } from '../types.js';

const FRONT_FUNCTION_API_KEY = (import.meta as any).env?.VITE_FUNCTION_API_KEY ?? (import.meta as any).env?.FUNCTION_API_KEY ?? null;

export function rpcFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  const given = opts.headers as Record<string, string> | undefined;
  if (given) {
    for (const k of Object.keys(given)) {
      const v = (given as any)[k];
      if (typeof v === 'string') headers[k] = v;
    }
  }
  if (!headers['Content-Type'] && !headers['content-type']) headers['Content-Type'] = 'application/json';

  if (typeof url === 'string' && url.startsWith('/') && FRONT_FUNCTION_API_KEY) {
    headers['X-API-KEY'] = FRONT_FUNCTION_API_KEY as string;
  }

  const merged: RequestInit = { ...opts, headers };
  return fetch(url, merged);
}

export function useRpc() {
  const [rpcUrl, setRpcUrl] = useState<string>('/api/rpc');
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [pingTimestamp, setPingTimestamp] = useState<number | null>(null);

  const performPing = async (maxRetries = 2) => {
    const attempts: any[] = [];
    try {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const body = { rpcBody: { jsonrpc: '2.0', id: 1, method: 'net.ping', params: [] } };
          const resp = await rpcFetch('/api/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          const j = await resp.json().catch(() => null);
          attempts.push({ attempt, ok: resp.ok, status: resp.status, body: j });
          if (resp.ok) {
            setPingResult({ kind: 'rpc.ping', attempts });
            setPingTimestamp(Date.now());
            return { attempts };
          }
        } catch (e) {
          attempts.push({ attempt, error: String(e) });
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
      }

      // Fallback to health endpoints
      try {
        const hResp = await rpcFetch('/api/rpc/health', { method: 'GET' });
        const hText = await hResp.text().catch(() => null);
        attempts.push({ kind: 'health.get', ok: hResp.ok, status: hResp.status, body: hText });
        setPingResult({ kind: 'health.get', attempts });
        setPingTimestamp(Date.now());
        return { attempts };
      } catch (e) {
        try {
          const oResp = await rpcFetch('/api/rpc', { method: 'OPTIONS' });
          const oText = await oResp.text().catch(() => null);
          attempts.push({ kind: 'options', ok: oResp.ok, status: oResp.status, body: oText });
          setPingResult({ kind: 'options', attempts });
          setPingTimestamp(Date.now());
          return { attempts };
        } catch (e2) {
          attempts.push({ kind: 'health-failed', error: String(e2) });
          setPingResult({ kind: 'failed', attempts });
          setPingTimestamp(Date.now());
          return { attempts };
        }
      }
    } catch (err) {
      console.warn('ping failed', err);
    }
  };

  const getJettonWalletAddress = async (masterAddress: string, ownerAddress: string): Promise<string | null> => {
    try {
      const body = {
        rpcBody: {
          jsonrpc: '2.0',
          id: 1,
          method: 'runGetMethod',
          params: {
            address: masterAddress,
            method: 'get_wallet_address',
            stack: [['tvm.Slice', ownerAddress]]
          }
        }
      };
      const resp = await rpcFetch('/api/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await resp.json();
      if (j.result && j.result.stack && j.result.stack[0] && j.result.stack[0][1]) {
        return j.result.stack[0][1];
      }
    } catch (e) {
      console.warn('RPC getJettonWalletAddress failed', e);
    }
    return null;
  };

  return { rpcUrl, setRpcUrl, pingResult, pingTimestamp, performPing, getJettonWalletAddress };
}