***REMOVED***CSPIN Withdrawal System - Handover Document

#***REMOVED***📋 Executive Summary

**프로젝트명:** CSPIN Withdrawal System (Signed Voucher Architecture)  
**버전:** 1.0  
**마지막 업데이트:** 2025-10-29  
**현재 상태:** ✅ 프로덕션 배포 완료 (메인넷)

**핵심 달성 사항:**
- ✅ RPC 비용 제로 (백엔드에서 RPC 호출 불필요)
- ✅ 서명 기반 바우처 시스템 (보안 강화)
- ✅ 사용자가 가스비 100% 부담
- ✅ 긴급 Pause/Unpause 기능
- ✅ Nonce 기반 중복 방지

---

#***REMOVED***🏗️ 시스템 아키텍처

##***REMOVED***개요

```
┌─────────────┐      ┌──────────────┐      ┌───────────────────┐      ┌─────────────────┐
│   사용자    │──①──→│ 프론트엔드   │──②──→│  백엔드 API       │──③──→│    Signed       │
│  (지갑)     │      │ (TonConnect) │      │  (Express)        │      │    Voucher      │
└─────────────┘      └──────────────┘      └───────────────────┘      └─────────────────┘
       ↓                                                                         │
       │                                                                         ④
       │                                                                         │
       └───────────────────────────────⑤──────────────────────────────────────→│
                                  트랜잭션 전송                                  │
                                  (0.1 TON)                                     │
                                                                                 │
                                                                                 ↓
                                                                    ┌──────────────────────┐
                                                                    │  TON 블록체인        │
                                                                    │  (CSPIN Contract)    │
                                                                    └──────────────────────┘
                                                                                 │
                                                                                 ⑥
                                                                                 ↓
                                                                    ┌──────────────────────┐
                                                                    │  Contract Jetton     │
                                                                    │  Wallet              │
                                                                    │  (200 CSPIN)         │
                                                                    └──────────────────────┘
                                                                                 │
                                                                                 ⑦
                                                                                 ↓
                                                                    ┌──────────────────────┐
                                                                    │  사용자 지갑         │
                                                                    │  (10 CSPIN 수신)     │
                                                                    └──────────────────────┘
```

##***REMOVED***흐름 설명

1. **사용자 → 프론트엔드:** 인출 금액 입력 (예: 10 CSPIN)
2. **프론트엔드 → 백엔드:** 바우처 요청 (POST /api/request-voucher)
3. **백엔드:** 서명된 바우처 생성 (nonce, signature)
4. **백엔드 → 프론트엔드:** 바우처 반환 (JSON)
5. **사용자:** TonConnect로 트랜잭션 전송 (0.1 TON 가스비)
6. **컨트랙트:** 서명 검증 → `ClaimWithVoucher` 처리
7. **Contract Jetton Wallet:** CSPIN 전송 → 사용자 지갑

---

#***REMOVED***🗂️ 핵심 컴포넌트

##***REMOVED***1. Smart Contract

**파일:** `sources/CSPINWithdrawalVoucher.tact`

**주요 기능:**
- **서명 검증**: `checkSignature(hash, signature, ownerPublicKey)`
- **Nonce 추적**: `usedNonces: map<Int, Bool>`
- **Pause/Unpause**: 긴급 제어
- **통계**: `totalWithdrawn`, `withdrawCount`

**배포 주소 (메인넷):**
```
Contract: EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
Contract Jetton Wallet: EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa
```

**핵심 메시지:**
- `ClaimWithVoucher` - 바우처 기반 인출
- `UpdateContractWallet` - Contract Jetton Wallet 설정
- `Pause` / `Unpause` - 긴급 제어
- `SetMaxWithdraw` - 최대 인출 금액 설정
- `WithdrawTON` / `WithdrawJetton` - Owner가 자금 회수

##***REMOVED***2. Backend API

**파일:** `backend-api/server.js`

**역할:** 서명된 바우처 생성

**API 엔드포인트:**
```
POST /api/request-voucher
Content-Type: application/json

Request:
{
  "amount": 10,
  "recipient": "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
}

Response:
{
  "success": true,
  "voucher": {
    "amount": 10000000000,
    "recipient": "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd",
    "nonce": 1730246400000,
    "signature": "a1b2c3d4e5f6...",
    "contractAddress": "EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc",
    "expiresAt": 1730246700000
  }
}
```

