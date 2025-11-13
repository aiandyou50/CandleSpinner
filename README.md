# CandleSpinner

> [English](#english) | [한국어](#korean)

<a name="english"></a>
## English

CandleSpinner is a TON-powered slot machine delivered through a fully serverless stack. Players connect their wallets, deposit CSPIN Jettons, spin the reels, and administrators settle withdrawals—all from a React SPA backed by Cloudflare Workers.

---

### Highlights
- 💡 **End-to-end on-chain flow** – Deposit, crediting, and withdrawals leverage TonConnect, Jetton transfers, and TonCenter RPC.
- ⚙️ **Serverless delivery** – Static assets plus Workers Functions; no traditional servers to maintain.
- ⚡ **Optimized bundles** – React.lazy+Suspense with manual Rollup chunks for `ton-core`, `ton-connect`, and MUI vendors.
- 🧾 **Actionable logging** – In-app Debug Log modal mirrors console output for mobile QA and support.
- 🚀 **CI-friendly** – A push to `main` builds and deploys automatically to Cloudflare Workers.

---

### Architecture at a Glance
```
TonConnect Wallet ──▶ React SPA (src/)
                        │
                        ▼
                 Cloudflare Workers (src/index.ts)
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
 TonCenter RPC (Jetton + tx lookup)   Cloudflare KV (credit + queues)
```
- **Deposit**: `src/components/Deposit.tsx` computes the user Jetton wallet, crafts a Jetton transfer payload, and forwards the signed BOC to `/api/verify-deposit`.
- **Slot Engine**: `functions/src/slot/*` exposes spin, history, and RTP stats through Workers routes.
- **Withdrawals**: `src/app/AdminWithdrawals.tsx` guides admins through TON transactions and marks completion via `/api/admin/mark-processed`.

---

### Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, MUI, React Router 7
- **Blockchain**: `@ton/ton`, `@ton/crypto`, TonConnect UI SDK, TonCenter JSON-RPC
- **Backend**: Cloudflare Workers + KV, shared logic in `functions/`
- **Tooling**: Wrangler 3, PostCSS, i18n via `i18next`, custom logger utilities

---

### Getting Started
> Treat every test wallet as real money. Use a dedicated dev wallet or testnet until flows are fully validated.

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Frontend (`.env.local`, keep out of git):
     ```bash
     VITE_TON_CONNECT_MANIFEST_URL=https://<worker-host>/tonconnect-manifest.json
     VITE_TONCENTER_ENDPOINT=https://toncenter.com/api/v2/jsonRPC
     VITE_API_BASE_URL=http://localhost:8787
     ```
   - Workers secrets (`.dev.vars` locally or Cloudflare Dashboard → Workers → Variables):
     ```bash
     TONCENTER_API_KEY=<TonCenter API key>
     GAME_WALLET_MNEMONIC="<24 word mnemonic>"
     GAME_WALLET_ADDRESS=UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
     CSPIN_JETTON_MASTER=EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV
     CSPIN_JETTON_WALLET=EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs
     ```

3. **Run locally**
   ```bash
   npm run wrangler:dev   # Workers API on http://localhost:8787
   npm run dev            # Vite dev server on http://localhost:3000
   ```
   - Connect a wallet, attempt a 10 CSPIN deposit, observe Network tab requests.
   - Watch the wrangler console for `[VerifyDeposit]` logs to confirm backend reachability.

4. **Build & deploy**
   ```bash
   npm run build          # type-check + production bundle in dist/
   ```
   - Push to `main` for automated Cloudflare deployment.
   - Manual alternative: `npm run deploy` (wraps `wrangler deploy`).

---

### Troubleshooting Cheatsheet
- **Failed to fetch**
  - Run `npm run wrangler:dev` and ensure `VITE_API_BASE_URL` points to the active Worker.
  - Confirm CORS/HTTPS alignment between the SPA and Worker endpoints.
  - Inspect Cloudflare Worker logs; absence of `/api/verify-deposit` suggests network blockage.
- **TonCenter errors**
  - Check rate limits or invalid API key responses; rotate keys if needed.
  - Consider a fallback TonCenter URL if the default endpoint throttles.
- **Jetton wallet mismatch**
  - Revalidate the bounceable addresses defined in `src/constants.ts`.
  - Use the in-app Debug Log modal to capture address parsing output on mobile.

---

### Repository Map
- `src/`
  - `app/` – route-level screens (Admin withdrawals, etc.)
  - `components/` – deposit/withdrawal widgets, debug modal
  - `api/` – browser-side API client wrappers with `API_BASE_URL` detection
  - `worker/` – shared utilities for worker-side logic
- `functions/` – slot machine math, credit utilities, withdraw handler reused by Workers
- `docs/` – operational guides, deployment instructions, architecture summaries
- `archive/` – legacy MVP snapshots (**do not modify**; use for reference only)

---

### Documentation Hub
- `docs/IMPLEMENTATION_SUMMARY.md` – latest feature inventory
- `docs/deployment/관리자페이지_배포가이드_20251102.md` – admin workflow rollout steps
- `docs/analysis/TON선지불_인출시스템_분석_20251102.md` – withdrawal/credit flow analysis
- `archive/mvp-v2-완성본/README.md` – previous architecture overview (read-only)

---

### Operational Notes
- Never commit mnemonics, private keys, or API secrets; keep them in secrets storage.
- Cloudflare KV is eventually consistent—design credit updates and withdrawal queues accordingly.
- Rehearse the full **Deposit → Spin → Withdraw** loop on staging before mainnet pushes.
- Monitor TonCenter quota usage; batch or cache calls when possible.

---

### License

MIT License. Refer to `LICENSE` for details.

_Last updated: 2025-11-11_

---
---

<a name="korean"></a>
## 한국어

CandleSpinner는 TON 블록체인 기반의 서버리스 슬롯머신 게임입니다. 플레이어는 지갑을 연결하고 CSPIN Jetton을 입금한 후 슬롯을 돌리고, 관리자가 인출을 처리합니다. 모든 것이 Cloudflare Workers를 백엔드로 하는 React SPA에서 작동합니다.

---

### 주요 특징
- 💡 **완전한 온체인 흐름** – 입금, 크레딧 적립, 인출 모두 TonConnect, Jetton 전송, TonCenter RPC를 활용합니다.
- ⚙️ **서버리스 배포** – 정적 자산과 Workers Functions만으로 운영되며 전통적인 서버가 필요 없습니다.
- ⚡ **최적화된 번들** – React.lazy+Suspense와 수동 Rollup 청크로 `ton-core`, `ton-connect`, MUI 벤더를 분리했습니다.
- 🧾 **실행 가능한 로깅** – 앱 내 디버그 로그 모달이 콘솔 출력을 미러링하여 모바일 QA와 지원에 유용합니다.
- 🚀 **CI 친화적** – `main` 브랜치에 푸시하면 자동으로 Cloudflare Workers에 빌드 및 배포됩니다.

---

### 아키텍처 개요
```
TonConnect Wallet ──▶ React SPA (src/)
                        │
                        ▼
                 Cloudflare Workers (src/index.ts)
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
 TonCenter RPC (Jetton + tx lookup)   Cloudflare KV (credit + queues)
```
- **입금(Deposit)**: `src/components/Deposit.tsx`가 사용자 Jetton 지갑을 계산하고 Jetton 전송 페이로드를 작성한 후 서명된 BOC를 `/api/verify-deposit`로 전달합니다.
- **슬롯 엔진**: `functions/src/slot/*`이 Workers 라우트를 통해 스핀, 히스토리, RTP 통계를 제공합니다.
- **인출(Withdrawals)**: `src/app/AdminWithdrawals.tsx`가 관리자에게 TON 트랜잭션을 안내하고 `/api/admin/mark-processed`를 통해 완료를 표시합니다.

---

### 기술 스택
- **프론트엔드**: React 18, TypeScript, Vite, Tailwind CSS, MUI, React Router 7
- **블록체인**: `@ton/ton`, `@ton/crypto`, TonConnect UI SDK, TonCenter JSON-RPC
- **백엔드**: Cloudflare Workers + KV, `functions/`에 공유 로직
- **도구**: Wrangler 3, PostCSS, `i18next`를 통한 i18n, 커스텀 로거 유틸리티

---

### 시작하기
> 모든 테스트 지갑을 실제 자금으로 취급하세요. 흐름이 완전히 검증될 때까지 전용 개발 지갑이나 테스트넷을 사용하세요.

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   - 프론트엔드 (`.env.local`, git에서 제외):
     ```bash
     VITE_TON_CONNECT_MANIFEST_URL=https://<worker-host>/tonconnect-manifest.json
     VITE_TONCENTER_ENDPOINT=https://toncenter.com/api/v2/jsonRPC
     VITE_API_BASE_URL=http://localhost:8787
     ```
   - Workers 시크릿 (로컬은 `.dev.vars`, Cloudflare Dashboard → Workers → Variables):
     ```bash
     TONCENTER_API_KEY=<TonCenter API key>
     GAME_WALLET_MNEMONIC="<24 word mnemonic>"
     GAME_WALLET_ADDRESS=UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
     CSPIN_JETTON_MASTER=EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV
     CSPIN_JETTON_WALLET=EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs
     ```

3. **로컬 실행**
   ```bash
   npm run wrangler:dev   # http://localhost:8787에서 Workers API 실행
   npm run dev            # http://localhost:3000에서 Vite 개발 서버 실행
   ```
   - 지갑을 연결하고 10 CSPIN 입금을 시도한 후 Network 탭 요청을 관찰하세요.
   - wrangler 콘솔에서 `[VerifyDeposit]` 로그를 확인하여 백엔드 연결을 확인하세요.

4. **빌드 & 배포**
   ```bash
   npm run build          # dist/에 타입 체크 + 프로덕션 번들 생성
   ```
   - `main`에 푸시하면 자동으로 Cloudflare 배포가 시작됩니다.
   - 수동 대안: `npm run deploy` (`wrangler deploy` 래핑).

---

### 문제 해결 치트시트
- **Failed to fetch**
  - `npm run wrangler:dev`를 실행하고 `VITE_API_BASE_URL`이 활성 Worker를 가리키는지 확인하세요.
  - SPA와 Worker 엔드포인트 간 CORS/HTTPS 정렬을 확인하세요.
  - Cloudflare Worker 로그를 검사하세요. `/api/verify-deposit`가 없으면 네트워크 차단을 의미합니다.
- **TonCenter 오류**
  - 속도 제한 또는 잘못된 API 키 응답을 확인하고 필요시 키를 교체하세요.
  - 기본 엔드포인트가 제한되면 대체 TonCenter URL을 고려하세요.
- **Jetton 지갑 불일치**
  - `src/constants.ts`에 정의된 bounceable 주소를 재검증하세요.
  - 앱 내 디버그 로그 모달을 사용하여 모바일에서 주소 파싱 출력을 캡처하세요.

---

### 저장소 구조
- `src/`
  - `app/` – 라우트 레벨 화면 (관리자 인출 등)
  - `components/` – 입금/인출 위젯, 디버그 모달
  - `api/` – `API_BASE_URL` 감지 기능이 있는 브라우저 측 API 클라이언트 래퍼
  - `worker/` – 워커 측 로직을 위한 공유 유틸리티
- `functions/` – 슬롯 머신 계산, 크레딧 유틸리티, Workers가 재사용하는 인출 핸들러
- `docs/` – 운영 가이드, 배포 지침, 아키텍처 요약
- `archive/` – 레거시 MVP 스냅샷 (**수정 금지**; 참조용으로만 사용)

---

### 문서 허브
- `docs/IMPLEMENTATION_SUMMARY.md` – 최신 기능 목록
- `docs/deployment/관리자페이지_배포가이드_20251102.md` – 관리자 워크플로우 배포 단계
- `docs/analysis/TON선지불_인출시스템_분석_20251102.md` – 인출/크레딧 흐름 분석
- `archive/mvp-v2-완성본/README.md` – 이전 아키텍처 개요 (읽기 전용)

---

### 운영 주의사항
- 니모닉, 개인 키, API 시크릿은 절대 커밋하지 마세요. 시크릿 저장소에 보관하세요.
- Cloudflare KV는 최종 일관성이므로 크레딧 업데이트와 인출 큐를 그에 맞게 설계하세요.
- 메인넷 푸시 전에 스테이징에서 **입금 → 스핀 → 인출** 전체 루프를 리허설하세요.
- TonCenter 할당량 사용량을 모니터링하고 가능하면 호출을 배치하거나 캐시하세요.

---

### 라이선스

MIT License. 자세한 내용은 `LICENSE`를 참조하세요.

_마지막 업데이트: 2025-11-11_
