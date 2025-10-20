# CandleSpinner 변경 이력 (Changelog)

모든 프로젝트의 주요 변경 사항은 이 파일에 기록됩니다.
이 프로젝트는 [시맨틱 버전(SemVer)](https://semver.org/lang/ko/)을 준수합니다.

---

## [1.4.0] - 2025-10-21

### ✨ 추가됨 (Added)
- `/api/initiate-deposit` 백엔드 엔드포인트 (RPC를 통한 실제 CSPIN 입금)
- `WebDeposit.tsx` 컴포넌트 (웹브라우저 입금 UI)
- TMADeposit 컴포넌트 백엔드 입금 기능 통합
- 백엔드 기반 트랜잭션 생성 및 Jetton 전송 로직

### 🔧 변경됨 (Changed)
- TMADeposit: 시뮬레이션 기반 입금에서 실제 RPC 호출 기반 입금으로 변경
- 프론트엔드 입금 요청 → 백엔드 트랜잭션 생성/전송으로 보안 강화

### 📚 문서 (Docs)
- [산출물3] A.5.5 `/api/initiate-deposit` 엔드포인트 추가 및 상세 의사코드 기록

---

## [1.3.1] - 2025-10-20

### 🔒 보안 (Security)
- 봇 토큰 하드코딩 제거 및 환경 변수 사용으로 보안 강화
- setup-bot.js 파일 재생성 (환경 변수 BOT_TOKEN 사용)

### 🗑️ 제거됨 (Removed)
- 하드코딩된 봇 토큰 완전 제거

---

## [1.3.0] - 2025-10-20

### ✨ 추가됨 (Added)
- TMA 하이브리드 아키텍처 구현 (App.tsx)
- Telegram Mini Apps 환경 자동 감지 및 조건부 렌더링
- TMADeposit 컴포넌트 TMA 환경 통합

### 🗑️ 제거됨 (Removed)
- temp_telegram_tt Git submodule 완전 제거

### 🐛 수정됨 (Fixed)
- Git submodule 관련 배포 문제 해결

---

## [1.2.0] - 2025-10-20

### 📚 문서 (Docs)
- [산출물4] TMA 하이브리드 변환 기능 완전 문서화
- TMA 개념, 하이브리드 아키텍처, 기술 구현 세부사항, UX 플로우 문서화
- Telegram Mini Apps SDK 통합 가이드 및 보안 고려사항 포함

---

## [1.1.8] - 2025-10-20

### 🐛 수정됨 (Fixed)
- CSPIN 입금 시 제톤 전송 페이로드의 forward_payload TL-B 구조 수정 (right$1 nothing$0)
- CSPIN 입출 테스트 버튼 삭제
- CSPIN 인출 로직을 백엔드 호출로 변경 (프론트엔드 직접 전송 제거)

### 📚 문서 (Docs)
- [산출물3] CSPIN 입금/인출 로직 업데이트

---

### 🐛 수정됨 (Fixed)
- CSPIN 입금 시 제톤 지갑 주소 로컬 계산을 직접 구현하여 @ton/core 라이브러리 의존성 제거

---

## [1.1.6] - 2025-10-20

### 🐛 수정됨 (Fixed)
- CSPIN 입금 시 RPC 대신 로컬 @ton/core 라이브러리로 제톤 지갑 주소 계산하여 RPC 의존성 제거

---

## [1.1.5] - 2025-10-20

### 📚 문서 (Docs)
- [산출물2] GAME_WALLET_PRIVATE_KEY 환경변수 설명 추가

---

## [1.1.1] - 2025-10-20

### 🐛 수정됨 (Fixed)
- CSPIN 입금 시 사용자의 제톤 지갑 주소 계산하여 올바른 트랜잭션 전송
- 네트워크 수수료를 0.1 TON → 0.03 TON으로 최적화
- CSPIN 입금/인출 실제 토큰 전송 문제 해결

### 📚 문서 (Docs)
- [산출물3] 수수료 최적화 반영

---

## [1.1.0] - 2025-10-20

### ✨ 추가됨 (Added)
- CSPIN 인출 기능 실제 트랜잭션 구현 (게임 월렛에서 사용자 지갑으로 토큰 전송)
- 인출 테스트 버튼에 withdrawalAmount 파라미터 추가

### 🐛 수정됨 (Fixed)
- 인출 API에서 withdrawalAmount undefined 문제 해결

### 📚 문서 (Docs)
- [산출물3] 인출 API (/api/initiate-withdrawal) 실제 트랜잭션 로직 추가

---

## [1.0.1] - 2025-10-19

### ✨ 추가됨 (Added)
- CSPIN 토큰 인출 기능 구현 (프론트엔드 직접 트랜잭션 방식)
- Cloudflare Functions 환경 호환성 해결
- 외부 API 비용 문제 해결

### 🐛 수정됨 (Fixed)
- @ton 라이브러리 Cloudflare 호환성 문제 해결
- tonweb 라이브러리 대안 검토 및 구현

### 📚 문서 (Docs)
- [산출물4] CSPIN 토큰 인출 기능 기술 설계 문서 작성

---

## [1.0.0] - 2025-10-18

### 🎉 최초 릴리즈 (Initial Release)
- 기본 슬롯머신 게임 로직 구현
- TON Connect 지갑 연동
- CSPIN 토큰 입금 기능
- Cloudflare KV 크레딧 관리
- 미니게임 (더블업) 구현
- 다국어 지원 (i18n)
- Cloudflare Pages 배포

---

*이 변경 이력은 프로젝트의 모든 주요 변경사항을 추적합니다.*