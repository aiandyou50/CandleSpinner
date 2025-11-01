/**
 * 커스텀 에러 클래스들
 * 에러 타입별로 분류하여 처리 로직을 단순화
 *
 * @module utils/errors
 */

// ============================================
// 기본 에러 클래스
// ============================================

/**
 * 애플리케이션 기본 에러
 * 모든 커스텀 에러는 이를 상속받음
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'APP_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

// ============================================
// 검증 에러
// ============================================

/**
 * 입력값 검증 실패
 * @example
 * ```typescript
 * if (!address) {
 *   throw new ValidationError('Invalid wallet address');
 * }
 * ```
 */
export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code, 400);
  }
}

/**
 * 환경변수 검증 실패
 * @example
 * ```typescript
 * throw new ConfigurationError('VITE_GAME_WALLET_ADDRESS is required');
 * ```
 */
export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR', 500);
  }
}

// ============================================
// 블록체인 에러
// ============================================

/**
 * 지갑 연결 실패
 * @example
 * ```typescript
 * if (!connectedWallet) {
 *   throw new WalletConnectError('Wallet not connected');
 * }
 * ```
 */
export class WalletConnectError extends AppError {
  constructor(message: string, code = 'WALLET_CONNECT_ERROR') {
    super(message, code, 400);
  }
}

/**
 * 트랜잭션 실패
 * @example
 * ```typescript
 * throw new TransactionError('Transaction failed', 'INSUFFICIENT_BALANCE');
 * ```
 */
export class TransactionError extends AppError {
  constructor(message: string, code = 'TRANSACTION_ERROR') {
    super(message, code, 400);
  }
}

/**
 * RPC 호출 실패
 * @example
 * ```typescript
 * throw new RpcError('Failed to fetch data from RPC');
 * ```
 */
export class RpcError extends AppError {
  constructor(message: string, code = 'RPC_ERROR') {
    super(message, code, 503);
  }
}

// ============================================
// 네트워크 에러
// ============================================

/**
 * API 요청 실패
 * @example
 * ```typescript
 * throw new ApiError('Failed to fetch from server', 'NETWORK_ERROR', 500);
 * ```
 */
export class ApiError extends AppError {
  constructor(message: string, code = 'API_ERROR', statusCode = 500) {
    super(message, code, statusCode);
  }
}

/**
 * 네트워크 타임아웃
 * @example
 * ```typescript
 * throw new TimeoutError('Request timed out after 30s');
 * ```
 */
export class TimeoutError extends AppError {
  constructor(message: string = 'Request timed out', code = 'TIMEOUT_ERROR') {
    super(message, code, 408);
  }
}

// ============================================
// 에러 타입 가드
// ============================================

/**
 * 에러가 AppError인지 확인
 * @example
 * ```typescript
 * if (isAppError(error)) {
 *   console.log(error.code);
 * }
 * ```
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 에러가 ValidationError인지 확인
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * 에러가 WalletConnectError인지 확인
 */
export function isWalletConnectError(error: unknown): error is WalletConnectError {
  return error instanceof WalletConnectError;
}

/**
 * 에러가 TransactionError인지 확인
 */
export function isTransactionError(error: unknown): error is TransactionError {
  return error instanceof TransactionError;
}

/**
 * 에러가 TimeoutError인지 확인
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

// ============================================
// 에러 메시지 맵핑
// ============================================

/**
 * 에러 코드별 사용자 친화적 메시지
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // 검증 에러
  VALIDATION_ERROR: '입력값이 유효하지 않습니다.',
  CONFIG_ERROR: '설정 오류가 발생했습니다.',

  // 지갑 에러
  WALLET_CONNECT_ERROR: '지갑 연결에 실패했습니다.',
  WALLET_NOT_FOUND: '지갑을 찾을 수 없습니다.',
  
  // 트랜잭션 에러
  TRANSACTION_ERROR: '거래 처리 중 오류가 발생했습니다.',
  INSUFFICIENT_BALANCE: '잔액이 부족합니다.',
  
  // RPC 에러
  RPC_ERROR: 'RPC 호출에 실패했습니다.',
  
  // 네트워크 에러
  API_ERROR: 'API 요청에 실패했습니다.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
};

/**
 * 에러 코드로부터 사용자 친화적 메시지 가져오기
 * @example
 * ```typescript
 * const message = getUserFriendlyMessage('WALLET_CONNECT_ERROR');
 * // => '지갑 연결에 실패했습니다.'
 * ```
 */
export function getUserFriendlyMessage(code: string): string {
  return ERROR_MESSAGES[code] || '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러 객체로부터 사용자 메시지 추출
 * @example
 * ```typescript
 * try {
 *   await connectWallet();
 * } catch (error) {
 *   const userMessage = getErrorMessage(error);
 *   alert(userMessage);
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return getUserFriendlyMessage(error.code) || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}
