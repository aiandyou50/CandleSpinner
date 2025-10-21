// src/constants.ts
/**
 * 전역 상수 정의
 * 환경변수를 통해 개발/프로덕션 설정 분리
 *
 * @module constants
 * @description
 * 이 모듈은 프로젝트 전체에서 사용되는 상수를 중앙화합니다.
 * 모든 설정값은 환경변수로부터 로드되며, 타입-안전성을 보장합니다.
 */

// ============================================
// 블록체인 설정 (Blockchain Configuration)
// ============================================

/**
 * 게임 지갑 주소
 * 사용자로부터 CSPIN 토큰을 수령할 지갑 주소
 *
 * @example
 * ```
 * // .env
 * VITE_GAME_WALLET_ADDRESS=UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
 * ```
 */
export const GAME_WALLET_ADDRESS = 
  import.meta.env.VITE_GAME_WALLET_ADDRESS ||
  "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd";

/**
 * CSPIN 토큰 메인 계약 주소 (Jetton Master)
 * CSPIN 토큰의 메인 계약 주소
 *
 * @example
 * ```
 * // .env
 * VITE_CSPIN_TOKEN_ADDRESS=EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV
 * ```
 */
export const CSPIN_TOKEN_ADDRESS =
  import.meta.env.VITE_CSPIN_TOKEN_ADDRESS ||
  "EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV";

/**
 * CSPIN Jetton 지갑 주소 (Jetton Wallet)
 * 게임이 CSPIN을 전송할 때 사용하는 Jetton Wallet 주소
 *
 * @example
 * ```
 * // .env
 * VITE_CSPIN_JETTON_WALLET=EQBbso-Bvv1r0N8aVQ1drMpqnJaYWCqH6s_8D1c8l92vGPzJ
 * ```
 */
export const CSPIN_JETTON_WALLET =
  import.meta.env.VITE_CSPIN_JETTON_WALLET ||
  "EQBbso-Bvv1r0N8aVQ1drMpqnJaYWCqH6s_8D1c8l92vGPzJ";

// ============================================
// TonConnect 설정 (TonConnect Configuration)
// ============================================

/**
 * TonConnect Manifest URL
 * 지갑 연결 시 사용할 앱 정보 manifest
 *
 * @see https://docs.ton.org/develop/dapps/ton-connect/manifest
 */
export const TON_CONNECT_MANIFEST_URL =
  import.meta.env.VITE_TON_CONNECT_MANIFEST_URL ||
  "https://aiandyou.me/tonconnect-manifest.json";

// ============================================
// ============================================
// TON RPC 설정 (RPC Configuration)
// ============================================

/**
 * TON RPC Endpoint URL
 * 메인넷/테스트넷 구분
 *
 * 기본값: https://toncenter.com/api/v2/jsonRPC (메인넷)
 * @example
 * ```
 * // 테스트넷
 * VITE_TON_RPC_URL=https://testnet.toncenter.com/api/v2/jsonRPC
 * ```
 */
export const TON_RPC_URL =
  import.meta.env.VITE_TON_RPC_URL ||
  "https://toncenter.com/api/v2/jsonRPC";

/**
 * TON API Key (선택사항)
 * toncenter.com API 사용 시 필요 (Rate limit 증가)
 */
export const TON_API_KEY =
  import.meta.env.VITE_TON_API_KEY || "";

// ============================================
// 게임 설정 (Game Configuration)
// ============================================

/** @desc 최소 입금액 (TON 단위) */
export const MIN_DEPOSIT_AMOUNT = 0.1;

/** @desc 최대 입금액 (TON 단위) */
export const MAX_DEPOSIT_AMOUNT = 1000;

/** @desc 최소 출금액 (CSPIN 토큰 단위) */
export const MIN_WITHDRAWAL_AMOUNT = 100;

/** @desc 최대 출금액 (CSPIN 토큰 단위) */
export const MAX_WITHDRAWAL_AMOUNT = 10000;

/**
 * 게임 상수들
 * 게임 로직에 사용되는 설정값들
 */
export const GAME_CONFIG = {
  // 스핀 비용
  SPIN_COST: 10,
  // 최대 보상
  MAX_PRIZE: 1000,
  // 기본 배율
  DEFAULT_MULTIPLIER: 1,
} as const;

// ============================================
// 환경 및 기능 설정 (Environment & Feature Flags)
// ============================================

/**
 * 현재 실행 환경
 * 'development' | 'production' | 'test'
 */
export const ENVIRONMENT = import.meta.env.MODE as 'development' | 'production' | 'test';

/**
 * 테스트넷 모드 활성화 여부
 * true이면 테스트넷에서 실행
 */
export const IS_TESTNET = 
  import.meta.env.VITE_IS_TESTNET === "true";

/**
 * 디버그 모드 활성화 여부
 * 콘솔 로깅 및 개발자 기능 활성화
 */
export const DEBUG_MODE =
  import.meta.env.VITE_DEBUG_MODE === "true" ||
  import.meta.env.MODE === "development";

// ============================================
// 모니터링 설정 (Monitoring Configuration)
// ============================================

/**
 * Sentry DSN
 * 에러 추적 및 모니터링 설정
 *
 * @example
 * ```
 * // .env.production.local
 * VITE_SENTRY_DSN=https://your_key@your_org.ingest.sentry.io/project_id
 * ```
 */
export const SENTRY_DSN =
  import.meta.env.VITE_SENTRY_DSN || "";

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
