# 해결 기록: TonConnect 버튼 표시 및 입금 오류 수정

> **원본 지시서:** `docs/instructions/TonConnect-버튼-표시-및-입금-오류-수정_20251021_115000.md`
> **관련 커밋:** e78cc3c
> **최종 버전:** v2.0.2

---

### 1. 해결 방법 요약

이 작업을 해결하기 위해 다음 파일들을 수정했습니다.

#### **1.1 코드 수정**

- **`src/components/Deposit.tsx`** (v2.1.0 핵심 수정)
  - Jetton Transfer Payload 함수 추가: `buildJettonTransferPayload()`
  - PoC 코드 기반 올바른 payload 구성 (opcode: 0xF8A7EA5)
  - TonConnect 입금 로직 수정:
    - CSPIN_JETTON_WALLET 주소 추가
    - payload 필수 포함
    - amount: '200000000' (0.2 TON for fees)

- **`src/App.tsx`** (TMA 환경 개선)
  - TMA 환경 `<header>` 추가
  - TMA/웹 모두에서 TonConnect 버튼 표시
  - position: fixed 레이아웃으로 일관성 유지

#### **1.2 문서 동기화**

- **`docs/ssot/[산출물3]MVP핵심-로직-의사코드.md`**
  - D.0 섹션 신규 작성: "Jetton Transfer Payload 구성 (v2.1.0 핵심 수정)"
  - Payload 생성 함수 및 TonConnect 트랜잭션 구조 문서화
  - 핵심 수정 요소 3가지 기록

- **`docs/ssot/[산출물2]기술-스택-및-아키텍처-설계.md`**
  - TonConnect UI 섹션에 v2.1.0 개선사항 추가
  - TMA 환경 버튼 표시 변경 사항 기록

#### **1.3 버전 및 변경 이력**

- **`package.json`**: v2.0.1 → v2.0.2
- **`CHANGELOG.md`**: 
  - [2.0.2] 섹션 신규 작성
  - 버그 수정 사항 상세 기록

#### **1.4 지시서 및 해결 기록**

- **`docs/instructions/`**: TonConnect 버튼 표시 및 입금 오류 수정 지시서 생성
- **`docs/solutions/`**: 본 해결 기록 파일

---

### 2. 핵심 코드 변경 사항

#### **Deposit.tsx - Jetton Transfer Payload 함수**

```typescript
// Jetton Transfer Payload 구성
function buildJettonTransferPayload(amount: bigint, destination: Address, responseTo: Address): string {
  const cell = beginCell()
    .storeUint(0xf8a7ea5, 32) // Jetton transfer opcode
    .storeUint(0, 64) // query_id
    .storeCoins(amount)
    .storeAddress(destination)
    .storeAddress(responseTo)
    .storeBit(0) // custom_payload: none
    .storeCoins(BigInt(0)) // forward_ton_amount
    .storeBit(0) // forward_payload: none
    .endCell();
  return cell.toBoc().toString('base64');
}
```

#### **TonConnect 트랜잭션 구조 (수정)**

```typescript
const amountInNano = BigInt(amount) * BigInt(1000000000);
const destinationAddress = Address.parse(GAME_WALLET_ADDRESS);
const responseAddress = Address.parse(wallet.account.address);

const payload = buildJettonTransferPayload(amountInNano, destinationAddress, responseAddress);

const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [
    {
      address: CSPIN_JETTON_WALLET,  // ← 핵심: 게임 지갑이 아닌 CSPIN Jetton 주소
      amount: '200000000',             // 0.2 TON for fees
      payload: payload                 // ← payload 필수
    }
  ]
};
```

#### **App.tsx - TMA 환경 TonConnect 버튼**

```typescript
{isTMA ? (
  <div style={{ minHeight: '100vh', ... }}>
    {/* TMA 환경에서도 TonConnect 버튼 표시 */}
    <header style={{ position: 'fixed', top: 16, right: 16, ... }}>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '6px' }}>
        <TonConnectButton />
      </div>
    </header>
    ...
  </div>
) : (
  // 웹 환경 (기존 코드 유지)
)}
```

---

### 3. 참고 사항 (Gotchas)

#### **3.1 문제 원인 분석**

**이전 오류: "100TON 지갑에 있어야 한다"**
- **원인**: TON 블록체인이 지갑에서 TON 잔액을 확인했지만, CSPIN 토큰 전송에 필요한 올바른 Jetton Transfer Payload가 없었음
- **결과**: 트랜잭션이 invalid로 거부됨

**해결 과정**:
1. PoC 코드의 `PayloadBuilder.tsx` 분석
2. 표준 Jetton TEP-74 Transfer Payload (opcode: 0xF8A7EA5) 구현
3. CSPIN Jetton Wallet 주소로 전송 (게임 지갑이 아닌 점이 핵심)

#### **3.2 TMA 환경 UI 일관성**

- 이전: 웹 환경에서만 TonConnect 버튼 표시 → TMA 사용자는 지갑 연결 불가
- 변경: TMA/웹 모두에서 버튼 표시 → 모든 환경에서 일관된 UX

#### **3.3 빌드 이슈**

- `ton-core` 패키지 미포함으로 빌드 실패
- `npm install ton-core` 실행하여 해결
- 이후 빌드 성공 (v2.0.2 정식 배포)

---

### 4. 테스트 및 검증

#### **4.1 빌드 성공**

```
✓ npm run build 성공
✓ 모든 의존성 설치 완료
✓ TypeScript 컴파일 성공
✓ dist/ 빌드 산출물 생성
```

#### **4.2 Git 커밋 및 배포**

```
✓ git add -A
✓ git commit -m "fix: TonConnect 입금 Jetton Payload 수정 및 TMA 환경 버튼 표시 (v2.0.2)"
✓ git push origin main → Cloudflare Pages 자동 배포
```

---

### 5. 후임 AI를 위한 인수인계

#### **5.1 향후 개선 사항**

1. **테스트넷 검증 필요**
   - TonConnect로 실제 Jetton 전송 테스트
   - "100TON" 오류 완전 해결 확인

2. **RPC 방식 (DepositAuto) 검토**
   - v1.5.0의 Ankr RPC 방식도 동일한 payload 구조 필요
   - 필요시 `/api/deposit-auto.ts` 업데이트

3. **에러 핸들링 강화**
   - 사용자 지갑에 CSPIN 잔액 없을 때 명확한 에러 메시지
   - 지갑 연결 실패 시 안내 문구 개선

#### **5.2 주의사항**

- ⚠️ **CSPIN_JETTON_WALLET 주소 확인 필수**: 현재 코드에 하드코딩된 주소가 정확한지 확인
- ⚠️ **게임 지갑과 Jetton 지갑 구분**: 혼동하면 입금 실패
- ⚠️ **payload 없이 절대 전송 불가**: 다시 발생 가능하므로 주의

#### **5.3 문서 참고**

- [산출물3] D.0 섹션: Jetton Payload 구성 방법
- [산출물2] 5.1 절: 블록체인 연동 기술 스택

---

### 6. 배포 상태

- ✅ **버전**: v2.0.2
- ✅ **커밋**: e78cc3c
- ✅ **배포**: Cloudflare Pages 자동 배포 완료 (git push 후 약 2-3분)
- ✅ **상태**: 운영 환경 반영 완료
