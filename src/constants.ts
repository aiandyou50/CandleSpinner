// TON 네트워크 설정
export const TON_NETWORK = import.meta.env.VITE_TON_NETWORK || 'testnet';

// CSPIN 토큰 주소
export const CSPIN_TOKEN_ADDRESS = import.meta.env.VITE_CSPIN_TOKEN_ADDRESS || '';

// 게임 설정
export const GAME_CONFIG = {
  CREDIT_PER_CSPIN: 1, // 1 CSPIN = 1 Credit
  SPIN_COST: 1, // 1 Credit per spin
  MIN_WITHDRAW: 10, // 최소 인출 크레딧
} as const;

// API 엔드포인트
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
