// 사용자 상태
export interface UserState {
  walletAddress: string;
  credit: number;
  isConnected: boolean;
}

// 게임 결과
export interface SpinResult {
  symbols: string[][];
  winAmount: number;
  isWin: boolean;
  pattern?: string;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 크레딧 조회 응답
export interface CreditResponse {
  credit: number;
  lastUpdated: string;
}

// 입금 확인 요청
export interface VerifyDepositRequest {
  walletAddress: string;
  txHash: string;
}

// 인출 요청
export interface WithdrawRequest {
  walletAddress: string;
  amount: number;
}

// 인출 응답
export interface WithdrawResponse {
  txHash: string;
  amount: number;
  newCredit: number;
}
