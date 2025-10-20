# 📁 디렉토리 구조 정리 (v2.0.0)

```
CandleSpinner/
├── 📄 README.md                          (프로젝트 개요)
├── 📄 LICENSE                            (라이센스)
├── 📄 CHANGELOG.md                       (변경 이력)
├── 📄 MVP-TEST-CHECKLIST.md             ✨ NEW (테스트 체크리스트)
├── 📄 package.json                       (의존성)
├── 📄 tsconfig.json                      (TypeScript 설정)
├── 📄 vite.config.ts                     (Vite 설정)
├── 📄 tailwind.config.js                 (Tailwind 설정)
├── 📄 postcss.config.js                  (PostCSS 설정)
├── 📄 wrangler.toml                      (Cloudflare 설정)
│
├── 📁 src/                               (프론트엔드 코드)
│   ├── 📄 main.tsx                       (진입점)
│   ├── 📄 App.tsx                        (메인 컴포넌트)
│   ├── 📄 index.css                      (글로벌 스타일)
│   ├── 📄 constants.ts                   (상수)
│   ├── 📄 types.ts                       (타입 정의)
│   ├── 📄 polyfills.ts                   (폴리필)
│   │
│   ├── 📁 components/                    (React 컴포넌트)
│   │   ├── Game.tsx                      (메인 게임)
│   │   ├── Deposit.tsx                   ✨ NEW (입금)
│   │   └── ReelPixi.tsx                  (릴 애니메이션)
│   │
│   └── 📁 hooks/                         (React 훅)
│       └── useRpc.ts                     (RPC 호출)
│
├── 📁 functions/                         (백엔드 Functions)
│   ├── 📄 _bufferPolyfill.ts             (Buffer 폴리필)
│   ├── 📄 _headers                       (HTTP 헤더)
│   │
│   └── 📁 api/                           (API 엔드포인트)
│       ├── spin.ts                       (스핀)
│       ├── double-up.ts                  (더블업)
│       ├── initiate-withdrawal.ts        (출금)
│       ├── collect-winnings.ts           (상금 수령)
│       ├── credit-deposit.ts             (크레딧 입금)
│       ├── check-developer-password.ts   (개발자 패스)
│       ├── generate-wallet.ts            (지갑 생성)
│       └── deposit.ts                    ✨ NEW (입금 기록)
│
├── 📁 public/                            (정적 자산)
│   └── tonconnect-manifest.json          (TonConnect 매니페스트)
│
├── 📁 docs/                              (문서)
│   │
│   ├── 📁 ssot/                          (SSOT - Single Source of Truth)
│   │   ├── [산출물1]프로젝트-정의서.md       (프로젝트 요구사항)
│   │   ├── [산출물2]기술-스택-및-아키텍처-설계.md (기술 스택)
│   │   ├── [산출물3]MVP핵심-로직-의사코드.md  ❌ DELETE (v1.4.0 의사코드)
│   │   ├── [산출물3]PoC핵심-로직-의사코드.md   ❌ DELETE (PoC 의사코드)
│   │   └── [산출물4]TMA-하이브리드-변환-기능.md (TMA 구현)
│   │
│   ├── 📁 instructions/                  (배포/설정 가이드)
│   │   └── *.md                          (각 단계별 가이드)
│   │
│   ├── 📁 reports/                       (보고서 - 보관용)
│   │
│   ├── 📁 solutions/                     (문제 해결 기록)
│   │
│   └── 📁 workflows/                     (작업 흐름)
│
├── 📁 PoC/                               (PoC 코드 - 참고용 별도 보관)
│   ├── 📁 src/
│   ├── 📁 functions/
│   ├── 📁 public/
│   └── 📄 package.json
│
├── 📁 wallet-tools/                      (지갑 생성 도구)
│   ├── generate-wallet.mjs
│   ├── mnemonic-to-key.mjs
│   ├── secure-mnemonic-to-key.mjs
│   ├── test-mnemonic.mjs
│   ├── test-v3-wallet.mjs
│   ├── test-v5-wallet.mjs
│   └── README.md
│
├── 📁 scripts/                           (유틸리티 스크립트)
│   ├── convert-address.mjs
│   ├── derive_jetton_wallet.mjs
│   ├── parse_boc.mjs
│   └── test-v3-account.mjs
│
├── 📄 kanban.md                          (작업 진행 상황)
├── 📄 index.html                         (HTML 진입점)
└── 📄 .gitignore                         (Git 제외 파일)
```

---

## 📊 **구조 개선사항**

### ✅ 정리된 점

| 항목 | 이전 | 현재 | 개선 |
|------|------|------|------|
| **최상위 문서** | 산발적 | 중앙화 (docs/) | 명확함 |
| **SSOT 문서** | 의사코드 중복 | v2.0.0만 유지 | 단순화 |
| **테스트 체크리스트** | 없음 | MVP-TEST-CHECKLIST.md | 추적 가능 |
| **PoC 코드** | 섞임 | 별도 PoC/ 폴더 | 독립성 |
| **API 엔드포인트** | 12개 | 8개 (필수만) | 정리됨 |

---

## 🗑️ **삭제 대상**

```
docs/ssot/
  ├── ❌ [산출물3]MVP핵심-로직-의사코드.md (v1.4.0 - 구식)
  └── ❌ [산출물3]PoC핵심-로직-의사코드.md (PoC 참고용 - PoC폴더 참조)

functions/api/
  ├── ❌ deposit-auto.ts (삭제됨)
  ├── ❌ deposit-complete.ts (삭제됨)
  ├── ❌ get-jetton-wallet.ts (삭제됨)
  └── ❌ rpc.ts (삭제됨)

src/components/
  ├── ❌ DepositDirect.tsx (삭제됨)
  ├── ❌ DepositAuto.tsx (삭제됨)
  ├── ❌ WebDeposit.tsx (삭제됨)
  └── ❌ TMADeposit.tsx.backup (삭제됨)
```

---

## 📝 **문서 변경사항**

| 문서 | 변경 | 목적 |
|------|------|------|
| **[산출물1]** | 유지 | 프로젝트 정의서 |
| **[산출물2]** | 전체 재작성 | v2.0.0 기술 스택 (단순화) |
| **[산출물3]** | 삭제 | 구식 의사코드 제거 |
| **[산출물4]** | 유지 | TMA 구현 참고 |

---

## 📍 **새 파일 위치**

| 파일 | 목적 | 위치 |
|------|------|------|
| `MVP-TEST-CHECKLIST.md` | 테스트 추적 | 최상위 |
| `Deposit.tsx` | 통합 입금 | src/components/ |
| `/api/deposit` | 입금 기록 | functions/api/ |

---

**정리 완료: 2025-10-21**
