***REMOVED***CandleSpinner 작업 현황판 (KANBAN) v2.0

**마지막 업데이트**: 2025-11-01  
**현재 상태**: MVP v2 재구축 시작

---

#***REMOVED***[To Do] (대기)

##***REMOVED***MVP v2 핵심 기능
- [ ] [개발] 프로젝트 초기화 (package.json, tsconfig.json)
- [ ] [개발] 지갑 연결 (TON Connect UI)
- [ ] [개발] 입금 기능 (Jetton Transfer)
- [ ] [개발] 슬롯 머신 게임 (간단한 버전)
- [ ] [개발] 인출 기능 (서버 서명 방식)
- [ ] [개발] 크레딧 관리 (Cloudflare KV)

##***REMOVED***향후 기능 (Phase 2)
- [ ] [Phase 2] 스마트 컨트랙트 기반 인출
- [ ] [Phase 2] 더블업 미니게임
- [ ] [Phase 2] PixiJS 애니메이션
- [ ] [Phase 2] 잭팟 비디오

---

#***REMOVED***[In Progress] (진행 중)

- [ ] [리팩토링] MVP v2 재구축 (클린 아키텍처)
  - [x] 레거시 코드 아카이빙 완료
  - [x] 새로운 프로젝트 구조 생성 완료
  - [x] 아키텍처 설계 문서 작성 완료
  - [ ] **검토 대기: 아키텍처 설계 승인 필요**
  - [ ] 핵심 기능 구현 (입금/게임/인출)

---

#***REMOVED***[Done] (최근 완료)

- [x] **[리팩토링] MVP v1 레거시 코드 아카이빙 (2025-11-01)**
  - **배경**: 여러 RPC 방식(Ankr, TonCenter v2/v3)과 스마트 컨트랙트 방식이 혼재되어 오류 추적 및 디버깅이 어려움
  - **작업**: `archive/legacy-code/mvp-v1-backup-20251101/` 로 전체 코드베이스 백업
  - **아카이빙 대상**: 
    - 백엔드: `functions/`
    - 프론트엔드: `src/`, `public/`, `index.html`
    - 설정: `package.json`, `tsconfig.json`, `vite.config.ts`, `wrangler.toml` 등
    - 유틸리티: `scripts/`, `wallet-tools/`
  - **보존**: `docs/`, `PoC/`, `archive/`, `.git/`, `README.md`, `kanban.md`
  - **다음 단계**: 클린 아키텍처로 MVP v2 재구축

- [x] **[버그] TonCenter v3 API `Method Not Allowed` 오류 수정 → v2로 전환 (v2.4.0) (2025-11-01)**
  - **원인**: TonCenter v3 API의 `/message` 엔드포인트가 `Method Not Allowed` 오류 발생. v3 API 불안정.
  - **해결**: TonCenter v2 API로 전환. `/api/v2/sendBoc` 엔드포인트 사용으로 안정성 확보.
  - **변경 파일**: 
    - `functions/src/lib/rpc-utils.ts`: `TonCenterV2Rpc` 클래스 추가
    - `functions/src/handlers/initiate-withdrawal.ts`: v3 → v2 전환
  - **주요 개선**:
    - 검증된 v2 API 사용으로 안정성 향상
    - 간결한 응답 처리 로직
    - 명확한 오류 메시지
  - **SSOT 업데이트**: 불필요 (내부 구현 개선)

- [x] **[버그] RPC 인출 `window not defined` 오류 수정 (v2.3.1) (2025-11-01)**
  - **원인**: Cloudflare Workers(서버) 환경에서 브라우저 전용 `crypto` API를 사용하는 `@ton/crypto` 라이브러리 호출로 인한 오류.
  - **해결**: `functions/src/lib/mnemonic-utils.ts` 파일에 Node.js의 `crypto` 모듈을 `globalThis.crypto`에 할당하는 폴리필을 추가하여 서버 환경에서도 암호화 기능이 정상 동작하도록 수정.
  - **변경 파일**: `functions/src/lib/mnemonic-utils.ts`
  - **SSOT 업데이트**: 불필요 (내부 구현 수정)

- [x] **[API] RPC 인출 방식 TonCenter v3로 변경 (v2.3.0) (2025-10-31)**
  - **SSOT 업데이트**: 스마트컨트랙트 Permit 방식 → RPC 직접 전송 방식 (문서-코드 동기화)
  - **변경 파일**: 
    - SSOT 문서 3개 (산출물2, 산출물3, README)
    - `functions/api/rpc-utils.ts`: `TonCenterV3Rpc` 클래스 추가 (+230줄)
    - `functions/api/initiate-withdrawal.ts`: TonCenter v3 통합
    - `wrangler.toml`: `TONCENTER_API_KEY` 환경 변수 안내
  - **주요 개선**:
    - JSON-RPC 2.0 표준 준수
    - `X-API-Key` 인증 방식 적용
    - 상세한 로깅 (`[TonCenter v3]` 프리픽스)
  - **배포 상태**: ✅ 코드 완료, 환경 변수 설정 완료, 테스트 대기
