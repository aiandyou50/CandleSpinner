// src/hooks/useTonConnect.ts
import { useState, useEffect } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from 'ton-core';
import { CSPIN_TOKEN_ADDRESS } from '../constants.js';

export function useTonConnect() {
  const connectedWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [manualJettonWallet, setManualJettonWallet] = useState<string>('');
  const [deriveStatus, setDeriveStatus] = useState<string | null>(null);

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
        setDeriveStatus('ton-core에서 헬퍼를 찾을 수 없습니다. RPC로 파생 시도 필요.');
      } catch (err) {
        console.warn('auto derive on connect failed', err);
      }
    };
    tryDeriveOnConnect();
  }, [connectedWallet, manualJettonWallet]);

  return { connectedWallet, tonConnectUI, manualJettonWallet, setManualJettonWallet, deriveStatus, setDeriveStatus };
}