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

---

#***REMOVED***[Done] (최근 완료)

- [x] **[아키텍처] 인출 로직 스마트컨트랙트 방식으로 변경 설계 및 SSOT 문서 업데이트 (2025-10-26)**
  - **변경 사항**:
    - ❌ 기존: 백엔드 RPC 직접 전송 (중앙화)
    - ✅ 신규: 스마트컨트랙트 기반 사용자 주도 인출 (탈중앙화)
  - **수정된 SSOT 문서** (4개):
    1. `[산출물2]기술-스택-및-아키텍처-설계.md` - 다이어그램 + API 엔드포인트 + 스마트컨트랙트 섹션
    2. `[산출물3]MVP핵심-로직-의사코드.md` - A.6 Permit 방식 + A.6.1 confirm 신규 + B.4 인출 플로우
    3. `README.md` - 시스템 다이어그램 + 인출 흐름 테이블 + 게임 플로우
    4. `[산출물1]프로젝트-정의서.md` - 게임 플레이 흐름 4단계
  - **핵심 API 변경**:
    - `/api/initiate-withdrawal` - Permit 생성 & 서명 (RPC 직접 전송 삭제)
    - `/api/confirm-withdrawal` (신규) - 블록체인 확인 후 KV 차감
  - **스마트컨트랙트 메시지**:
    - `WithdrawWithPermit` - 사용자 주도 인출용 (신규)
    - `WithdrawalRequest` - 백엔드 호출용 (기존, 유지)
  - **상태**: ✅ 완료

- [x] **[니모닉] 24단어 니모닉 → 프라이빗 키 변환 완료**
  - 프라이빗 키: 14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917...
  - 테스트넷 지갑: 0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
  - 메인넷 지갑: UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC

- [x] **[환경변수] .env.local 완전히 설정**
  - DEPLOYER_WALLET_ADDRESS_TESTNET/MAINNET 자동 설정
  - DEPLOYER_PRIVATE_KEY 환경 변수로 로드
  - DEPLOYER_MNEMONIC 니모닉 백업 추가
  - CSPIN_JETTON, GAME_JETTON_WALLET 설정 완료

- [x] **[배포 스크립트] deployWithdrawalManager.ts 완벽하게 업데이트**
  - 환경 변수 자동 검증
  - 배포자 정보 자동 로드
  - 테스트넷/메인넷 자동 선택 로직 추가
  - 에러 메시지 상세화

- [x] **[도구] 환경 확인 스크립트 추가 (npm run check-env)**
  - 필수 환경 변수 5개 검증
  - 필수 파일 4개 확인
  - npm 패키지 5개 확인
  - 배포 가능 여부 판단


- [x] **[문서] Day 2 완성 보고서 및 배포 가이드 (3개)**
  - MNEMONIC-TO-PRIVKEY-완료.md: 변환 결과 및 단계별 가이드
  - DEPLOYMENT-SIMULATION.md: 배포 프로세스 및 트러블슈팅
  - Day2-니모닉변환완료_20251025.md: 진행 상황 정리

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