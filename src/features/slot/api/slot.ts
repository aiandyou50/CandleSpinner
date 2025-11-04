/**
 * 슬롯 게임 API 클라이언트
 */

import type { 
  SpinRequest, 
  SpinResponse, 
  DoubleUpRequest, 
  DoubleUpResponse,
  RTPStats 
} from '../types';

const API_BASE = '/api/slot';

/**
 * 슬롯 스핀
 */
export async function spinSlot(
  walletAddress: string,
  betAmount: number,
  clientSeed: string
): Promise<SpinResponse> {
  const response = await fetch(`${API_BASE}/spin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      betAmount,
      clientSeed,
    } as SpinRequest),
  });

  // 응답 텍스트 먼저 확인
  const text = await response.text();
  
  if (!response.ok) {
    let errorMessage = 'Spin failed';
    try {
      const error = JSON.parse(text) as { error?: string };
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // 응답이 비어있는 경우 처리
  if (!text) {
    throw new Error('Empty response from server');
  }

  try {
    return JSON.parse(text) as SpinResponse;
  } catch (error) {
    console.error('JSON parse error:', text);
    throw new Error('Invalid response format');
  }
}

/**
 * 더블업
 */
export async function doubleUp(
  walletAddress: string,
  choice: 'red' | 'blue',
  currentWin: number,
  gameId: string
): Promise<DoubleUpResponse> {
  const response = await fetch(`${API_BASE}/doubleup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      choice,
      currentWin,
      gameId,
    } as DoubleUpRequest),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Double up failed');
  }

  return response.json();
}

/**
 * RTP 통계 조회
 */
export async function getRTPStats(): Promise<RTPStats> {
  const response = await fetch(`${API_BASE}/rtp-stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch RTP stats');
  }

  const data = await response.json() as { stats: RTPStats };
  return data.stats;
}

/**
 * 게임 기록 조회
 */
export async function getGameHistory(
  walletAddress: string,
  limit: number = 50
): Promise<any[]> {
  const response = await fetch(
    `${API_BASE}/history?walletAddress=${walletAddress}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch game history');
  }

  const data = await response.json() as { games?: any[] };
  return data.games || [];
}
