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

// ✅ API URL 결정 로직 개선
// 1. Development: localhost Workers
// 2. Production: 현재 도메인 (Cloudflare Pages Functions)
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8787' 
  : window.location.origin;

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
  
  // ✅ 응답 텍스트 먼저 가져오기 (JSON 파싱 오류 방지)
  const responseText = await response.text();
  
  if (!response.ok) {
    // 상세한 에러 메시지 추출
    let errorMessage = 'Failed to verify deposit';
    try {
      const errorData = JSON.parse(responseText) as { error?: string; message?: string; details?: string };
      errorMessage = errorData.error || errorData.message || errorMessage;
      if (errorData.details) {
        errorMessage += ` (${errorData.details})`;
      }
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText} - ${responseText.substring(0, 200)}`;
    }
    throw new Error(errorMessage);
  }
  
  // ✅ JSON 파싱 오류 처리
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error('[verifyDeposit] JSON 파싱 실패. 응답:', responseText);
    throw new Error(`Invalid API response: "${responseText.substring(0, 100)}..." is not valid JSON`);
  }
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
  // logger를 사용하기 위해 동적 import
  const { logger } = await import('@/utils/logger');
  
  logger.info('📡 API 요청 시작:', `${API_BASE_URL}/api/withdraw`);
  logger.debug('요청 헤더:', { 'Content-Type': 'application/json' });
  logger.debug('요청 본문:', data);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    logger.info(`API 응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error('❌ API 오류 응답:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        logger.error('파싱된 오류:', errorJson);
        throw new Error(errorJson.error || 'Failed to withdraw');
      } catch (parseError) {
        logger.error('오류 파싱 실패, 원본 텍스트 사용');
        throw new Error(`Failed to withdraw: ${errorText}`);
      }
    }
    
    const result = await response.json() as WithdrawResponse;
    logger.info('✅ API 응답 성공:', result);
    
    return result;
  } catch (error) {
    logger.error('❌ API 요청 실패:', error);
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      logger.error('네트워크 오류: 서버에 연결할 수 없습니다.');
      throw new Error('Network error: Cannot connect to server');
    }
    
    throw error;
  }
}
