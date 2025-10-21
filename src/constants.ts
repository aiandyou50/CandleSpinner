// src/constants.ts
/**
 * 전역 상수 정의
 * 환경변수를 통해 개발/프로덕션 설정 분리
 */

// ============================================
// 블록체인 주소 설정
// ============================================

/**
 * Game Wallet Address
 * 사용자로부터 CSPIN 토큰을 수령할 지갑 주소
 */
export const GAME_WALLET_ADDRESS = 
  import.meta.env.VITE_GAME_WALLET_ADDRESS ||
  "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd";

/**
 * CSPIN Jetton Token Address
 * CSPIN 토큰의 메인 계약 주소
 */
export const CSPIN_TOKEN_ADDRESS =
  import.meta.env.VITE_CSPIN_TOKEN_ADDRESS ||
  "EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV";

/**
 * CSPIN Jetton Wallet Address
 * 게임이 CSPIN을 전송할 때 사용하는 Jetton Wallet 주소
 */
export const CSPIN_JETTON_WALLET =
  import.meta.env.VITE_CSPIN_JETTON_WALLET ||
  "EQBbso-Bvv1r0N8aVQ1drMpqnJaYWCqH6s_8D1c8l92vGPzJ";

// ============================================
// TonConnect 설정
// ============================================

/**
 * TonConnect Manifest URL
 * 지갑 연결 시 사용할 앱 정보 manifest
 */
export const TON_CONNECT_MANIFEST_URL =
  import.meta.env.VITE_TON_CONNECT_MANIFEST_URL ||
  "https://aiandyou.me/tonconnect-manifest.json";

// ============================================
// TON RPC 설정
// ============================================

/**
 * TON RPC Endpoint
 * 메인넷/테스트넷 구분
 */
export const TON_RPC_URL =
  import.meta.env.VITE_TON_RPC_URL ||
  "https://toncenter.com/api/v2/jsonRPC";

/**
 * TON API Key (선택사항)
 * toncenter.com API 사용 시 필요
 */
export const TON_API_KEY =
  import.meta.env.VITE_TON_API_KEY || "";

// ============================================
// 게임 설정
// ============================================

/**
 * 최소 입금액 (TON)
 */
export const MIN_DEPOSIT_AMOUNT = 0.1;

/**
 * 최대 입금액 (TON)
 */
export const MAX_DEPOSIT_AMOUNT = 1000;

/**
 * 최소 출금액 (CSPIN)
 */
export const MIN_WITHDRAWAL_AMOUNT = 100;

/**
 * 최대 출금액 (CSPIN)
 */
export const MAX_WITHDRAWAL_AMOUNT = 10000;

// ============================================
// 네트워크 설정
// ============================================

/**
 * 현재 환경
 * 'development' | 'production'
 */
export const ENVIRONMENT = import.meta.env.MODE;

/**
 * Sentry DSN
 * 에러 추적 설정
 */
export const SENTRY_DSN =
  import.meta.env.VITE_SENTRY_DSN || "";

// ============================================
// Feature Flags
// ============================================

/**
 * Testnet Mode
 * 테스트넷에서 실행 여부
 */
export const IS_TESTNET = 
  import.meta.env.VITE_IS_TESTNET === "true";

/**
 * Debug Mode
 * 디버그 로깅 활성화
 */
export const DEBUG_MODE =
  import.meta.env.VITE_DEBUG_MODE === "true" ||
  import.meta.env.MODE === "development";

// ============================================
// 검증
// ============================================

/**
 * 필수 환경변수 검증
 * 프로덕션 배포 전 확인
 */
export function validateConfiguration(): void {
  const required = [
    { name: "VITE_GAME_WALLET_ADDRESS", value: GAME_WALLET_ADDRESS },
    { name: "VITE_CSPIN_TOKEN_ADDRESS", value: CSPIN_TOKEN_ADDRESS },
    { name: "VITE_CSPIN_JETTON_WALLET", value: CSPIN_JETTON_WALLET },
  ];

  const missing = required.filter(({ value }) => !value || value === "");
  
  if (missing.length > 0 && ENVIRONMENT === "production") {
    const names = missing.map(({ name }) => name).join(", ");
    console.error(`Missing required environment variables: ${names}`);
    throw new Error(`Configuration validation failed: ${names}`);
  }

  if (DEBUG_MODE) {
    console.log("✅ Configuration loaded:", {
      GAME_WALLET_ADDRESS,
      CSPIN_TOKEN_ADDRESS,
      CSPIN_JETTON_WALLET,
      ENVIRONMENT,
      IS_TESTNET,
      DEBUG_MODE,
    });
  }
}
