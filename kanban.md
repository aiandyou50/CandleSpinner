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
- [ ] [개발] WithdrawalManager 테스트넷 배포 (환경 설정 필요)
- [ ] [개발] initiate-withdrawal.ts 스마트컨트랙트 통합
- [ ] [개발] GameComplete.tsx 가스비 알림 UI 추가

---

#***REMOVED***[Done] (최근 완료)

- [x] **[스마트컨트랙트] WithdrawalManager.tact 개발 완료 (400줄)**
  - 메시지 기반 아키텍처, 11개 테스트 케이스 정의
  - Jetton TEP-74 표준 준수
  
- [x] **[개발환경] contracts/ 프로젝트 초기화 및 npm install**
  - @ton/blueprint, @ton/core v0.56.0, @ton/sandbox 설치
  - 의존성 충돌 해결 (@ton/core v0.55.0 → v0.56.0 업그레이드)
  
- [x] **[Git 설정] .gitignore 최적화**
  - `/node_modules`, `contracts/node_modules`, `**/node_modules` 추가
  - node_modules 추적 방지 (용량 절약: ~100MB)
  
- [x] **[배포] 배포 스크립트 완성**
  - Blueprint CLI 호환성 확보
  - 테스트넷/메인넷 환경 변수 템플릿 (`.env.local`)
  
- [x] **[문서] .gitignore 학습 가이드 작성**
  - 패턴 문법, 명령어, 베스트 프랙티스 포함