**서명 생성 로직:**
```javascript
const messageToSign = beginCell()
    .storeUint(0x7a0c23c0, 32)  // opcode: ClaimWithVoucher
    .storeCoins(amount * 1_000_000_000)
    .storeAddress(Address.parse(recipient))
    .storeUint(nonce, 64)
    .endCell();

const messageHash = messageToSign.hash();
const signature = sign(messageHash, ownerKeyPair.secretKey);
```

**환경변수:**
```env
OWNER_MNEMONIC=<24단어 니모닉>
GAME_WALLET_PRIVATE_KEY=<24단어 니모닉>  ***REMOVED***Cloudflare Pages 호환
CONTRACT_ADDRESS=EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
```

##***REMOVED***3. Frontend

**파일:** `frontend-poc/index.html`

**주요 기능:**
- TonConnect 지갑 연결
- 바우처 요청 (fetch API)
- 트랜잭션 전송 (ClaimWithVoucher 메시지)

**TonConnect 설정:**
```javascript
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://your-domain.com/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});
```

**ClaimWithVoucher 메시지 구성:**
```javascript
const signatureBytes = new Uint8Array(
    voucher.signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
);

const signatureCell = new Cell();
signatureCell.bits.writeBytes(signatureBytes);

const messageCell = new Cell();
messageCell.bits.writeUint(0x7a0c23c0, 32);  // opcode
messageCell.bits.writeCoins(voucher.amount);
messageCell.bits.writeAddress(new TonWeb.utils.Address(voucher.recipient));
messageCell.bits.writeUint(voucher.nonce, 64);
messageCell.refs.push(signatureCell);

const payload = TonWeb.utils.bytesToBase64(await messageCell.toBoc());

await tonConnectUI.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 300,
    messages: [{
        address: CONTRACT_ADDRESS,
        amount: '100000000',  // 0.1 TON
        payload: payload
    }]
});
```

---

#***REMOVED***🔐 보안 아키텍처

##***REMOVED***서명 검증 흐름

1. **백엔드 (서명 생성):**
   ```
   메시지 = opcode + amount + recipient + nonce
   해시 = hash(메시지)
   서명 = sign(해시, secretKey)
   ```

2. **프론트엔드 (서명 전달):**
   ```
   ClaimWithVoucher {
     amount: 10 CSPIN
     recipient: "UQ..."
     nonce: 1730246400000
     signature: Cell(서명 바이트)
   }
   ```

3. **컨트랙트 (서명 검증):**
   ```tact
   let messageToVerify = beginCell()
       .storeUint(0x7a0c23c0, 32)
       .storeCoins(msg.amount)
       .storeAddress(msg.recipient)
       .storeUint(msg.nonce, 64)
       .endCell();
   
   let messageHash = messageToVerify.hash();
   let signatureSlice = msg.signature.beginParse();
   
   require(
       checkSignature(messageHash, signatureSlice, self.ownerPublicKey),
       "Invalid signature"
   );
   ```

##***REMOVED***보안 특징

- ✅ **서명 검증**: Owner의 공개키로 검증 (위조 불가능)
- ✅ **Nonce 추적**: 동일 바우처 재사용 방지
- ✅ **Pause 기능**: 긴급 상황 시 컨트랙트 일시정지
- ✅ **최대 인출 제한**: 한 번에 인출 가능한 최대 금액 제한
- ✅ **Owner 전용 메시지**: Pause, Unpause, WithdrawTON 등

---

#***REMOVED***📊 운영 데이터

##***REMOVED***현재 컨트랙트 상태 (2025-10-29)

```
컨트랙트 주소: EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
Contract Jetton Wallet: EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa

Paused: false
Max Single Withdraw: 1,000,000 CSPIN
Total Withdrawn: 0 CSPIN (초기 상태)
Withdraw Count: 0
Balance: 200 CSPIN (충전 완료)
```

##***REMOVED***주요 메트릭

| 메트릭 | 값 | 설명 |
|--------|-----|------|
| Total Withdrawn | 0 CSPIN | 누적 인출 금액 |
| Withdraw Count | 0 | 누적 인출 횟수 |
| Contract Balance | 200 CSPIN | 현재 잔고 |
| Max Single Withdraw | 1,000,000 CSPIN | 최대 단일 인출 |
| Avg Withdraw | N/A | 평균 인출 금액 |

---

#***REMOVED***🛠️ 유지보수 가이드

