// src/PoCComponent.tsx
import React, { useState } from 'react';
import { PayloadBuilder } from './components/PayloadBuilder.js';
import { useTonConnect } from './hooks/useTonConnect.js';
import { useRpc } from './hooks/useRpc.js';
import type { EvidenceItem } from './types.js';

export const PoCComponent: React.FC = () => {
  const { connectedWallet, tonConnectUI, manualJettonWallet, setManualJettonWallet, deriveStatus } = useTonConnect();
  const { rpcUrl, setRpcUrl, pingResult, pingTimestamp, performPing } = useRpc();

  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastTxJson, setLastTxJson] = useState<string | null>(null);
  const [manualEvidenceText, setManualEvidenceText] = useState<string>('');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);

  const handleDeposit = async () => {
    setBusy(true);
    try {
      // Placeholder for actual send logic
      alert('Deposit logic to be implemented');
    } catch (e) {
      setLastError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const downloadDebugPack = async () => {
    const pack = {
      txJson: lastTxJson,
      lastError,
      pingResult,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cspin-debug-pack-${new Date().toISOString().replace(/:/g, '-')}.txt`;
    a.click();
  };

  return (
    <div>
      <h1>CandleSpinner PoC</h1>
      <PayloadBuilder />
      <div>
        <h2>RPC Settings</h2>
        <input value={rpcUrl} onChange={e => setRpcUrl(e.target.value)} placeholder='RPC URL' />
        <button onClick={() => performPing()}>RPC Ping</button>
        {pingResult && <pre>{JSON.stringify(pingResult, null, 2)}</pre>}
      </div>
      <div>
        <h2>Wallet</h2>
        {connectedWallet ? (
          <div>
            <p>Connected: {connectedWallet.account.address}</p>
            <input value={manualJettonWallet} onChange={e => setManualJettonWallet(e.target.value)} placeholder='Jetton Wallet' />
            <p>Derive Status: {deriveStatus}</p>
          </div>
        ) : (
          <p>Not connected</p>
        )}
      </div>
      <div>
        <h2>Actions</h2>
        <button onClick={handleDeposit} disabled={busy}>Deposit</button>
        <button onClick={downloadDebugPack}>Download Debug Pack</button>
        {lastError && <p>Error: {lastError}</p>}
      </div>
      <div>
        <h2>Evidence</h2>
        <textarea value={manualEvidenceText} onChange={e => setManualEvidenceText(e.target.value)} />
        <button onClick={() => setEvidenceList([...evidenceList, { id: Date.now().toString(), name: 'Manual', content: manualEvidenceText, type: 'text', created: Date.now() }])}>Add Evidence</button>
        {evidenceList.map(e => <p key={e.id}>{e.content}</p>)}
      </div>
    </div>
  );
};

export default PoCComponent;