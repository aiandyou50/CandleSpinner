📄 \*\*파일명\*\*: `docs/PROJECT\_REQUIREMENTS.md`  

📅 \*\*버전\*\*: 2.0  

📅 \*\*최종 업데이트\*\*: 2025-10-13  

📝 \*\*상태\*\*: Draft — 재구성됨 (AI 코딩 에이전트용)  

👤 \*\*작성자\*\*: Human (Project Lead)  

🎯 \*\*목적\*\*: 코드를 처음부터 재작성하기 위한 요구사항 명세서 (Cloudflare Pages 유지, 라이브러리 변경, 보안/표준 강화)



---



\# 1. 개요 (Overview)



\## 1.1. 프로젝트 명칭 (Project Name)  

\*\*CandleSpinner: The Galactic Casino\*\*



\## 1.2. 프로젝트 목표 (Project Goal)  

TON (The Open Network) 블록체인 위에서 동작하는 \*\*완전 탈중앙화 서버리스 Web3 슬롯머신 게임\*\*을 개발한다.  

사용자는 자신의 암호화폐 지갑을 통해 자산을 완벽하게 통제하면서, \*\*투명하고 공정하며 검증 가능한\*\* 게임 플레이를 경험할 수 있어야 한다.



> ✅ \*\*핵심 원칙\*\*:  

> - \*\*서버리스 우선\*\* (Cloudflare Pages + Functions)  

> - \*\*비수탁형 자산 관리\*\* (Non-Custodial)  

> - \*\*검증 가능한 공정성\*\* (Commit-Reveal 기반)  

> - \*\*보안 및 최신 웹 표준 준수\*\*



---



\# 2. 🚨 현재 진행 중인 작업 (Active Issues - AI START HERE)



\## 2.4. Newly reported issues (Pending triage)



\*\*(KO)\*\* \[BUG-005] `Invalid magic` 오류 — Spin 트랜잭션/핸들러 실행 실패 (P1 - High) — \*\*전면 재구성 중\*\*  

\*\*(EN)\*\* \[BUG-005] `Invalid magic` error — Spin transaction/handler execution failure (P1 - High) — \*\*Full rebuild in progress\*\*



\- \*\*상태 (Status)\*\*: 🔄 진행 중 — 기존 구현 폐기, \*\*전면 재작성 시작\*\*

\- \*\*문제 (Error, KO)\*\*: 스핀 버튼 클릭 시 외부 핸들러(`tg://resolve?...`)가 실행되며 `Invalid magic` 오류 발생 → 트랜잭션 실패  

\- \*\*Error (EN)\*\*: Clicking Spin triggers `tg://resolve?...`, which fails with `Invalid magic`, blocking the entire spin flow.



\- \*\*재설계 방향\*\*:  

&nbsp; - `tg://resolve` 대신 \*\*공식 TON deep-link (`ton://transfer/...`)\*\* 사용  

&nbsp; - BOC 생성 로직을 \*\*순수 함수 기반으로 재작성\*\*  

&nbsp; - 모든 Jetton 전송은 `@ton/core`의 \*\*공식 `JettonWallet.createTransfer()` API\*\* 사용  

&nbsp; - 디버그 모드에서 \*\*BOC, base64, deep-link 실시간 출력\*\* 보장



\- \*\*완료된 조치\*\*: 없음 (기존 구현 폐기)  

\- \*\*다음 조치\*\*:  

&nbsp; - 새로운 `transactionBuilder.js` 구현  

&nbsp; - `@tonconnect/ui`는 \*\*NPM 번들링 유지\*\*  

&nbsp; - 프론트엔드 프레임워크 \*\*Vanilla JS → Lit (Web Components 기반)\*\* 전환  

&nbsp; - 상태 관리 \*\*직접 구현 → @preact/signals 기반 반응형 상태\*\* 도입  

&nbsp; - 빌드 도구 \*\*Vite → Vite + esbuild + Terser 최적화\*\* 강화



\- \*\*담당자\*\*: AI (Jules)  

\- \*\*관련 문서\*\*: 이 문서 전체, `PROJECT\_ARCHITECTURE.MD` v2.0



