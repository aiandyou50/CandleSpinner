# 📚 React Frontend Source Code

**최종 업데이트**: 2025-10-24  
**버전**: 2.1

---

## 📂 폴더 구조

```
src/
├─ README.md                    ← 이 파일
├─ main.tsx                     ← Vite 진입점 + Sentry 초기화
├─ App.tsx                      ← 메인 컴포넌트
├─ index.css                    ← 글로벌 스타일
├─ types.ts                     ← TypeScript 타입 정의
├─ constants.ts                 ← TON 주소, 토큰 설정
├─ vite-env.d.ts
├─ polyfills.ts                 ← 폴리필
│
├─ components/
│  ├─ Deposit.tsx              ← 📘 입금 UI (TEP-74, 에러 분류)
│  ├─ Deposit.test.tsx         ← 테스트 (12/12 통과)
│  ├─ GameComplete.tsx         ← 게임 완료 UI
│  ├─ Withdrawal.tsx            ← 인출 UI (v2.1)
│  └─ ...
│
├─ hooks/
│  └─ ...
│
├─ utils/
│  └─ ...
│
└─ test/
   └─ ...
```

---

## 🎯 핵심 컴포넌트

### `components/Deposit.tsx`

**역할**: CSPIN 입금 UI 및 로직

**기능**:
- ✅ TonConnect 지갑 연결
- ✅ 입금액 입력
- ✅ Jetton Transfer 생성 (TEP-74)
- ✅ 에러 분류 (네트워크, 사용자 거절, 계약 오류)
- ✅ 재시도 로직 (최대 2회)
- ✅ 거래 확인 (블록체인 검증)

**핵심 함수**:

```typescript
// TEP-74 Jetton Transfer 페이로드
function buildJettonTransferPayload(
  amount: bigint,
  destination: Address,
  responseTo: Address
): string

// 에러 분류
enum ErrorCategory {
  Network,
  Timeout,
  UserRejection,
  InvalidInput,
  SmartContractError,
  Unknown
}

function classifyError(error: any): ErrorCategory
function isRetryableError(category: ErrorCategory): boolean
function getErrorMessage(category: ErrorCategory): string

// 거래 확인 (블록체인 검증)
async function confirmTransaction(
  txHash: string,
  timeout: number = 30000
): Promise<boolean>
```

**특징**:
- forward_ton_amount = 1 nanoton (CEX/Wallet 자동 감지)
- 에러 분류로 똑똑한 재시도
- 블록체인 확인으로 안전성 보장

---

### `components/Withdrawal.tsx` (v2.1)

**역할**: CSPIN 인출 UI

**기능** (v2.1):
- ✅ 인출액 입력
- ✅ 서버 API 호출 (POST /api/initiate-withdrawal)
- ✅ RPC 직접 통신 (v2.1) ← NEW
- ✅ seqno 블록체인 동기화 (v2.1) ← NEW
- ✅ TON 잔액 자동 확인 (v2.1) ← NEW

---

## 📦 설정 파일

### `constants.ts`

TON 블록체인 주소 및 설정값

```typescript
export const TON_ADDRESS = {
  CSPIN_MASTER: 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV',
  GAME_WALLET: 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd',
  // ... (더 많은 주소)
};

export const NETWORK_FEE = {
  DEPOSIT_TON: '0.05',
  WITHDRAWAL_TON: '0.03',
  // ...
};
```

---

### `main.tsx`

Vite 진입점 + Sentry 초기화

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Sentry 초기화
Sentry.init({
  dsn: '...',
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        window.history
      ),
    }),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// React 렌더링
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

**모니터링 항목**:
- ✅ JavaScript 에러
- ✅ React 컴포넌트 에러
- ✅ 네트워크 요청 실패
- ✅ 성능 메트릭
- ✅ 세션 리플레이

---

## 🔌 API 통신

### TonConnect 통합

```typescript
import { TonConnectUI } from '@tonconnect/ui';

const tonConnect = new TonConnectUI({
  manifestUrl: 'https://aiandyou.me/tonconnect-manifest.json'
});

// 지갑 연결
await tonConnect.connectWallet();

// 거래 서명
const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [/* ... */],
};
const signed = await tonConnect.sendTransaction(transaction);
```

---

### 백엔드 API 호출

