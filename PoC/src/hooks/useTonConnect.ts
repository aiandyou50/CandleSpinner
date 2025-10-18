// src/hooks/useTonConnect.ts
import { useState, useEffect } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, storeStateInit } from 'ton-core';
import { CSPIN_TOKEN_ADDRESS } from '../constants.js';
import { rpcFetch } from './useRpc.js';

export function useTonConnect() {
  const connectedWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [manualJettonWallet, setManualJettonWallet] = useState<string>('');
  const [deriveStatus, setDeriveStatus] = useState<string | null>(null);

  const getJettonWalletAddressRpc = async (masterAddress: string, ownerAddress: string): Promise<string | null> => {
    try {
      console.log('Trying RPC derive for', masterAddress, ownerAddress);
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
      console.log('RPC response:', j);
      if (j.result && j.result.stack && j.result.stack[0] && j.result.stack[0][1]) {
        return j.result.stack[0][1];
      }
    } catch (e) {
      console.warn('RPC getJettonWalletAddress failed', e);
    }
    return null;
  };

  // Auto-derive on connect
  useEffect(() => {
    const tryDeriveOnConnect = async () => {
      try {
        if (!connectedWallet) return;
        if (manualJettonWallet && manualJettonWallet.length > 0) return;
        // Try ton-core first
        try {
          const ton = await import('ton-core');
          if ((ton as any).getJettonWalletAddress) {
            const res = (ton as any).getJettonWalletAddress(CSPIN_TOKEN_ADDRESS, connectedWallet.account.address);
            if (res) {
              setManualJettonWallet(res.toString());
              setDeriveStatus('파생 성공 (ton-core)');
              return;
            }
          }
        } catch (e) {
          // ignore, will try RPC fallback
        }

        // RPC fallback if rpcUrl configured (will be handled in component)
        const jettonWallet = await getJettonWalletAddressRpc(CSPIN_TOKEN_ADDRESS, connectedWallet.account.address);
        if (jettonWallet) {
          setManualJettonWallet(jettonWallet);
          setDeriveStatus('RPC로 파생 성공');
          return;
        }
        setDeriveStatus('RPC 파생 실패. 수동 입력 필요.');
      } catch (err) {
        console.warn('auto derive on connect failed', err);
      }
    };
    tryDeriveOnConnect();
  }, [connectedWallet, manualJettonWallet]);

  return { connectedWallet, tonConnectUI, manualJettonWallet, setManualJettonWallet, deriveStatus, setDeriveStatus };
}