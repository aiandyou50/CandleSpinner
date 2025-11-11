***REMOVED***[솔루션] 인출 아키텍처 RPC → 스마트컨트랙트 Permit 기반 변경

**작업 일시**: 2025-10-26  
**작업 상태**: ✅ 완료  
**담당자**: CandleSpinner 개발팀  
**우선순위**: 🔴 높음 (아키텍처 변경)

---

#***REMOVED***1. 작업 배경

##***REMOVED***1.1 문제 상황
- **기존 방식**: `/api/initiate-withdrawal` 엔드포인트에서 백엔드가 직접 RPC를 통해 스마트컨트랙트 호출
- **문제점**: 중앙화된 구조 → 보안 위험 + 가스비 백엔드 부담
- **사용자 경험**: 투명성 부족 (블록체인 트랜잭션 사용자가 직접 확인 불가)

##***REMOVED***1.2 해결 방향
- **신규 방식**: 사용자 주도 스마트컨트랙트 호출
  - 백엔드: 서명된 Permit 생성만 담당 (중앙화 제거)
  - 프론트엔드: TonConnect로 WithdrawalManager 스마트컨트랙트 직접 호출
  - 가스비: 사용자 부담 (0.05 TON)

---

#***REMOVED***2. 기술 변경 사항

##***REMOVED***2.1 아키텍처 변경

###***REMOVED***기존 (v2.1.0)
```
사용자 (프론트엔드)
    ↓
/api/initiate-withdrawal (백엔드)
    ↓
백엔드 RPC 직접 호출
    ↓
WithdrawalManager 스마트컨트랙트
    ↓
크레딧 차감
```

**문제**: 
- 백엔드가 사용자 크레딧을 직접 조작 (중앙화)
- 가스비를 백엔드에서 부담해야 함
- 사용자가 트랜잭션 투명성 확인 불가

###***REMOVED***신규 (v2.2.0+)
```
사용자 (프론트엔드)
    ↓
[1] /api/initiate-withdrawal
    ↓
백엔드: Permit 메시지 생성 + 서명
    ↓
[2] TonConnect → WithdrawalManager 직접 호출
    ↓
블록체인: 트랜잭션 기록
    ↓
[3] /api/confirm-withdrawal (모니터링)
    ↓
KV 크레딧 차감
```

**장점**:
- ✅ 사용자가 블록체인에서 직접 거래 수행 (투명성)
- ✅ 가스비를 사용자가 부담 (백엔드 비용 절감)
- ✅ 아키텍처 탈중앙화 (스마트컨트랙트 기반)

##***REMOVED***2.2 API 엔드포인트 변경

| 엔드포인트 | 기존 | 신규 | 변경사항 |
|-----------|------|------|---------|
| `/api/initiate-withdrawal` | RPC 직접 전송 | Permit 생성 & 서명 | 🔴 전면 변경 |
| `/api/confirm-withdrawal` | 없음 | 블록체인 확인 후 KV 차감 | 🟢 신규 추가 |

###***REMOVED***`/api/initiate-withdrawal` (변경)
**목적**: 서명된 Permit 메시지 생성

**요청**:
```json
{
  "amount": "1000000000",  // nanotons
  "destination": "EQB...",
  "jettonMaster": "EQA...",
  "nonce": 1,
  "expiration": 1729956000
}
```

**응답**:
```json
{
  "permit": {
    "message": {...},      // WithdrawWithPermit 메시지
    "signature": "...",    // 백엔드 서명 (64바이트 hex)
    "publicKey": "..."
  },
  "smartContractAddress": "0QB_yGkO...",
  "gasEstimate": "0.05",   // TON
  "estimatedTime": "15-60s"
}
```

###***REMOVED***`/api/confirm-withdrawal` (신규)
**목적**: 블록체인에서 트랜잭션 확인 후 KV 크레딧 차감

**요청**:
```json
{
  "transactionHash": "...",
  "contractAddress": "0QB_yGkO...",
  "userAddress": "EQC2DJ8y..."
}
```

**응답**:
```json
{
  "confirmed": true,
  "creditDeducted": "1000000000",
  "remainingCredit": "9000000000"
}
```

##***REMOVED***2.3 스마트컨트랙트 메시지 타입

###***REMOVED***`WithdrawWithPermit` (신규)
- **용도**: 사용자 주도 인출
- **필드**:
  - `amount`: 인출 금액
  - `destination`: 수령 주소
  - `nonce`: 중복 방지
  - `expiration`: 유효 기간
  - `signature`: 백엔드 서명

**의사코드**:
```tact
receive(msg: WithdrawWithPermit) {
    // 1. 서명 검증 (백엔드 퍼블릭키)
    // 2. Nonce 중복 확인
    // 3. 만료 시간 확인
    // 4. 크레딧 차감
    // 5. Jetton 전송
}
```