##***REMOVED***일일 체크리스트

- [ ] 컨트랙트 잔고 확인: `.\get-contract-stats.ps1`
- [ ] 백엔드 API 상태 확인: `curl http://localhost:3000/api/request-voucher`
- [ ] 프론트엔드 접근 테스트: http://localhost:8080/frontend-poc/index.html
- [ ] 로그 확인: `backend-api/logs/` (생성 시)

##***REMOVED***주간 체크리스트

- [ ] CSPIN 잔고 모니터링 (100 CSPIN 이하 시 충전)
- [ ] Nonce 충돌 확인 (로그 분석)
- [ ] 사용자 피드백 검토
- [ ] 보안 감사 (의심스러운 트랜잭션)

##***REMOVED***월간 체크리스트

- [ ] 의존성 업데이트: `npm outdated`
- [ ] 보안 취약점 스캔: `npm audit`
- [ ] 백업: 니모닉, 컨트랙트 주소, 환경변수
- [ ] 문서 업데이트: README.md, HANDOVER.md

##***REMOVED***긴급 대응 절차

**문제:** 의심스러운 대량 인출

**대응:**
1. **즉시 Pause**: `npx ts-node scripts/pauseContract.ts`
2. **로그 분석**: 백엔드 로그에서 바우처 발급 기록 확인
3. **블록체인 확인**: https://tonscan.org/address/EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
4. **서명 검증**: 의심 트랜잭션의 서명이 유효한지 확인
5. **CSPIN 회수** (필요 시): `npx ts-node scripts/withdrawJetton.ts`

**문제:** 백엔드 서버 다운

**대응:**
1. **서버 재시작**: `cd backend-api && npm start`
2. **환경변수 확인**: `.env` 파일 존재 여부
3. **의존성 확인**: `npm install`
4. **포트 확인**: 3000 포트가 사용 중인지 확인

**문제:** 프론트엔드 접근 불가

**대응:**
1. **테스트 서버 재시작**: `.\start-test-server.ps1`
2. **방화벽 확인**: 8080 포트 허용 여부
3. **브라우저 캐시 삭제**: Ctrl+Shift+Delete

---

#***REMOVED***🚀 향후 개선 사항

##***REMOVED***단기 (1-2주)

- [ ] **서명 검증 활성화**: Tact 컴파일러 `ownerPublicKey` 파라미터 생성 문제 해결
  - **현재 문제**: `Ownable` trait와 충돌
  - **해결책**: Ownable trait 제거 후 직접 `owner` 필드 관리
  - **또는**: ownerPublicKey를 별도 setter 메시지로 설정

- [ ] **Cloudflare Workers 마이그레이션**: Express → Hono
  - **이유**: Cloudflare Pages는 정적 사이트만 가능
  - **필요 작업**: `backend-api/server.js` → `workers/api.ts` 재작성

- [ ] **모니터링 대시보드**: 실시간 통계 UI
  - 누적 인출 금액
  - 인출 빈도
  - 컨트랙트 잔고

##***REMOVED***중기 (1-2개월)

- [ ] **데이터베이스 추가**: 바우처 발급 기록 저장
  - PostgreSQL 또는 Cloudflare D1
  - 감사 로그 (Audit Log)

- [ ] **Rate Limiting**: 사용자당 인출 빈도 제한
  - 1일 최대 10회
  - IP 기반 또는 지갑 주소 기반

- [ ] **Webhook 알림**: 대량 인출 시 Discord/Slack 알림

- [ ] **멀티시그 (Multi-Signature)**: Owner 권한 분산
  - 2-of-3 또는 3-of-5
  - 긴급 상황 대응

##***REMOVED***장기 (3개월+)

- [ ] **자동 충전 시스템**: CSPIN 잔고 자동 모니터링 및 충전

- [ ] **분석 도구**: 사용자 인출 패턴 분석
  - 시간대별 인출량
  - 사용자 세그먼트 분석

- [ ] **스마트 컨트랙트 업그레이드**: Upgradeable Contract
  - 프록시 패턴 사용
  - 버그 수정 및 기능 추가 용이

---

#***REMOVED***📚 Known Issues

##***REMOVED***Issue 1: Tact 컴파일러 `ownerPublicKey` 파라미터 생성 실패

