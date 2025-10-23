***REMOVED***🎮 Frontend - React Application (src/)

프론트엔드 React 애플리케이션의 소스 코드입니다. UI 컴포넌트, 상태 관리, TON 지갑 통합 등을 포함합니다.

---

#***REMOVED***📂 폴더 구조

```
src/
├── App.tsx                  ***REMOVED***메인 애플리케이션 컴포넌트
├── main.tsx                 ***REMOVED***React 진입점 (Vite)
├── index.css                ***REMOVED***글로벌 스타일 (Tailwind)
├── vite-env.d.ts            ***REMOVED***Vite 타입 정의
├── types.ts                 ***REMOVED***프로젝트 전역 타입
├── constants.ts             ***REMOVED***상수 (토큰 주소, API 엔드포인트 등)
├── polyfills.ts             ***REMOVED***브라우저 폴리필 (Buffer 등)
│
├── 📁 components/           ***REMOVED***UI 컴포넌트 (재사용 가능)
│   ├── Spinner.tsx          ***REMOVED***슬롯머신 UI
│   ├── WalletConnect.tsx    ***REMOVED***TonConnect 지갑 연동
│   ├── DepositForm.tsx      ***REMOVED***입금 폼
│   ├── WithdrawalForm.tsx   ***REMOVED***인출 폼
│   └── ...
│
├── 📁 hooks/                ***REMOVED***React 커스텀 훅
│   ├── useTonWallet.ts      ***REMOVED***TON 지갑 상태 관리
│   ├── useGameState.ts      ***REMOVED***게임 상태 관리
│   ├── useBalance.ts        ***REMOVED***CSPIN 잔액 조회
│   └── ...
│
├── 📁 utils/                ***REMOVED***유틸리티 함수
│   ├── api.ts               ***REMOVED***백엔드 API 호출
│   ├── ton-utils.ts         ***REMOVED***TON 유틸리티
│   └── ...
│
└── 📁 test/                 ***REMOVED***테스트 파일 (선택)
    └── ...
```

---

#***REMOVED***📝 주요 파일 설명

##***REMOVED***App.tsx
메인 React 컴포넌트. 애플리케이션의 전체 레이아웃과 라우팅을 관리합니다.

```typescript
// 예시
export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <WalletConnect />
      <Spinner />
      {/* ... */}
    </div>
  );
}
```

##***REMOVED***types.ts
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

##***REMOVED***constants.ts
고정된 상수값들을 관리합니다.

```typescript
export const CSPIN_TOKEN_ADDRESS = "EQA..."; // Jetton 토큰 주소
export const GAME_WALLET_ADDRESS = "UQBFPDdS..."; // 게임 지갑
export const API_BASE_URL = "https://aiandyou.me";
// ...
```

##***REMOVED***polyfills.ts
브라우저 환경에서 필요한 Node.js 모듈 폴리필을 설정합니다.

```typescript
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
```

---

#***REMOVED***📁 components/ (UI 컴포넌트)

모든 React 컴포넌트는 재사용 가능하도록 설계되어야 합니다.

**구조:**
```
components/
├── Spinner.tsx              ***REMOVED***슬롯머신 UI 메인 컴포넌트
├── WalletConnect.tsx        ***REMOVED***TonConnect 지갑 연동 (Telegram Wallet)
├── DepositForm.tsx          ***REMOVED***CSPIN 입금 폼
├── WithdrawalForm.tsx       ***REMOVED***CSPIN 인출 폼
├── GameStatus.tsx           ***REMOVED***게임 상태 표시
├── TransactionHistory.tsx   ***REMOVED***거래 기록 표시
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

#***REMOVED***🎣 hooks/ (커스텀 훅)

상태 관리와 비즈니스 로직을 분리하는 React 훅입니다.

**구조:**
```
hooks/
├── useTonWallet.ts         ***REMOVED***TonConnect 지갑 상태 관리
├── useGameState.ts         ***REMOVED***게임 상태 (스핀, 잔액 등)
├── useBalance.ts           ***REMOVED***CSPIN 잔액 조회 & 갱신
├── useTransaction.ts       ***REMOVED***입금/인출 트랜잭션 관리
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

#***REMOVED***🛠️ utils/ (유틸리티)

재사용 가능한 유틸리티 함수들입니다.

**구조:**
```
utils/
├── api.ts                  ***REMOVED***백엔드 API 호출 래퍼
├── ton-utils.ts            ***REMOVED***TON 주소 변환, 포맷팅 등
├── error-handler.ts        ***REMOVED***에러 처리 통합
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

#***REMOVED***🎨 스타일링

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

#***REMOVED***🔄 상태 관리 및 흐름

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

#***REMOVED***🚀 빌드 & 배포

##***REMOVED***개발 서버
```bash
npm run dev
***REMOVED***http://localhost:5173 접속
```

##***REMOVED***프로덕션 빌드
```bash
npm run build
***REMOVED***dist/ 폴더에 번들 생성
```

##***REMOVED***배포
```bash
npm run deploy
***REMOVED***Cloudflare Pages에 자동 배포
```

---

#***REMOVED***🔐 보안 주의사항

##***REMOVED***❌ 절대 금지
- 개인키를 프론트엔드 코드에 하드코딩
- 환경 변수를 클라이언트에 노출

##***REMOVED***✅ 올바른 방법
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

#***REMOVED***📚 참고

- **React 공식 문서**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Vite 공식 문서**: https://vitejs.dev
- **TypeScript 공식 문서**: https://www.typescriptlang.org
- **TonConnect SDK**: https://github.com/ton-connect/sdk

---

**마지막 업데이트:** 2025-10-23  
**기술 스택:** React 18 + TypeScript + Vite + Tailwind CSS

