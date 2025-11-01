// TON 네트워크 설정
export const TON_NETWORK = import.meta.env.VITE_TON_NETWORK || 'testnet';

// 블록체인 주소 (하드코딩 - 환경 변수 fallback)
export const GAME_WALLET_ADDRESS = import.meta.env.VITE_GAME_WALLET_ADDRESS || 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';
export const CSPIN_TOKEN_ADDRESS = import.meta.env.VITE_CSPIN_TOKEN_ADDRESS || 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';

// ⚠️ 임시: Jetton Wallet 주소를 비워두고 동적 계산 사용
// 올바른 주소를 환경 변수에 설정하거나, 동적으로 계산해야 함
export const CSPIN_JETTON_WALLET = import.meta.env.VITE_CSPIN_JETTON_WALLET || '';

// TON Connect
export const TON_CONNECT_MANIFEST_URL = import.meta.env.VITE_TON_CONNECT_MANIFEST_URL || 'https://aiandyou.me/tonconnect-manifest.json';

// 게임 설정
export const GAME_CONFIG = {
  CREDIT_PER_CSPIN: 1, // 1 CSPIN = 1 Credit
  SPIN_COST: 1, // 1 Credit per spin
  MIN_WITHDRAW: 10, // 최소 인출 크레딧
} as const;

// API 엔드포인트
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
