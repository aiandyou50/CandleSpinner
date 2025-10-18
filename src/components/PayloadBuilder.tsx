// src/components/PayloadBuilder.tsx
import React, { useState } from 'react';
import { Address, toNano, beginCell } from 'ton-core';
import { GAME_WALLET_ADDRESS } from '../constants.js';

const ZERO_ADDRESS_BOC = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

function parseAddressSafe(s: string | Address | null | undefined): Address {
  if (!s) return Address.parse(ZERO_ADDRESS_BOC);
  try {
    if (typeof s === 'string') return Address.parse(s);
    return s as Address;
  } catch (e) {
    try { return Address.parse(ZERO_ADDRESS_BOC); } catch { throw e; }
  }
}

function buildJettonTransferPayload(amount: bigint, destination: Address, responseTo: Address | null) {
  const resp = responseTo ? responseTo : Address.parse(ZERO_ADDRESS_BOC);
  const cell = beginCell()
    .storeUint(0xF8A7EA5, 32)
    .storeUint(0, 64)
    .storeCoins(amount)
    .storeAddress(destination)
    .storeAddress(resp)
    .storeCoins(BigInt(0))
    .endCell();
  return cell;
}

function ensureMessageAmount(forwardTon: bigint, diagnostic: boolean): bigint {
  const feeMargin = diagnostic ? toNano('0.05') : toNano('1.1');
  return forwardTon + feeMargin;
}

export const PayloadBuilder: React.FC<{ jettonWallet: string; onPayloadBuilt: (payload: any) => void }> = ({ jettonWallet, onPayloadBuilt }) => {
  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [sendType, setSendType] = useState<'CSPIN'|'TON'>('CSPIN');
  const [includeResponseTo, setIncludeResponseTo] = useState<boolean>(true);
  const [useDiagnosticLowFee, setUseDiagnosticLowFee] = useState<boolean>(false);
  const [sendToTokenMaster, setSendToTokenMaster] = useState<boolean>(true);
  const [txPreview, setTxPreview] = useState<any | null>(null);
  const [decodedPayloadHex, setDecodedPayloadHex] = useState<string | null>(null);
  const [decodedCellInfo, setDecodedCellInfo] = useState<string | null>(null);

  const buildPayload = () => {
    try {
      const amount = BigInt(depositAmount) * BigInt(10 ** 9); // Assume 9 decimals for CSPIN
      const destination = Address.parse(GAME_WALLET_ADDRESS);
      const responseTo = includeResponseTo ? null : Address.parse(ZERO_ADDRESS_BOC);
      const payload = buildJettonTransferPayload(amount, destination, responseTo);
      const hex = payload.toBoc().toString('hex');
      setDecodedPayloadHex(hex);
      setDecodedCellInfo(`Opcode: 0xF8A7EA5, Amount: ${amount}, Destination: ${destination.toString()}`);
      const tx = { to: jettonWallet, value: ensureMessageAmount(BigInt(0), useDiagnosticLowFee).toString(), data: hex };
      setTxPreview(tx);
      onPayloadBuilt(tx);
    } catch (e) {
      setDecodedPayloadHex(`Error: ${String(e)}`);
    }
  };

  return (
    <div>
      <h2>페이로드 빌더</h2>
      <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="수량" />
      <select value={sendType} onChange={e => setSendType(e.target.value as 'CSPIN'|'TON')}>
        <option value="CSPIN">CSPIN</option>
        <option value="TON">TON</option>
      </select>
      <label><input type="checkbox" checked={includeResponseTo} onChange={e => setIncludeResponseTo(e.target.checked)} /> response_to 포함</label>
      <label><input type="checkbox" checked={useDiagnosticLowFee} onChange={e => setUseDiagnosticLowFee(e.target.checked)} /> 진단용 낮은 수수료</label>
      <label><input type="checkbox" checked={sendToTokenMaster} onChange={e => setSendToTokenMaster(e.target.checked)} /> 토큰 마스터로 전송</label>
      <button onClick={buildPayload}>페이로드 빌드</button>
      {txPreview && <pre>{JSON.stringify(txPreview, null, 2)}</pre>}
      {decodedPayloadHex && <pre>페이로드 헥스: {decodedPayloadHex}</pre>}
      {decodedCellInfo && <pre>셀 정보: {decodedCellInfo}</pre>}
    </div>
  );
};