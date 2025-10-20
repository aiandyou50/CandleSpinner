***REMOVED***CandleSpinner 변경 이력 (Changelog)

모든 프로젝트의 주요 변경 사항은 이 파일에 기록됩니다.
이 프로젝트는 [시맨틱 버전(SemVer)](https://semver.org/lang/ko/)을 준수합니다.

---

#***REMOVED***[2.0.1] - 2025-10-21 (긴급 배포)

##***REMOVED***🐛 수정됨 (Fixed)
- **UI 버그 재배포** (Cloudflare 캐시 무효화)
  - TonConnect 버튼 가시성 개선
  - Telegram Mini App 링크 버튼 추가
  - MVP 체크리스트 제거
  - 입금 에러 핸들링 강화

---

#***REMOVED***[2.0.0] - 2025-10-21

##***REMOVED***🎯 MVP 완성 버전 - 전체 리팩토링

###***REMOVED***✨ 추가됨 (Added)
- **단순화된 입금 시스템**
  - `Deposit.tsx`: 통합 입금 컴포넌트 (TonConnect 기반, TMA/웹 모두 지원)
  - `/api/deposit`: 단순화된 백엔드 엔드포인트 (KV 크레딧 저장만)
  - 완전히 탈중앙화된 구조 (프라이빗 키 백엔드 미사용)

###***REMOVED***🔧 변경됨 (Changed)
- **App.tsx 전면 재작성**
  - 간단한 game/deposit 모드 전환
  - TMA와 웹 브라우저 모드 통합 관리
  - 복잡한 A/B 선택 UI 제거
  
- **Game.tsx 단순화**
  - TMADeposit 컴포넌트 제거
  - onDepositClick 콜백으로 입금 화면 호출
  - 불필요한 로직 제거

- **아키텍처 단순화**
  - 기존: 복잡한 Jetton transfer 메시지 → 실패율 높음
  - 신규: 간단한 TON 전송 + KV 크레딧 → 안정적, 빠름
  - 백엔드 복잡도 극소화

###***REMOVED***🗑️ 제거됨 (Removed)
- ❌ `DepositDirect.tsx` (복잡한 Jetton 전송 로직)
- ❌ `DepositAuto.tsx` (Ankr RPC 통합)
- ❌ `WebDeposit.tsx` (구식 컴포넌트)
- ❌ `TMADeposit.tsx.backup` (백업 파일)
- ❌ `/api/deposit-auto.ts` (불필요)
- ❌ `/api/deposit-complete.ts` (불필요)
- ❌ `/api/get-jetton-wallet.ts` (불필요)
- ❌ `/api/rpc.ts` (불필요)
- ❌ 기타 복잡한 엔드포인트

###***REMOVED***💡 MVP 요구사항 충족

| 요구사항 | v1.5.0 | v2.0.0 | 상태 |
|---------|--------|--------|------|
| 브라우저 입금 가능 | ❌ | ✅ | 해결 |
| TMA 입금 가능 | ❌ | ✅ | 해결 |
| 단순하고 안정적 | ❌ | ✅ | 개선 |
| 빌드 성공 | ✅ | ✅ | 유지 |

###***REMOVED***📊 코드 통계
- 삭제된 파일: 4개 (DepositDirect, DepositAuto, WebDeposit, TMADeposit.backup)
- 삭제된 엔드포인트: 4개
- 생성된 파일: 2개 (Deposit.tsx, deposit.ts 신규)
- 수정된 파일: 2개 (App.tsx, Game.tsx 단순화)

###***REMOVED***🚀 핵심 개선사항

**입금 플로우 (v2.0.0):**
```
1. 사용자가 "CSPIN 입금" 버튼 클릭
2. Deposit 컴포넌트 표시
3. TonConnect로 간단한 트랜잭션 서명
4. 백엔드 `/api/deposit`에 기록
5. KV에 크레딧 저장
6. 게임 진행
```

**이전 문제점 (v1.5.0):**
- 복잡한 Jetton transfer 메시지 구성 → 실패율 높음
- 다양한 RPC 호출 필요 → 불안정
- TMA와 웹 모드 로직 분산 → 유지보수 어려움
- A/B 방식 선택 UI → 사용자 혼란

**새로운 장점 (v2.0.0):**
- ✅ 간단한 구조 → 높은 성공률
- ✅ 백엔드 의존성 최소화 → 빠른 응답
- ✅ TMA/웹 통합 → 단일 코드
- ✅ 사용자 경험 개선 → 직관적인 UI

---

#***REMOVED***[1.5.0] - 2025-10-21

##***REMOVED***✨ 추가됨 (Added)
- **A/B 이중 입금 방식 구현**
  - **방식 A (DepositDirect):** TonConnect 클라이언트 직접 서명 기반 입금
  - **방식 B (DepositAuto):** Ankr RPC 자동 입금
- `DepositDirect.tsx`, `DepositAuto.tsx` 컴포넌트
- `/api/deposit-auto`, `/api/deposit-complete` 백엔드 엔드포인트

##***REMOVED***🔧 변경됨 (Changed)
- App.tsx에 A/B 입금 방식 선택 UI 추가

##***REMOVED***📚 문서 (Docs)
- [산출물2] v1.5 업데이트
- [산출물3] D섹션 추가

##***REMOVED***⚠️ 알려진 문제
- **테스트 실패**: Jetton 복잡 로직, TMA 연동 오류 발생
- **해결**: v2.0.0에서 전체 단순화

---


##***REMOVED***✨ 추가됨 (Added)
- **A/B 이중 입금 방식 구현**
  - **방식 A (DepositDirect):** TonConnect 클라이언트 직접 서명 기반 입금
    - 완전 탈중앙화 (사용자가 직접 지갑에서 서명)
    - 백엔드 가스비 비용 없음
    - `/api/deposit-complete` 엔드포인트 (KV 크레딧 업데이트만)
  - **방식 B (DepositAuto):** Ankr RPC 자동 입금
    - 사용자가 금액만 입력하면 백엔드에서 자동 처리
    - 완전 자동화된 UX
    - `/api/deposit-auto` 엔드포인트 (Ankr RPC 통합)
- `DepositDirect.tsx` 컴포넌트 (TonConnect 클라이언트 서명)
- `DepositAuto.tsx` 컴포넌트 (백엔드 자동 입금)
- `functions/api/deposit-complete.ts` 백엔드 엔드포인트
- `functions/api/deposit-auto.ts` 백엔드 엔드포인트 (Ankr RPC 지원)
- App.tsx에 A/B 입금 방식 선택 메인 화면 UI

##***REMOVED***🔧 변경됨 (Changed)
- App.tsx 리팩토링: 입금 방식 선택 UI 추가
- 메인 게임 화면에 "방식 A", "방식 B", "게임 시작" 버튼 추가
- 문서 [산출물2] 아키텍처 v1.5 업데이트 (A/B 입금 방식 추가)
- 문서 [산출물3] 의사코드에 D섹션 추가 (A/B 이중 입금 방식 상세 기록)

##***REMOVED***🔒 보안 (Security)
- 방식 A: 사용자 개인키는 지갑에만 존재 (백엔드에서 관리 불필요)
- 방식 B: 게임 지갑 프라이빗 키는 Cloudflare Pages 암호화 환경 변수로 관리

##***REMOVED***📚 문서 (Docs)
- [산출물2] v1.5: Ankr RPC 기술 스택 추가
- [산출물3] D섹션: A/B 이중 입금 방식 상세 의사코드 (플로우, 백엔드 로직, 환경변수 설정)
- MVP 테스트 전략 추가 (A방식 우선, B방식 추가, 통합 테스트)

##***REMOVED***🎯 MVP 테스트 가능
- A방식: 안정성 우선 (사용자 지갑 직접 서명)
- B방식: 자동화 우선 (백엔드 자동 처리)
- 둘 다 동시에 선택 가능하여 유연한 테스트 환경 제공

---

#***REMOVED***[1.4.0] - 2025-10-21

##***REMOVED***✨ 추가됨 (Added)
- `/api/initiate-deposit` 백엔드 엔드포인트 (RPC를 통한 실제 CSPIN 입금)
- `WebDeposit.tsx` 컴포넌트 (웹브라우저 입금 UI)
- TMADeposit 컴포넌트 백엔드 입금 기능 통합
- 백엔드 기반 트랜잭션 생성 및 Jetton 전송 로직

##***REMOVED***🔧 변경됨 (Changed)
- TMADeposit: 시뮬레이션 기반 입금에서 실제 RPC 호출 기반 입금으로 변경
- 프론트엔드 입금 요청 → 백엔드 트랜잭션 생성/전송으로 보안 강화

##***REMOVED***📚 문서 (Docs)
- [산출물3] A.5.5 `/api/initiate-deposit` 엔드포인트 추가 및 상세 의사코드 기록

##***REMOVED***⚠️ 알려진 문제
- v1.4.0 테스트 실패: tonapi.io RPC 기반 입금이 테스트에서 완전 실패
- 원인: 복잡한 RPC 연동, 동시성 문제 (seqno 동기화), API 레이트 제한
- 해결: v1.5.0에서 A/B 이중 방식 도입으로 안정성 극대화

---

#***REMOVED***[1.3.1] - 2025-10-20

##***REMOVED***🔒 보안 (Security)
- 봇 토큰 하드코딩 제거 및 환경 변수 사용으로 보안 강화
- setup-bot.js 파일 재생성 (환경 변수 BOT_TOKEN 사용)

##***REMOVED***🗑️ 제거됨 (Removed)
- 하드코딩된 봇 토큰 완전 제거

---

#***REMOVED***[1.3.0] - 2025-10-20

##***REMOVED***✨ 추가됨 (Added)
- TMA 하이브리드 아키텍처 구현 (App.tsx)
- Telegram Mini Apps 환경 자동 감지 및 조건부 렌더링
- TMADeposit 컴포넌트 TMA 환경 통합

##***REMOVED***🗑️ 제거됨 (Removed)
- temp_telegram_tt Git submodule 완전 제거

##***REMOVED***🐛 수정됨 (Fixed)
- Git submodule 관련 배포 문제 해결

---


#***REMOVED***[1.3.1] - 2025-10-20

##***REMOVED***🔒 보안 (Security)
- 봇 토큰 하드코딩 제거 및 환경 변수 사용으로 보안 강화
- setup-bot.js 파일 재생성 (환경 변수 BOT_TOKEN 사용)

##***REMOVED***🗑️ 제거됨 (Removed)
- 하드코딩된 봇 토큰 완전 제거

---

#***REMOVED***[1.3.0] - 2025-10-20

##***REMOVED***✨ 추가됨 (Added)
- TMA 하이브리드 아키텍처 구현 (App.tsx)
- Telegram Mini Apps 환경 자동 감지 및 조건부 렌더링
- TMADeposit 컴포넌트 TMA 환경 통합

##***REMOVED***🗑️ 제거됨 (Removed)
- temp_telegram_tt Git submodule 완전 제거

##***REMOVED***🐛 수정됨 (Fixed)
- Git submodule 관련 배포 문제 해결

---

#***REMOVED***[1.2.0] - 2025-10-20

##***REMOVED***📚 문서 (Docs)
- [산출물4] TMA 하이브리드 변환 기능 완전 문서화
- TMA 개념, 하이브리드 아키텍처, 기술 구현 세부사항, UX 플로우 문서화
- Telegram Mini Apps SDK 통합 가이드 및 보안 고려사항 포함

---

#***REMOVED***[1.1.8] - 2025-10-20

##***REMOVED***🐛 수정됨 (Fixed)
- CSPIN 입금 시 제톤 전송 페이로드의 forward_payload TL-B 구조 수정 (right$1 nothing$0)
- CSPIN 입출 테스트 버튼 삭제
- CSPIN 인출 로직을 백엔드 호출로 변경 (프론트엔드 직접 전송 제거)

##***REMOVED***📚 문서 (Docs)
- [산출물3] CSPIN 입금/인출 로직 업데이트

---

##***REMOVED***🐛 수정됨 (Fixed)
- CSPIN 입금 시 제톤 지갑 주소 로컬 계산을 직접 구현하여 @ton/core 라이브러리 의존성 제거

---

#***REMOVED***[1.1.6] - 2025-10-20

##***REMOVED***🐛 수정됨 (Fixed)
- CSPIN 입금 시 RPC 대신 로컬 @ton/core 라이브러리로 제톤 지갑 주소 계산하여 RPC 의존성 제거

---

#***REMOVED***[1.1.5] - 2025-10-20

##***REMOVED***📚 문서 (Docs)
- [산출물2] GAME_WALLET_PRIVATE_KEY 환경변수 설명 추가

---

#***REMOVED***[1.1.1] - 2025-10-20

##***REMOVED***🐛 수정됨 (Fixed)
- CSPIN 입금 시 사용자의 제톤 지갑 주소 계산하여 올바른 트랜잭션 전송
- 네트워크 수수료를 0.1 TON → 0.03 TON으로 최적화
- CSPIN 입금/인출 실제 토큰 전송 문제 해결

##***REMOVED***📚 문서 (Docs)
- [산출물3] 수수료 최적화 반영

---

#***REMOVED***[1.1.0] - 2025-10-20

##***REMOVED***✨ 추가됨 (Added)
- CSPIN 인출 기능 실제 트랜잭션 구현 (게임 월렛에서 사용자 지갑으로 토큰 전송)
- 인출 테스트 버튼에 withdrawalAmount 파라미터 추가

##***REMOVED***🐛 수정됨 (Fixed)
- 인출 API에서 withdrawalAmount undefined 문제 해결

##***REMOVED***📚 문서 (Docs)
- [산출물3] 인출 API (/api/initiate-withdrawal) 실제 트랜잭션 로직 추가

---

#***REMOVED***[1.0.1] - 2025-10-19

##***REMOVED***✨ 추가됨 (Added)
- CSPIN 토큰 인출 기능 구현 (프론트엔드 직접 트랜잭션 방식)
- Cloudflare Functions 환경 호환성 해결
- 외부 API 비용 문제 해결

##***REMOVED***🐛 수정됨 (Fixed)
- @ton 라이브러리 Cloudflare 호환성 문제 해결
- tonweb 라이브러리 대안 검토 및 구현

##***REMOVED***📚 문서 (Docs)
- [산출물4] CSPIN 토큰 인출 기능 기술 설계 문서 작성

---

#***REMOVED***[1.0.0] - 2025-10-18

##***REMOVED***🎉 최초 릴리즈 (Initial Release)
- 기본 슬롯머신 게임 로직 구현
- TON Connect 지갑 연동
- CSPIN 토큰 입금 기능
- Cloudflare KV 크레딧 관리
- 미니게임 (더블업) 구현
- 다국어 지원 (i18n)
- Cloudflare Pages 배포

---

*이 변경 이력은 프로젝트의 모든 주요 변경사항을 추적합니다.*