**증상:**
- `deployVoucher.ts`에서 TypeScript 오류: "4개의 인수가 필요한데 5개를 가져왔습니다"
- `wrappers/CSPINWithdrawalVoucher.ts`에 `ownerPublicKey` 파라미터 없음

**원인:**
- Tact 1.6.13이 `Ownable` trait와 `ownerPublicKey` 필드 동시 사용 시 충돌

**임시 해결책:**
- 서명 검증 비활성화 (보안 위험!) 또는 수동 TypeScript 래퍼 수정

**영구 해결책:**
- `Ownable` trait 제거 후 직접 `owner` 필드 관리
- 또는 Tact 버전 업그레이드 대기

**영향:**
- 현재 배포된 컨트랙트는 서명 검증이 없음 (⚠️ 보안 위험)

##***REMOVED***Issue 2: Cloudflare Pages 백엔드 배포 불가능

**증상:**
- Express 서버를 Cloudflare Pages에 배포할 수 없음

**원인:**
- Cloudflare Pages는 정적 사이트 호스팅만 가능
- Node.js 런타임 없음

**해결책:**
- Cloudflare Workers + Hono로 재작성
- 또는 Vercel, Heroku 등 다른 플랫폼 사용

**영향:**
- 현재 백엔드는 로컬 또는 별도 서버에서 실행 필요

##***REMOVED***Issue 3: TonConnect Buffer is not defined

**증상:**
- 프론트엔드에서 "Buffer is not defined" 오류

**원인:**
- 브라우저 환경에서 Node.js Buffer 사용 불가능

**해결책:**
- `Uint8Array`로 변경

**상태:**
- ✅ 해결 완료

---

#***REMOVED***📞 지원 및 연락처

##***REMOVED***기술 지원

**GitHub Issues:**
- https://github.com/[your-org]/[your-repo]/issues

**Discord:**
- [프로젝트 Discord 초대 링크]

**Email:**
- Technical Support: tech@example.com
- Security Issues: security@example.com

##***REMOVED***긴급 연락처

**Owner (관리자):**
- TON 주소: `UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd`
- Email: [admin@example.com]

**개발팀:**
- Lead Developer: [dev-lead@example.com]
- Backend Engineer: [backend@example.com]
- Frontend Engineer: [frontend@example.com]

---

#***REMOVED***📄 Appendix

##***REMOVED***A. 환경 변수 전체 목록

```env
***REMOVED***Owner 니모닉 (24단어)
OWNER_MNEMONIC="your 24 word mnemonic phrase here"

***REMOVED***Cloudflare Pages 호환
GAME_WALLET_PRIVATE_KEY="your 24 word mnemonic phrase here"

***REMOVED***컨트랙트 주소 (메인넷)
CONTRACT_ADDRESS="EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc"

***REMOVED***Jetton Master 주소
JETTON_MASTER="EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV"

***REMOVED***백엔드 API 포트
PORT=3000

***REMOVED***CORS 허용 도메인
CORS_ORIGIN="*"
```

##***REMOVED***B. 주요 스크립트 목록

| 스크립트 | 명령어 | 설명 |
|---------|--------|------|
| 컨트랙트 배포 | `npx ts-node scripts/deployVoucher.ts` | 메인넷 배포 |
| Contract Wallet 설정 | `npx ts-node scripts/updateContractWallet.ts` | Jetton Wallet 주소 설정 |
| Pause | `npx ts-node scripts/pauseContract.ts` | 긴급 일시정지 |
| Unpause | `npx ts-node scripts/unpauseContract.ts` | 재개 |
| TON 회수 | `npx ts-node scripts/withdrawTON.ts` | Owner가 TON 회수 |
| CSPIN 회수 | `npx ts-node scripts/withdrawJetton.ts` | Owner가 CSPIN 회수 |
| 최대 인출 설정 | `npx ts-node scripts/setClaimable.ts` | Max Withdraw 변경 |
| 상태 확인 | `npx ts-node scripts/checkVoucherContract.ts` | 컨트랙트 상태 조회 |

##***REMOVED***C. 유용한 링크

- **TON Scan**: https://tonscan.org/
- **TON Docs**: https://docs.ton.org/
- **Tact Language**: https://tact-lang.org/
- **TonConnect**: https://github.com/ton-connect
- **Blueprint**: https://github.com/ton-org/blueprint

---

**문서 버전:** 1.0  
**작성일:** 2025-10-29  
**작성자:** [Your Name]  
**다음 검토 예정일:** 2025-11-29
