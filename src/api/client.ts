/**
 * API 클라이언트
 * Cloudflare Workers API와 통신
 */

import { 
  CreditResponse, 
  VerifyDepositRequest, 
  SpinResult, 
  WithdrawRequest, 
  WithdrawResponse 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

/**
 * 크레딧 조회
 */
export async function fetchCredit(walletAddress: string): Promise<CreditResponse> {
  const response = await fetch(`${API_BASE_URL}/api/credit?address=${walletAddress}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch credit');
  }
  
  return response.json();
}

/**
 * 입금 확인
 */
export async function verifyDeposit(data: VerifyDepositRequest): Promise<CreditResponse> {
  const response = await fetch(`${API_BASE_URL}/api/verify-deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to verify deposit');
  }
  
  return response.json();
}

/**
 * 게임 실행 (Spin)
 */
export async function spin(walletAddress: string): Promise<{
  success: boolean;
  result: string[][];
  winAmount: number;
  credit: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to spin');
  }
  
  return response.json();
}

/**
 * 인출 요청
 */
export async function withdraw(data: WithdrawRequest): Promise<WithdrawResponse> {
  const response = await fetch(`${API_BASE_URL}/api/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to withdraw');
  }
  
  return response.json();
}
