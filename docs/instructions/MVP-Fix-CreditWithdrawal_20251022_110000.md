# 명령 지시서: MVP 핵심 기능 구현 (크레딧 영속화 + 보안 인출)

**지시서 ID:** MVP-Fix-CreditWithdrawal  
**발급일:** 2025년 10월 22일  
**우선순위:** 🔴 Blocking (MVP 완성 필수)  
**워크플로우:** Full (신규 엔드포인트 + 주요 기능)

---

## 📋 작업 개요

MVP 완성을 위한 2가지 Blocking 이슈 해결:

### Task 1: 크레딧 영속화 (새로고침 문제 해결)

**현재 문제:**
- 페이지 새로고침 시 KV에 저장된 크레딧이 프론트엔드 UI에서 0으로 초기화됨
- 지갑 연결 시 KV의 잔액을 다시 불러와 UI에 반영해야 함

**요구사항:**
1. 신규 백엔드 API: `GET /api/get-credit`
   - 쿼리 파라미터: `walletAddress`
   - 응답: `{ credit: number }`
   - 구현: `docs/ssot/[산출물3]MVP...md`의 `getKVState` 재사용

2. 프론트엔드 수정: `src/App.tsx` 또는 `src/components/Game.tsx`
   - `useEffect` 훅으로 지갑 연결 감지
   - 지갑 변경 시 `/api/get-credit` 호출
   - Zustand 상태 업데이트
   - Sentry 에러 추적 적용

---

### Task 2: 보안 인출 로직 구현

**요구사항:**
1. 신규 백엔드 API: `POST /api/initiate-withdrawal`
   - `docs/ssot/[산출물3]MVP...md`의 `A.6`, `C.2` 섹션 기반
   - **[핵심]** 원자적(Atomic) `seqno` 관리 구현
     - KV에서 `game_wallet_seqno` 읽기
     - 1 증가
     - 트랜잭션 서명/전송
     - KV 업데이트
   - Jetton Transfer Payload 생성 (`buildJettonTransferPayload`)
   - 트랜잭션 서명 및 전송
   - 성공 시 사용자 크레딧 KV에서 차감

---

## 🔄 Full 워크플로우 체크리스트

- [ ] [Step 2] ✅ 명령 지시서 아카이빙 (현재 파일)
- [ ] [Step 3] 코드 + 문서 생성 및 제안
- [ ] [Step 4] 버전 업데이트 (v2.2.0 → v2.3.0)
- [ ] [Step 5] 해결 기록 작성
- [ ] [Step 6] 칸반 보드 업데이트

---

## 📚 참고 문서

- `docs/ssot/[산출물3]MVP핵심-로직-의사코드.md`: API 의사코드
- `docs/ssot/[산출물2]기술-스택-및-아키텍처-설계.md`: API 엔드포인트 목록
- `docs/ssot/README.md`: SSOT 메인 가이드
- `workflows/AI-워크플로우-지침서.md`: Full 워크플로우 정의

---

**상태:** 아카이빙 완료, 다음 단계: [Step 3] 코드 생성
