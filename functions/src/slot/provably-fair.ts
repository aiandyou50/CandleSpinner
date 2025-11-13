/**
 * Provably Fair 알고리즘 구현
 * 서버 시드 + 클라이언트 시드 기반 공정성 검증 시스템
 */

/**
 * 서버 시드 생성 (32바이트 랜덤)
 */
export function generateServerSeed(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 서버 시드 해시 생성 (SHA-256)
 * 게임 시작 전 사용자에게 공개
 */
export async function hashServerSeed(serverSeed: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(serverSeed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * HMAC-SHA256 해시 생성
 * Provably Fair의 핵심: 서버 시드 + 클라이언트 시드 + 논스
 */
export async function generateHmac(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<string> {
  const encoder = new TextEncoder();
  
  // 서버 시드를 키로 사용
  const keyData = encoder.encode(serverSeed);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // 메시지: 클라이언트시드:논스
  const message = encoder.encode(`${clientSeed}:${nonce}`);
  
  // HMAC 서명
  const signature = await crypto.subtle.sign('HMAC', key, message);
  const signatureArray = Array.from(new Uint8Array(signature));
  
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 심볼 정의 (명세서에 따라)
 */
export const SYMBOLS = ['⭐', '🪐', '☄️', '🚀', '👽', '💎', '👑'] as const;

/**
 * 심볼 확률 테이블 (누적 확률)
 * 명세서 기준: ⭐(35%), 🪐(25%), ☄️(15%), 🚀(10%), 👽(7%), 💎(5%), 👑(3%)
 */
const CUMULATIVE_PROBABILITIES = [
  { symbol: '⭐', threshold: 35 },   // 0-34: 35%
  { symbol: '🪐', threshold: 60 },   // 35-59: 25%
  { symbol: '☄️', threshold: 75 },   // 60-74: 15%
  { symbol: '🚀', threshold: 85 },   // 75-84: 10%
  { symbol: '👽', threshold: 92 },   // 85-91: 7%
  { symbol: '💎', threshold: 97 },   // 92-96: 5%
  { symbol: '👑', threshold: 100 },  // 97-99: 3%
];

/**
 * 해시에서 심볼 선택
 * @param hash HMAC-SHA256 해시 (64자리 16진수)
 * @param reelIndex 릴 인덱스 (0, 1, 2)
 * @returns 선택된 심볼
 */
function selectSymbolFromHash(hash: string, reelIndex: number): string {
  // 해시의 각 릴에 해당하는 부분 추출 (10자리씩)
  const start = reelIndex * 10;
  const end = start + 10;
  const hashSlice = hash.slice(start, end);
  
  // 16진수를 10진수로 변환
  const hashValue = parseInt(hashSlice, 16);
  
  // 0-99 범위로 정규화
  const normalized = hashValue % 100;
  
  // 최적화: 조기 종료 - 가장 흔한 케이스부터 체크
  if (normalized < 35) return '⭐';  // 35%
  if (normalized < 60) return '🪐';  // 25%
  if (normalized < 75) return '☄️';  // 15%
  if (normalized < 85) return '🚀';  // 10%
  if (normalized < 92) return '👽';  // 7%
  if (normalized < 97) return '💎';  // 5%
  return '👑';  // 3%
}

/**
 * 릴 결과 생성 (Provably Fair)
 * @param serverSeed 서버 시드
 * @param clientSeed 클라이언트 시드
 * @param nonce 논스 (게임 카운터)
 * @returns 3개 릴의 심볼 배열 (각 릴당 3개 심볼)
 */
export async function generateReelResults(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<string[][]> {
  // HMAC-SHA256 해시 생성
  const hash = await generateHmac(serverSeed, clientSeed, nonce);
  
  // 3개 릴 생성
  const reels: string[][] = [];
  
  for (let reelIndex = 0; reelIndex < 3; reelIndex++) {
    // 중앙 심볼 선택
    const centerSymbol = selectSymbolFromHash(hash, reelIndex);
    
    // 상/하단 심볼은 랜덤 (표시용, 당첨 계산에는 중앙만 사용)
    const topSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
    const bottomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
    
    reels.push([topSymbol, centerSymbol, bottomSymbol]);
  }
  
  return reels;
}

/**
 * Provably Fair 검증
 * 사용자가 게임 결과를 직접 검증할 수 있는 함수
 * @param serverSeed 공개된 서버 시드
 * @param clientSeed 클라이언트 시드
 * @param nonce 논스
 * @param expectedResults 예상 결과
 * @returns 검증 성공 여부
 */
export async function verifyResults(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  expectedResults: string[][]
): Promise<boolean> {
  const reels = await generateReelResults(serverSeed, clientSeed, nonce);
  
  // 중앙 라인 심볼만 비교
  for (let i = 0; i < 3; i++) {
    if (reels[i]?.[1] !== expectedResults[i]?.[1]) {
      return false;
    }
  }
  
  return true;
}

/**
 * 타입 정의
 */
export interface ProvablyFairResult {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  hash: string;
  reelResults: string[][];
}

/**
 * 완전한 Provably Fair 결과 생성
 */
export async function generateProvablyFairResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<ProvablyFairResult> {
  const hash = await generateHmac(serverSeed, clientSeed, nonce);
  const serverSeedHash = await hashServerSeed(serverSeed);
  const reelResults = await generateReelResults(serverSeed, clientSeed, nonce);
  
  return {
    serverSeed,
    serverSeedHash,
    clientSeed,
    nonce,
    hash,
    reelResults,
  };
}