```typescript
// 입금 기록
const depositResponse = await fetch('/api/initiate-deposit', {
  method: 'POST',
  body: JSON.stringify({
    walletAddress: userWallet,
    depositAmount: 100,
    txHash: 'ABC123...'
  })
});

// 인출 요청 (v2.1)
const withdrawalResponse = await fetch('/api/initiate-withdrawal', {
  method: 'POST',
  body: JSON.stringify({
    walletAddress: userWallet,
    withdrawalAmount: 50
  })
});
```

---

## 🧪 테스트

### `components/Deposit.test.tsx`

12개 테스트 모두 통과 (✅ 12/12)

**테스트 항목**:
1. ✅ Jetton Transfer Payload 생성 (#1)
2. ✅ forward_ton_amount = 1 (#1)
3. ✅ ErrorCategory 열거형 (#2)
4. ✅ isRetryableError (#3)
5. ✅ getErrorMessage (#3)
6. ✅ confirmTransaction (#4)
7. ✅ DepositApiResponse (#5)
8. ✅ getUserJettonWallet (#6)
9. ✅ estimateJettonTransferGas (#7)
10. ✅ Sentry 모니터링 (✓)
11. ✅ Address 체크섬 에러 처리 (✓)
12. ✅ (기타 통합 테스트)

**실행 방법**:
```bash
npm run test        # 모든 테스트 실행
npm run test -- -u  # 스냅샷 업데이트
```

---

## 🎨 스타일링

### Tailwind CSS

```typescript
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 커스텀 색상
      },
    },
  },
  plugins: [],
};
```

### CSS 애니메이션

기본 CSS 애니메이션 사용 (CSS-in-JS 미사용)

```css
@keyframes spin-animation {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.slot-machine {
  animation: spin-animation 0.5s linear;
}
```

---

## 🔒 보안

### 민감한 정보

✅ **안전한 방식**:
- 개인키: Cloudflare 환경변수 (서버)
- API 키: Cloudflare 환경변수 (서버)
- 주소: 코드에 상수화 (공개 OK)

❌ **위험한 방식**:
- 개인키를 클라이언트에 저장
- 환경변수를 .env에 커밋
- 민감한 정보를 localStorage에 저장

---

## 🚀 빌드 및 배포

### 로컬 빌드

```bash
npm run build       # Vite 빌드 (dist/ 생성)
```

### Cloudflare Pages 배포

```bash
git push origin main    # 자동 배포 시작
                        # 2-3분 대기
https://aiandyou.me    # 배포 확인
```

---

## 📚 참고 문서

- [React 공식 문서](https://react.dev)
- [Vite 가이드](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TonConnect UI](https://docs.ton.org/develop/dapps/ton-connect/)
- [Sentry 문서](https://docs.sentry.io)

---

**버전**: 2.1  
**마지막 업데이트**: 2025-10-24
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <WalletConnect />
      <Spinner />
      {/* ... */}
    </div>
  );
}
```

### types.ts
프로젝트 전체에서 사용되는 TypeScript 타입을 정의합니다.

```typescript
export interface GameState {
  balance: string; // CSPIN 잔액
  isSpinning: boolean;
  lastWinAmount: number;
  // ...
}

export interface WalletInfo {
  address: string;
  publicKey: string;
  // ...
}
```

### constants.ts
고정된 상수값들을 관리합니다.

```typescript
export const CSPIN_TOKEN_ADDRESS = "EQA..."; // Jetton 토큰 주소
export const GAME_WALLET_ADDRESS = "UQBFPDdS..."; // 게임 지갑
export const API_BASE_URL = "https://aiandyou.me";
// ...
```

### polyfills.ts
브라우저 환경에서 필요한 Node.js 모듈 폴리필을 설정합니다.

```typescript
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
```

---

## 📁 components/ (UI 컴포넌트)

모든 React 컴포넌트는 재사용 가능하도록 설계되어야 합니다.

**구조:**
```
components/
├── Spinner.tsx              # 슬롯머신 UI 메인 컴포넌트
├── WalletConnect.tsx        # TonConnect 지갑 연동 (Telegram Wallet)
├── DepositForm.tsx          # CSPIN 입금 폼
├── WithdrawalForm.tsx       # CSPIN 인출 폼
├── GameStatus.tsx           # 게임 상태 표시
├── TransactionHistory.tsx   # 거래 기록 표시
└── ...
```

**예시 컴포넌트:**
```typescript
// components/Spinner.tsx
export interface SpinnerProps {
  balance: number;
  onSpin: () => void;
  isSpinning: boolean;
}

export function Spinner({ balance, onSpin, isSpinning }: SpinnerProps) {
  return (
    <div className="spinner-container">
      {/* UI */}
    </div>
  );
}
```

---

## 🎣 hooks/ (커스텀 훅)

상태 관리와 비즈니스 로직을 분리하는 React 훅입니다.

**구조:**
```
hooks/
├── useTonWallet.ts         # TonConnect 지갑 상태 관리
├── useGameState.ts         # 게임 상태 (스핀, 잔액 등)
├── useBalance.ts           # CSPIN 잔액 조회 & 갱신
├── useTransaction.ts       # 입금/인출 트랜잭션 관리
└── ...
```

**예시 훅:**
```typescript
// hooks/useTonWallet.ts
export function useTonWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // TonConnect 초기화
  }, []);

  return { wallet, isConnected, connect, disconnect };
}
```

---

## 🛠️ utils/ (유틸리티)

재사용 가능한 유틸리티 함수들입니다.

**구조:**
```
utils/
├── api.ts                  # 백엔드 API 호출 래퍼
├── ton-utils.ts            # TON 주소 변환, 포맷팅 등
├── error-handler.ts        # 에러 처리 통합
└── ...
```

**예시 함수:**
```typescript
// utils/api.ts
export async function deposit(amount: string): Promise<TransactionResult> {
  const response = await fetch(`${API_BASE_URL}/api/initiate-deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  return response.json();
}
```

---

## 🎨 스타일링

이 프로젝트는 **Tailwind CSS**를 사용합니다.

**주요 파일:**
- `tailwind.config.js` - Tailwind 설정 (루트 폴더)
- `src/index.css` - 글로벌 스타일 & 커스텀 클래스

**사용 예시:**
```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Spin
</button>
```

---

## 🔄 상태 관리 및 흐름

```
┌─────────────────────────────────┐
│   React 컴포넌트 (App.tsx)       │
│  ┌───────────────────────────┐  │
│  │  TonConnect 지갑 연동     │  │
│  │  (useTonWallet)          │  │
│  └───────────────┬───────────┘  │
│                  │               │
│  ┌───────────────▼───────────┐  │
│  │  게임 상태 관리            │  │
│  │  (useGameState)           │  │
│  └───────────────┬───────────┘  │
│                  │               │
│  ┌───────────────▼───────────┐  │
│  │  UI 컴포넌트 렌더링        │  │
│  │  - Spinner                │  │
│  │  - DepositForm            │  │
│  │  - WithdrawalForm         │  │
│  └───────────────┬───────────┘  │
│                  │               │
│  ┌───────────────▼───────────┐  │
│  │  백엔드 API 호출           │  │
│  │  (utils/api.ts)           │  │
│  │  - /api/initiate-deposit  │  │
│  │  - /api/spin              │  │
│  │  - /api/initiate-withdraw │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
                  │
                  │
        ┌─────────▼──────────┐
        │  Cloudflare Workers │
        │  (functions/api/)  │
        └────────────────────┘
```

---

## 🚀 빌드 & 배포

### 개발 서버
```bash
npm run dev
# http://localhost:5173 접속
```

### 프로덕션 빌드
```bash
npm run build
# dist/ 폴더에 번들 생성
```

### 배포
```bash
npm run deploy
# Cloudflare Pages에 자동 배포
```

---

## 🔐 보안 주의사항

### ❌ 절대 금지
- 개인키를 프론트엔드 코드에 하드코딩
- 환경 변수를 클라이언트에 노출

### ✅ 올바른 방법
- 모든 민감한 데이터는 **Cloudflare Workers(백엔드)**에서 관리
- 프론트엔드는 공개 데이터만 사용 (주소, 공개키 등)

```typescript
// ❌ 금지
const PRIVATE_KEY = "4e6568d1...";  // X

// ✅ 올바름
const WALLET_ADDRESS = "UQBFPDdS..."; // O (공개 정보)

// API 호출 시 민감한 작업은 백엔드에서 수행
const response = await fetch('/api/initiate-deposit', {
  method: 'POST',
  body: JSON.stringify({ amount }),
  // 백엔드가 env.GAME_WALLET_PRIVATE_KEY 사용
});
```

---

## 📚 참고

- **React 공식 문서**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Vite 공식 문서**: https://vitejs.dev
- **TypeScript 공식 문서**: https://www.typescriptlang.org
- **TonConnect SDK**: https://github.com/ton-connect/sdk

---

**마지막 업데이트:** 2025-10-23  
**기술 스택:** React 18 + TypeScript + Vite + Tailwind CSS