---



\# 3. 기능 요구사항 (Functional Requirements)



> ⚠️ \*\*모든 기능은 기존과 동일하게 구현되나, 사용 기술 스택은 변경됨\*\*



\## 3.1. 사용자 인터페이스 (User Interface)



\### \[FR-UI-01] 뷰 상태 관리 (View State Management)  

\- \*\*상태\*\*: ✅ 구현 예정 (v4.0.0)  

\- \*\*기술 변경\*\*:  

&nbsp; - 기존: 수동 DOM 조작  

&nbsp; - 신규: \*\*Lit + @preact/signals\*\* 기반 반응형 UI  

\- \*\*요구사항\*\*:  

&nbsp; - 지갑 미연결 → \*\*랜딩 뷰\*\* 표시  

&nbsp; - 지갑 연결 성공 → \*\*게임 뷰\*\*로 전환



\### \[FR-UI-02] 지갑 연결 (Wallet Connection)  

\- \*\*상태\*\*: ✅ 구현 예정 (v4.0.0)  

\- \*\*라이브러리\*\*: `@tonconnect/ui` (\*\*NPM 번들링만 허용\*\*, CDN 금지)  

\- \*\*요구사항\*\*:  

&nbsp; - 공식 `TonConnectUI` 버튼을 랜딩 뷰에 표시  

&nbsp; - 연결 해제 기능 제공



\### \[FR-UI-03] 다국어 지원 (Multi-language Support)  

\- \*\*상태\*\*: ✅ 구현 예정 (v4.0.0)  

\- \*\*지원 언어\*\*: en, ko, ja, zh-CN, zh-TW  

\- \*\*기술 변경\*\*:  

&nbsp; - 기존: `data-i18n-key` 기반 수동 업데이트  

&nbsp; - 신규: \*\*i18next + lit-i18n\*\* 통합 → 자동 반응형 번역  

\- \*\*요구사항\*\*:  

&nbsp; - 언어 선택 드롭다운 제공  

&nbsp; - 동적 값은 ICU MessageFormat 사용



\### \[FR-UI-04] 버전 정보 표시 (Version Display)  

\- \*\*상태\*\*: ✅ 구현 예정 (v4.0.0)  

\- \*\*기술\*\*: `import.meta.env.VITE\_APP\_VERSION` 동적 참조  

\- \*\*요구사항\*\*: 게임 뷰 푸터에 `v4.0.0` 형식 표시



\### \[FR-UI-05] 지갑 정보 표시 및 연결 해제  

\- \*\*상태\*\*: ✅ 구현 예정 (v4.0.0)  

\- \*\*요구사항\*\*:  

&nbsp; - 연결된 지갑 주소(축약형) 표시  

&nbsp; - "Disconnect" 버튼 제공



\## 3.2. 게임 플레이 (Game Play)



\### \[FR-GAME-01] 슬롯머신  

\- \*\*형식\*\*: 5릴 × 3행, 20개 고정 페이라인  

\- \*\*기술\*\*: Canvas 또는 CSS Grid 기반 애니메이션 (성능 최적화)



\### \[FR-GAME-02] 실제 토큰 베팅  

\- \*\*토큰\*\*: CSPIN (`EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV`)  

\- \*\*게임 지갑\*\*: `UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83\_batQ-dptaR8Mtd`  

\- \*\*요구사항\*\*:  

&nbsp; - 스핀 시 \*\*사용자 승인 필수\*\*  

&nbsp; - 트랜잭션은 \*\*Jetton 전송 메시지\*\*로 구성  

&nbsp; - `/revealSpin` 호출 전 \*\*on-chain 포함 확인\*\*



\### \[FR-GAME-03] 스핀 실행  

\- \*\*플로우\*\*:  

&nbsp; 1. `/commitSpin` → `commitment` 수신  

&nbsp; 2. Jetton 전송 트랜잭션 생성 → `ton://transfer/...` deep-link 열기  

&nbsp; 3. 트랜잭션 확인 후 `/revealSpin` 호출  

\- \*\*BOC 생성\*\*: `@ton/core` 기반, `JettonWallet.createTransfer()` 사용



