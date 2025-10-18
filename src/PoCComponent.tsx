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
  const [lastPayload, setLastPayload] = useState<any | null>(null);

  const handleDeposit = async () => {
    if (!lastPayload) {
      alert('먼저 페이로드를 빌드하세요');
      return;
    }
    if (!connectedWallet) {
      alert('지갑을 연결하세요');
      return;
    }
    setBusy(true);
    try {
      const payloadBase64 = Buffer.from(lastPayload.data, 'hex').toString('base64');
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [{
          address: lastPayload.to,
          amount: lastPayload.value,
          payload: payloadBase64
        }]
      };
      const result = await tonConnectUI.sendTransaction(tx);
      setLastTxJson(JSON.stringify(result));
      alert('트랜잭션 전송됨: ' + result.boc);
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
      <PayloadBuilder jettonWallet={manualJettonWallet} onPayloadBuilt={setLastPayload} />
      <div>
        <h2>RPC 설정</h2>
        <input value={rpcUrl} onChange={e => setRpcUrl(e.target.value)} placeholder='RPC URL' />
        <button onClick={() => performPing()}>RPC 핑</button>
        {pingResult && <pre>{JSON.stringify(pingResult, null, 2)}</pre>}
      </div>
      <div>
        <h2>지갑</h2>
        {connectedWallet ? (
          <div>
            <p>연결됨: {connectedWallet.account.address}</p>
            <input value={manualJettonWallet} onChange={e => setManualJettonWallet(e.target.value)} placeholder='젯톤 지갑' />
            <p>파생 상태: {deriveStatus}</p>
          </div>
        ) : (
          <p>연결되지 않음</p>
        )}
      </div>
      <div>
        <h2>작업</h2>
        <button onClick={handleDeposit} disabled={busy}>입금</button>
        <button onClick={downloadDebugPack}>디버그 팩 다운로드</button>
        {lastError && <p>오류: {lastError}</p>}
      </div>
      <div>
        <h2>증거</h2>
        <textarea value={manualEvidenceText} onChange={e => setManualEvidenceText(e.target.value)} />
        <button onClick={() => setEvidenceList([...evidenceList, { id: Date.now().toString(), name: '수동', content: manualEvidenceText, type: 'text', created: Date.now() }])}>증거 추가</button>
        {evidenceList.map(e => <p key={e.id}>{e.content}</p>)}
      </div>
    </div>
  );
};

export default PoCComponent;