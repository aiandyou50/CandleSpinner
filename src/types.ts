// src/types.ts
export interface TxPayload {
  to: string;
  value: string;
  data?: string;
}

export interface PingResult {
  kind: string;
  attempts: Array<{
    attempt: number;
    ok: boolean;
    status: number;
    body?: any;
    error?: string;
  }>;
}

export interface EvidenceItem {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'file';
  created: number;
}

export interface BalanceData {
  jettonBalance?: string;
  jettonBalanceRaw?: string;
  tonBalance?: string;
}