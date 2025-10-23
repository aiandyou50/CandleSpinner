# CandleSpinner

**TON 블록체인 기반의 탈중앙화 서버리스 Web3 슬롯머신 게임**

| 항목 | 내용 |
|------|------|
| **상태** | 🟢 Phase 2 완료 (MVP 배포) |
| **버전** | v2.0.0 ([CHANGELOG.md](CHANGELOG.md) 참조) |
| **배포** | Cloudflare Pages (https://aiandyou.me) |
| **기술** | React + TypeScript + Vite + Cloudflare Workers |
| **블록체인** | TON Mainnet (실제 자산 거래) |

---

## 📂 프로젝트 구조

```
CandleSpinner/
├── 📁 src/                        # 프론트엔드 React 애플리케이션
│   ├── App.tsx, main.tsx         # 진입점
│   ├── components/               # React 컴포넌트 (UI)
│   ├── hooks/                    # React 커스텀 훅
│   └── types.ts, constants.ts    # 타입 & 상수
│
├── 📁 functions/                 # Cloudflare Workers (백엔드)
│   └── api/
│       ├── initiate-deposit.ts   # CSPIN 토큰 입금 API
│       ├── initiate-withdrawal.ts # 토큰 인출 API
│       ├── generate-wallet.ts    # 지갑 생성 API (테스트)
│       └── debug-private-key.ts  # 개인키 검증 API (테스트)
│
├── 📁 wallet-tools/              # TON 월렛 유틸리티
│   ├── mnemonic-to-key.mjs       # ✅ 니모닉 → 개인키 변환 (V5R1)
│   ├── generate-wallet.mjs       # 새 지갑 생성 (V5R1)
│   └── README.md                 # 🔐 보안 사용 가이드
│
├── 📁 scripts/                   # 빌드 & 유틸 스크립트
│   ├── convert-address.mjs       # 주소 형식 변환
│   └── ...
│
├── 📁 docs/                      # 📚 핵심 문서 (모두 docs/ 중앙화)
│   ├── 📁 ssot/                  # [SSoT] 단일 진실 공급원
│   │   ├── README.md             # 전체 아키텍처 & 기술 사양
│   │   └── ...
│   │
│   ├── 📁 workflows/             # [워크플로우] AI 개발 지침
│   │   ├── AI-워크플로우-지침서.md          # 🤖 AI의 행동 헌법 (Full)
│   │   ├── 퀵-AI워크플로워-지침서.md        # ⚡ AI 빠른 참조 (Lite)
│   │   └── [보안-정책]_보안-워크플로우-강제.md # 🔐 개인키 관리 필수 규칙
│   │
│   ├── 📁 instructions/          # [명령 기록] 사용자 지시사항
│   │   └── [예시]_20251021_기능추가.md
│   │
│   ├── 📁 solutions/             # [해결 기록] 작업 결과 보관
│   │   ├── [보안가이드]_20251023_개인키-환경변수-관리.md
│   │   ├── Cloudflare-Pages-환경변수-설정_20251023_000000.md
│   │   └── [보안-긴급]_20251023_터미널-채팅-기록-삭제-가이드.md
│   │
│   ├── 📁 reports/               # [보고서] 임시/분석 문서
│   │   ├── [긴급보고서]_20251021_배포-캐시-문제-해결.md
│   │   ├── [보고서]_20251019_CSPIN-토큰-인출-기능-구현-보고서.md
│   │   └── ...
│   │
│   └── 📁 instructions/ (구버전) # [레거시] 마이그레이션 중
│
├── 📁 PoC/                       # 📦 PoC (개념 증명) 폴더 [읽기전용]
│   └── docs/PoC/                 # PoC 개발 문서 & 테스트 코드
│
├── 📁 public/                    # 정적 자산
│   └── tonconnect-manifest.json  # TonConnect 지갑 연동 설정
│
├── 🔧 설정 파일
│   ├── package.json              # npm 의존성 & 스크립트
│   ├── tsconfig.json             # TypeScript 설정
│   ├── vite.config.ts            # Vite 빌드 설정
│   ├── tailwind.config.js        # Tailwind CSS 설정
│   ├── wrangler.toml             # Cloudflare Workers 설정
│   └── .gitignore                # 🔐 Git 무시 규칙 (.env.local, 개인키 등)
│
├── 📋 문서
│   ├── README.md                 # 본 파일
│   ├── CHANGELOG.md              # 📝 마스터 버전 & 변경 이력
│   ├── LICENSE                   # MIT 라이센스
│   └── kanban.md                 # 📊 작업 현황판
│
└── 📁 wallet-tools/              # 개발자용 지갑 도구
    └── README.md                 # 🔐 보안 주의사항 포함
```

---

## 🚀 빠른 시작

### 1. 프로젝트 설치
```bash
# 의존성 설치
npm install

# 환경 변수 설정
# .env.local 파일 생성 (절대 Git에 커밋하지 마세요)
VITE_TON_RPC_URL=https://toncenter.com/api/v2/jsonRPC
```

### 2. 로컬 개발 서버 시작
```bash
# React 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

### 3. Cloudflare Workers 배포
```bash
# 빌드
npm run build

# Cloudflare에 배포 (자동 or 수동)
npm run deploy
# 또는
wrangler deploy
```

---

## ⚠️ **중요: 메인넷 환경 주의**

이 프로젝트는 **TON 메인넷에서 실행**됩니다. 즉:

- ✅ 모든 거래는 **실제 자산(TON, CSPIN)** 이동
- ✅ 배포된 스마트 계약은 **영구적**
- ✅ 트랜잭션 수수료는 **실제 비용**

**개발 및 테스트:**
- 개발 중에는 **소량의 테스트넷 토큰**으로 검증
- 메인넷 배포 전에 **완벽한 테스트** 수행
- 모든 트랜잭션은 **되돌릴 수 없음**

---

### 절대 금지 사항
- ❌ **개인키를 코드에 하드코딩하지 마세요**
- ❌ **니모닉을 터미널에 출력하지 마세요**
- ❌ **민감한 정보를 채팅에 공유하지 마세요**

### 올바른 절차
✅ **개인키 생성 → Cloudflare 환경변수 설정 → 코드는 `env.GAME_WALLET_PRIVATE_KEY` 참조**

👉 **상세 가이드:** [`docs/workflows/[보안-정책]_보안-워크플로우-강제.md`](docs/workflows/[보안-정책]_보안-워크플로우-강제.md)

---

## 📖 핵심 문서

| 문서 | 목적 | 대상 |
|------|------|------|
| **[docs/ssot/README.md](docs/ssot/README.md)** | 전체 아키텍처, 기술 사양, API 정의 | 개발자 |
| **[docs/workflows/AI-워크플로우-지침서.md](docs/workflows/AI-워크플로우-지침서.md)** | AI 개발 워크플로우 (Full) | AI 에이전트 |
| **[docs/workflows/퀵-AI워크플로워-지침서.md](docs/workflows/퀵-AI워크플로워-지침서.md)** | AI 빠른 참조 | AI 에이전트 |
| **[docs/workflows/[보안-정책]_보안-워크플로우-강제.md](docs/workflows/[보안-정책]_보안-워크플로우-강제.md)** | 개인키/니모닉 관리 규칙 | 모두 |
| **[CHANGELOG.md](CHANGELOG.md)** | 버전 & 변경 이력 | 모두 |
| **[kanban.md](kanban.md)** | 작업 현황판 | 모두 |
| **[wallet-tools/README.md](wallet-tools/README.md)** | 지갑 도구 사용법 & 보안 | 개발자 |

---

## 🎮 핵심 기능

### ✅ 현재 구현 (Phase 2)
- **입금 (Deposit)**: TonConnect 지갑으로 CSPIN 토큰 입금
- **인출 (Withdrawal)**: CSPIN 토큰을 TON으로 인출
- **게임 로직**: 오프체인 스핀 결과 계산 (비용 절감)
- **토큰 표준**: CSPIN 토큰 (Jetton 표준 준수)

### ⏳ 계획 (Phase 3+)
- **UI 개선**: 3-reel 애니메이션 추가
- **최적화**: 가스 비용 최소화
- **모니터링**: Sentry 에러 추적

---

## 🛠️ 개발 가이드

### 코드-문서 동기화 원칙

이 프로젝트는 **"No Sync, No Commit"** 원칙을 따릅니다:
- 코드 변경 시 관련 문서도 반드시 함께 수정
- 문서 없이 코드를 커밋하면 리뷰 거부
- SSoT 문서(docs/ssot/)와 현재 코드는 항상 동기화

👉 **상세 워크플로우:** [`docs/workflows/AI-워크플로우-지침서.md`](docs/workflows/AI-워크플로우-지침서.md)

---

## 📊 배포 현황

| 환경 | URL | 상태 |
|------|-----|------|
| **프로덕션** | https://aiandyou.me | 🟢 Live |
| **테스트** | https://candlespinner.pages.dev | 🟡 개발 중 |
| **로컬** | http://localhost:5173 | - |

**Cloudflare Pages 환경변수:**
```
GAME_WALLET_PRIVATE_KEY = [Cloudflare에서 설정]
```

---

## 🤖 AI 개발 워크플로우

이 프로젝트는 **AI 코딩 에이전트**에 의해 관리됩니다.

**세션 시작 시 AI가 하는 일:**
1. ✅ `kanban.md` 확인 (진행 중인 작업 파악)
2. ✅ `docs/workflows/퀵-AI워크플로워-지침서.md` 로드 (지침 학습)
3. ✅ `docs/ssot/README.md` 검토 (아키텍처 이해)
4. ✅ 사용자 요청 분석 & 보안 검증

👉 **자세한 내용:** [`docs/workflows/AI-워크플로우-지침서.md`](docs/workflows/AI-워크플로우-지침서.md)

---

## 📞 문제 해결

**자주 발생하는 문제:**

### Q: 개인키 오류 ("Invalid private key")
A: 개인키가 Cloudflare 환경변수에 올바르게 설정되었는지 확인하세요.
   - URL: https://dash.cloudflare.com/Pages/candlespinner/Settings/Environment-variables
   - 변수명: `GAME_WALLET_PRIVATE_KEY`

### Q: 배포 실패 ("npm install timeout")
A: `wrangler.toml`에서 의존성을 최소화하고, 용량이 큰 패키지를 제거하세요.

### Q: 지갑 연동 안 됨 ("TonConnect error")
A: `public/tonconnect-manifest.json` 파일이 올바르게 배포되었는지 확인하세요.

👉 **더 많은 문서:** `docs/solutions/` 폴더 참조

---

## 📚 참고 자료

- **TON 공식 문서**: https://docs.ton.org
- **TonConnect**: https://github.com/ton-connect/sdk
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **React 공식 문서**: https://react.dev

---

## 📝 라이센스

MIT License - 자세히는 [LICENSE](LICENSE) 참조

---

**마지막 업데이트**: 2025-10-23  
**현재 버전**: v2.0.0  
**상태**: 🟢 프로덕션 배포 중

**🔐 보안 정책을 반드시 숙지하세요:** [`[보안-정책]_보안-워크플로우-강제.md`](docs/workflows/[보안-정책]_보안-워크플로우-강제.md)

