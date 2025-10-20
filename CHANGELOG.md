# CandleSpinner 변경 이력 (Changelog)

모든 프로젝트의 주요 변경 사항은 이 파일에 기록됩니다.
이 프로젝트는 [시맨틱 버전(SemVer)](https://semver.org/lang/ko/)을 준수합니다.

---

## [1.0.2] - 2025-10-20

### 🐛 수정됨 (Fixed)
- CSPIN 인출 기능 에러 처리 및 로깅 개선
- 트랜잭션 상태 모니터링 강화
- 백엔드 finalize 응답에 newCredit 필드 추가

### 📚 문서 (Docs)
- [산출물4] CSPIN 토큰 인출 기능 구현 보고서 업데이트

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