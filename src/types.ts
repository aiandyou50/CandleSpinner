// ============================================
// 네트워크 및 API 타입
// ============================================

export type PingAttempt = { 
  attempt?: number
  ok?: boolean
  status?: number
  body?: any
  error?: string
  kind?: string
};

export type PingResult = { 
  kind: string
  attempts: PingAttempt[]
} | null;

/**
 * API 응답 제너릭 타입
 * @template T - 응답 데이터 타입
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
}

/**
 * 로딩 상태 제너릭 타입
 * @template T - 데이터 타입
 */
export interface LoadingState<T> {
  loading: boolean;
  data: T | null;
  error: Error | null;
}

// ============================================
// 블록체인 관련 타입
// ============================================

/** Jetton 토큰 정보 */
export interface JettonInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon?: string;
}

/** 지갑 연결 상태 */
export interface WalletConnection {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  error: Error | null;
}

/** 트랜잭션 정보 */
export interface TransactionInfo {
  hash: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  amount?: string;
  from?: string;
  to?: string;
}

// ============================================
// 게임 관련 타입
// ============================================

/** 게임 모드 */
export type GameMode = 'game' | 'deposit';

/** 입금 방식 */
export type DepositMethod = 'tonconnect' | 'rpc' | 'auto';

/** 게임 상태 */
export interface GameState {
  mode: GameMode;
  balance: number;
  isSpinning: boolean;
  lastResult?: SpinResult;
}

/** 스핀 결과 */
export interface SpinResult {
  symbols: string[];
  multiplier: number;
  prize: number;
  timestamp: number;
}

// ============================================
// UI 관련 타입
// ============================================

/** 버튼 크기 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** 버튼 종류 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/** 토스트 메시지 */
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ============================================
// 컴포넌트 Props 타입
// ============================================

/** Deposit 컴포넌트 Props */
export interface DepositProps {
  onBack: () => void;
  onDepositSuccess?: (amount: number, method: DepositMethod) => void;
}

/** Game 컴포넌트 Props */
export interface GameProps {
  onDepositClick: () => void;
}

// ============================================
// Telegram Mini App 타입
// ============================================

/** Telegram WebApp 사용자 정보 */
export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/** Telegram WebApp 객체 */
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor?: string;
  bottomBarColor?: string;
  
  // 메서드
  ready?: () => void;
  setHeaderColor?: (params: { color_key: string }) => void;
  setBottomBarColor?: (params: { color: string }) => void;
  requestViewport?: () => void;
  setData?: (data: string) => void;
  
  // 이벤트
  onEvent?: (event: string, callback: (...args: any[]) => void) => void;
  offEvent?: (event: string, callback: (...args: any[]) => void) => void;
  
  // BackButton
  BackButton?: {
    show?: () => void;
    hide?: () => void;
  };
  
  // MainButton
  MainButton?: {
    setText?: (text: string) => void;
    setParams?: (params: { color?: string; text_color?: string }) => void;
    show?: () => void;
    hide?: () => void;
    enable?: () => void;
    disable?: () => void;
    showProgress?: () => void;
    hideProgress?: () => void;
  };
  
  // HapticFeedback
  HapticFeedback?: {
    impactOccurred?: (params: { impact_style: string }) => void;
    selectionChanged?: () => void;
    notificationOccurred?: (params: { type: string }) => void;
  };
}