\### \[FR-GAME-04] 지연 지급 시스템  

\- \*\*티켓\*\*: JWT 기반, 5분 유효, 1회 사용  

\- \*\*중복 방지\*\*: Cloudflare KV에 `ticketId` 저장



\### \[FR-GAME-05] 실제 토큰 상금 지급  

\- \*\*요구사항\*\*:  

&nbsp; - `/claimPrize` 호출 시 티켓 검증  

&nbsp; - 게임 지갑 잔액 부족 시 `INSUFFICIENT\_FUNDS` 반환



\### \[FR-GAME-06] 더블업 미니게임 개선  

\- \*\*UI\*\*: "Red Card" / "Black Card" 버튼  

\- \*\*결과\*\*: 결정론적 PRNG (seed = `ticketId + choice + payout`)  

\- \*\*제한\*\*: 최대 5회



\## 3.3. 개발 및 테스트



\### \[FR-DEV-01] 개발자 모드 (결과 강제)  

\- \*\*조건\*\*: `DEV\_KEY` 환경 변수 일치 시  

\- \*\*기능\*\*: 특정 결과(잭팟 등) 강제 반환



\### \[FR-DEV-02] 개발자 모드 (무료 플레이)  

\- \*\*기능\*\*: 실제 토큰 소비 없이 플레이 가능  

\- \*\*잔액 표시\*\*: 가상 값 (예: 1000 CSPIN)



\### \[FR-DEV-03] 개발자 모드 BOC 로깅  

\- \*\*조건\*\*: `import.meta.env.DEV === true`  

\- \*\*출력\*\*:  

&nbsp; - Raw BOC (Uint8Array)  

&nbsp; - Base64 BOC  

&nbsp; - `ton://transfer/...` deep-link 예시  

\- \*\*제한\*\*: 프로덕션 빌드에서 절대 출력 금지



\## 3.4. 게임 경제



\### \[FR-ECON-01] 공식 게임 화폐  

\- \*\*블록체인\*\*: TON  

\- \*\*토큰명\*\*: CandleSpinner (CSPIN)  

\- \*\*토큰 주소\*\*: `EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV`  

\- \*\*게임 지갑\*\*: `UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83\_batQ-dptaR8Mtd`



---



\# 4. 비기능 요구사항 (Non-Functional Requirements)



| ID | 요구사항 | 상태 | 설명 |

|----|--------|------|------|

| \[NFR-SYS-01] | 서버리스 아키텍처 | ✅ 유지 | Cloudflare Pages + Functions |

| \[NFR-SYS-02] | 탈중앙성 | ✅ 유지 | Non-custodial, 자산은 항상 사용자 지갑 |

| \[NFR-SEC-01] | 보안 | ✅ 강화 | env 변수만 허용, 하드코딩 금지 |

| \[NFR-GAME-01] | 검증 가능한 공정성 | ✅ 강화 | Commit-Reveal only, `Math.random()` 금지 |

| \[NFR-CODE-01] | 주석 정책 | ✅ 유지 | 한국어 + 영어 병기 |

| \[NFR-CODE-02] | 버전 관리 | ✅ 유지 | Semantic Versioning |

| \[NFR-DOC-01] | 변경 이력 관리 | ✅ 유지 | Error-Cause-Solution 구조 |

| \[NFR-DOC-05] | 입력 검증 및 로깅 | ✅ 강화 | `Address.parse()`, 베팅 금액 검증, 상세 로그 |



---



\# 5. 완료된 버그 아카이브 (Resolved Issues Archive)



> ❗ \*\*기존 모든 항목 폐기\*\* — v4.0.0부터 새 아카이브 시작  

> (기존 이슈는 `docs/archive/PROJECT\_REQUIREMENTS\_v1.md`로 이동)



---



> ✅ \*\*이 문서는 AI 코딩 에이전트(Jules)가 코드를 처음부터 작성하기 위한 유일한 진실 공급원\*\*(SSOT)입니다.  

> 모든 구현은 이 문서의 요구사항을 충족해야 하며, 기술 스택 변경 사항을 반드시 반영해야 합니다.

