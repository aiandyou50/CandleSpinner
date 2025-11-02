// TON 네트워크 설정
export const TON_NETWORK = import.meta.env.VITE_TON_NETWORK || 'testnet';

// 블록체인 주소 (공개된 주소이므로 하드코딩)
// ✅ 게임 운영 지갑 (Owner)
export const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';

// ✅ CSPIN Jetton Master (토큰 컨트랙트)
export const CSPIN_TOKEN_ADDRESS = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';

// ✅ 게임 운영 지갑의 CSPIN Jetton Wallet (입금 받는 주소)
// 이 주소로 CSPIN 토큰이 전송됨
export const GAME_JETTON_WALLET = 'EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs';

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