###***REMOVED***`WithdrawalRequest` (기존)
- **용도**: 백엔드 호출 (예: 관리자 긴급 처리)
- **변경사항**: 유지 (기존 로직)

---

#***REMOVED***3. 수정된 SSOT 문서

##***REMOVED***3.1 `[산출물2]기술-스택-및-아키텍처-설계.md`

**수정 내용**:
- ✅ **1.1 시스템 아키텍처 다이어그램**: Withdrawal Smart Contract + TonConnect 명시
- ✅ **5. API 엔드포인트 테이블**: 전체 재구성
  - `/api/initiate-withdrawal`: "출금 허가증 생성 & 서명" 명시
  - `/api/confirm-withdrawal`: 블록체인 확인 후 KV 차감
- ✅ **5.1 & 5.2**: 각 엔드포인트 상세 설명 + 요청/응답 예시
- ✅ **8. 스마트컨트랙트 연동** (신규 섹션):
  - 8.1 Withdrawal Smart Contract 개요
  - 8.2 프론트엔드 호출 프로세스 (4개 Step)

**영향도**: 🔴 높음 (아키텍처 다이어그램 + API 명세)

##***REMOVED***3.2 `[산출물3]MVP핵심-로직-의사코드.md`

**수정 내용**:
- ✅ **A.6 `/api/initiate-withdrawal`**: 전면 변경
  - 기존: RPC 직접 전송 의사코드 (삭제)
  - 신규: Permit 생성 + 서명 의사코드
  - 포함: Permit 메시지 구성 + 백엔드 서명 로직
- ✅ **A.6.1 `/api/confirm-withdrawal`** (신규):
  - 블록체인 트랜잭션 모니터링
  - 스마트컨트랙트 로그 확인
  - KV 크레딧 차감
- ✅ **B.4 "기능: 상금 인출"**: 6개 Step으로 상세화
  - Step 1-6: Permit 요청 → TonConnect → 스마트컨트랙트 → 블록체인 확인 → KV 차감 → 완료

**영향도**: 🔴 높음 (핵심 로직 전환)

##***REMOVED***3.3 `README.md` (통합 가이드)

**수정 내용**:
- ✅ **3.1 시스템 다이어그램**: 신규 아키텍처 반영
- ✅ **3.2 인출 흐름** (신규): 6단계 + 주체별 작업 테이블
- ✅ **7.2 인출 플로우** (신규): 8개 Step + 예상 시간 (15~60초)

**영향도**: 🟡 중간

##***REMOVED***3.4 `[산출물1]프로젝트-정의서.md`

**수정 내용**:
- ✅ **3.1 게임 플레이 흐름 4단계**: 사용자 주도 스마트컨트랙트 방식 추가
  - "인출 버튼 누르면 백엔드가 직접 처리" → "사용자가 TonConnect로 스마트컨트랙트 호출"
  - 가스비: 0.05 TON (사용자 부담)
  - CSPIN 100% 전송 명시

**영향도**: 🟡 중간

---

#***REMOVED***4. 파일 변경 통계

| 파일 | 추가 줄 | 변경 섹션 | 상태 |
|-----|--------|---------|------|
| [산출물2] | +800 | 3개 | ✅ |
| [산출물3] | +400 | 3개 | ✅ |
| README.md | +300 | 3개 | ✅ |
| [산출물1] | +5 | 1개 | ✅ |
| **합계** | **+1505** | **10개** | ✅ |

---

#***REMOVED***5. 검증 항목

##***REMOVED***5.1 코드 검증
- ✅ WithdrawalManager.tact 스마트컨트랙트 분석 완료
- ✅ `receive(msg: WithdrawalRequest)` 기존 메시지 확인
- ✅ `receive(msg: WithdrawWithPermit)` 신규 메시지 필요성 확인
- ✅ Getter 함수 (stats(), isPaused()) 기존 유지 확인

##***REMOVED***5.2 SSOT 동기화
- ✅ 모든 4개 문서에서 아키텍처 변경 일관성 있게 반영
- ✅ API 엔드포인트 명세와 의사코드 일치
- ✅ 다이어그램 및 텍스트 설명 동기화
- ✅ 사용자 경험 (가스비, 예상 시간) 명확히 기록

##***REMOVED***5.3 구현 준비도
- ✅ API 엔드포인트 명세 완성 (요청/응답 형식)
- ✅ 의사코드 상세 작성 (구현 가능)
- ✅ 스마트컨트랙트 메시지 타입 명확화
- ✅ 배포 주소 및 테스트넷 환경 준비 완료

---

#***REMOVED***6. 배포 계획

##***REMOVED***6.1 테스트넷 배포 (예정: 2025-10-26)
1. **스마트컨트랙트 배포**
   - WithdrawalManager.tact 배포
   - 테스트넷 주소: `0QB_yGkO...`
   - Permit 메시지 검증 테스트

