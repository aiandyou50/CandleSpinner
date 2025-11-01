***REMOVED***CandleSpinner 작업 현황판 (KANBAN) v1.0

---

#***REMOVED***[To Do] (대기)

- [ ] [Phase 2] 크레딧 영속화 로직 구현 (/api/get-credit 및 프론트엔드 연동)
- [ ] [Phase 2] 동기식 인출 로직 구현 (/api/initiate-withdrawal 실제 코드 작성 및 seqno 관리)
- [ ] [개발] 인출 스마트 컨트랙트 개발 (FunC/Tact)
- [ ] [개발] 백엔드 API 수정 (/api/initiate-withdrawal -> 인출 허가증 생성 로직)
- [ ] [개발] 프론트엔드 수정 (스마트 컨트랙트 호출 로직 추가)
- [ ] [Phase 1] `/api/spin` 엔드포인트 실제 코드 구현 (백엔드)
- [ ] [Phase 1] 슬롯머신 릴 애니메이션 `PixiJS` 연동 (프론트엔드)
- [ ] [Phase 1] 잭팟 발생 시 비디오 재생 기능 구현 (프론트엔드)
- [ ] [Phase 1] 미니게임(더블업) API 로직 구현 (백엔드)

---

#***REMOVED***[In Progress] (진행 중)

- [x] [아키텍처] 인출 로직 스마트 컨트랙트 방식으로 변경 설계
- [ ] [개발] WithdrawalManager 테스트넷 배포 (환경 설정 완료, 배포 대기)
- [ ] [개발] initiate-withdrawal.ts 스마트컨트랙트 통합
- [ ] [개발] GameComplete.tsx 가스비 알림 UI 추가
- [x] [버그] RPC 인출 window not defined 오류 수정
- [ ] [리팩토링] 전면 구조 재정비 및 문서 아카이빙

---

#***REMOVED***[Done] (최근 완료)

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
