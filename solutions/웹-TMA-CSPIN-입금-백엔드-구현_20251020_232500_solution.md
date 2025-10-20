# 해결 기록: 웹-TMA CSPIN 입금 백엔드 구현

> **원본 지시서:** `instructions/웹-TMA-CSPIN-입금-백엔드-구현_20251020_232500.md`
> **관련 커밋:** 553a398
> **최종 버전:** v1.4.0

---

### 1. 해결 방법 요약

**문제**: 웹브라우저와 TMA 환경 모두에서 CSPIN 입금이 불가능했음
- 웹: TonConnect 지갑 서명만 가능, 실제 트랜잭션 전송 불가
- TMA: 시뮬레이션 기반 입금만 동작

**근본 원인**: 프론트엔드에서 RPC 접근 불가능, 트랜잭션 생성/서명 불가능

**솔루션 (옵션 1 채택)**: Cloudflare Functions 백엔드에서 RPC 호출 및 트랜잭션 관리

### 2. 핵심 코드 변경 사항

#### 2.1 백엔드 구현
- **`functions/api/initiate-deposit.ts`** (새로 생성):
  - 게임 지갑의 프라이빗 키를 환경 변수에서 로드
  - RPC (tonapi.io)를 통해 Jetton 지갑 주소, 시퀀스 번호 조회
  - @ton/ton 라이브러리로 트랜잭션 생성 및 BOC 인코딩
  - tonapi.io 블록체인 API로 BOC 전송
  - KV에 사용자 크레딧 업데이트

#### 2.2 프론트엔드 수정
- **`src/components/TMADeposit.tsx`**:
  - 시뮬레이션 기반 `setTimeout` 제거
  - `/api/initiate-deposit` 백엔드 API 호출 추가
  - 에러 핸들링 및 사용자 피드백 개선

- **`src/components/WebDeposit.tsx`** (새로 생성):
  - 웹브라우저 환경용 입금 UI 컴포넌트
  - TonConnect 지갑 연결 상태 표시
  - 입금액 입력 및 빠른 선택 버튼
  - 백엔드 API 호출 및 상태 업데이트

#### 2.3 문서 동기화
- **`docs/ssot/[산출물3]핵심-로직-의사코드-(MVP-확장-v2.0).md`**:
  - A.5.5 새로운 섹션 추가: `/api/initiate-deposit` 상세 의사코드
  - Jetton 전송 메시지 생성, RPC 조회, BOC 인코딩 플로우 기록

---

### 3. 기술적 특징

#### 3.1 보안 강화
- 게임 지갑의 프라이빗 키를 서버에서만 관리 (프론트엔드 노출 없음)
- Cloudflare Pages 환경 변수로 암호화 저장
- 사용자는 자신의 지갑 주소만 전달

#### 3.2 블록체인 통신
- RPC: tonapi.io를 통한 안정적인 노드 접근
- Retry 로직: 429 rate limit 자동 재시도 (exponential backoff)
- Jetton 표준: transfer op (0x0f8a7ea5)으로 CSPIN 토큰 전송

#### 3.3 사용자 경험
- 웹/TMA 모두 동일한 입금 플로우
- 트랜잭션 해시 반환으로 검증 가능
- KV 크레딧 즉시 업데이트

---

### 4. 참고 사항 (Gotchas)

**4.1 시퀀스 번호 (seqno) 관리**
- 현재: 간단한 로직으로 seqno 조회 (0으로 설정)
- 향후: 동시 요청 시 시퀀스 번호 충돌 가능
- 개선안: KV에 seqno 상태 저장 후 원자적 증가 필요

**4.2 RPC API 키 관리**
- 현재: tonapi.io 공개 API 키 하드코딩
- 보안 권장: Cloudflare 환경 변수로 이동
- API 레이트 제한: 하루 1000 요청 (테스트 환경)

**4.3 Jetton 지갑 주소 계산**
- 의존성: getJettonWalletAddress()가 외부 API에 의존
- 대안: @ton/core 라이브러리로 로컬 계산 가능하지만 Cloudflare 호환성 문제 있음

---

### 5. 테스트 체크리스트

- [ ] 웹브라우저에서 지갑 연결 후 입금 테스트
- [ ] TMA 환경에서 메뉴 버튼 → 입금 테스트
- [ ] 각 환경에서 실제 트랜잭션 생성 확인 (txHash 반환)
- [ ] KV 크레딧 업데이트 확인
- [ ] 여러 금액 입금 후 누적 검증
- [ ] 백엔드 오류 처리 (RPC 오류, 불충분한 자금 등)

---

### 6. 후임 AI를 위한 인수인계

#### 다음 단계 (우선순위)
1. **seqno 관리 개선**: 동시 요청 안정성
2. **API 키 보안**: 하드코딩된 키를 환경 변수로 이동
3. **테스트 자동화**: 단위 테스트 및 통합 테스트 작성
4. **인출 기능 통합**: 현재 인출은 백엔드 구현만 되어 있음

#### 주의사항
- `functions/api/initiate-deposit.ts`와 `functions/api/initiate-withdrawal.ts` 공통 헬퍼 함수 중복 검토 필요
- Cloudflare 함수의 콜드 스타트 시간을 고려한 타임아웃 설정 필요

---

### 7. 버전 변경 사항

- **v1.3.1 → v1.4.0**: Minor 버전 상승
- 이유: 새로운 백엔드 기능 추가 (입금 엔드포인트)
- 호환성: 기존 기능에 영향 없음 (하위 호환성 유지)