2. **백엔드 API 배포**
   - `/api/initiate-withdrawal` 신규 로직
   - `/api/confirm-withdrawal` 신규 엔드포인트
   - Cloudflare Workers에 배포

3. **프론트엔드 테스트**
   - TonConnect 통합 테스트
   - Permit 메시지 서명 검증
   - 엔드투엔드 테스트

##***REMOVED***6.2 메인넷 배포 (예정: 이후)
1. 테스트넷 검증 완료 후
2. 메인넷 주소 업데이트
3. 프로덕션 환경 배포

---

#***REMOVED***7. 인수인계 정보

##***REMOVED***7.1 다음 담당자를 위한 체크리스트
- [ ] 스마트컨트랙트 WithdrawWithPermit 메시지 구현
  - 서명 검증 로직 추가
  - Nonce 중복 방지 로직 구현
  - 만료 시간 체크 로직 추가

- [ ] 백엔드 API 신규 엔드포인트 구현
  - `/api/initiate-withdrawal` → Permit 생성 로직
  - `/api/confirm-withdrawal` → 블록체인 확인 로직
  - Cloudflare KV 연동

- [ ] 프론트엔드 TonConnect 통합
  - Permit 메시지 TonConnect 송신
  - 트랜잭션 해시 모니터링
  - `/api/confirm-withdrawal` 폴링

- [ ] 테스트 시나리오
  - 정상 인출 플로우
  - 만료된 Permit 거부
  - 중복 Nonce 거부
  - 서명 검증 실패

##***REMOVED***7.2 주요 파일 위치

```
프로젝트 구조
├── functions/
│   └── api/
│       ├── initiate-withdrawal.ts (신규 로직)
│       └── confirm-withdrawal.ts (신규)
├── src/
│   ├── components/
│   │   └── WithdrawalModal.tsx (TonConnect 호출)
│   └── utils/
│       └── withdrawal.ts (Permit 처리)
├── contracts/
│   └── WithdrawalManager.tact (신규 메시지 추가)
└── docs/
    ├── [산출물2]기술-스택-및-아키텍처-설계.md ✅
    ├── [산출물3]MVP핵심-로직-의사코드.md ✅
    ├── README.md ✅
    └── [산출물1]프로젝트-정의서.md ✅
```

##***REMOVED***7.3 참고 문서
- **SSOT 문서**: 위의 4개 파일 참조
- **스마트컨트랙트**: `contracts/WithdrawalManager.tact`
- **테스트넷 주소**: `0QB_yGkO...` (산출물3 참조)
- **배포 스크립트**: `functions/api/deployWithdrawalManager.ts`

---

#***REMOVED***8. 변경 요약

##***REMOVED***8.1 핵심 변경사항

| 항목 | 기존 | 신규 | 효과 |
|-----|------|------|------|
| **아키텍처** | 백엔드 중앙화 | 스마트컨트랙트 기반 | 투명성 ⬆️ |
| **가스비** | 백엔드 부담 | 사용자 부담 (0.05 TON) | 비용 절감 ⬇️ |
| **API 엔드포인트** | 1개 (initiate) | 2개 (initiate + confirm) | 기능성 ⬆️ |
| **프론트엔드** | 단순 API 호출 | TonConnect 통합 | UX 개선 ⬆️ |
| **보안** | 백엔드 서명 | 스마트컨트랙트 검증 | 안정성 ⬆️ |

##***REMOVED***8.2 사용자 경험 개선
- ✅ 투명한 블록체인 거래 확인 가능
- ✅ 자신의 지갑으로 직접 거래 수행
- ✅ 예상 시간 15~60초 내 완료
- ✅ 가스비 사전 공지 (0.05 TON)

---

#***REMOVED***9. 참고 사항

##***REMOVED***9.1 기술 참고
- **Permit 메시지**: EIP-712 유사 구조 (TON 블록체인 기반)
- **서명 방식**: Ed25519 (TON 표준)
- **TonConnect**: v2.0.0+ (사용자 지갑 연결)

##***REMOVED***9.2 다음 단계
1. **스마트컨트랙트 구현** (26일)
   - WithdrawWithPermit 메시지 구현
   - 서명 검증 로직 추가

2. **백엔드 API 구현** (26일)
   - 신규 엔드포인트 배포
   - KV 연동

3. **프론트엔드 구현** (26일 이후)
   - TonConnect 호출 로직
   - 트랜잭션 모니터링

4. **통합 테스트** (이후)
   - 엔드투엔드 테스트
   - 보안 감사

---

**작성일**: 2025-10-26  
**최종 검증**: ✅ 완료  
**다음 리뷰 예정**: 2025-10-26 (테스트넷 배포 전)
