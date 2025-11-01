# 💡 CSPIN 충전 및 회수 가이드

## 질문 답변

### 1. 인출하려면 EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa 주소로 CSPIN을 전송해야 하나요?

**답변: Yes! ✅**

`EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa`는 **컨트랙트의 Jetton Wallet**입니다. 

사용자가 인출하려면 이 주소에 CSPIN이 **반드시** 충전되어 있어야 합니다.

---

### 2. 왜 그래야 하나요?

#### TON Jetton 시스템의 특징

TON에서 Jetton(토큰)은 **분산 저장 방식**을 사용합니다:

```
[Jetton Master]  ← CSPIN 메인 컨트랙트
    ↓
    ├─ [User A의 Jetton Wallet]     ← User A의 CSPIN 잔액
    ├─ [User B의 Jetton Wallet]     ← User B의 CSPIN 잔액
    ├─ [컨트랙트의 Jetton Wallet]   ← 🎯 우리 컨트랙트의 CSPIN 잔액
    └─ [Owner의 Jetton Wallet]      ← Owner의 CSPIN 잔액
```

**이더리움과의 차이**:
- 이더리움: 중앙 컨트랙트가 모든 잔액 관리 (`balances[address] = amount`)
- TON: 각 소유자마다 개별 Jetton Wallet 컨트랙트 존재

#### 컨트랙트 코드 분석

```tact
receive(msg: ClaimWithVoucher) {
    // ... 검증 로직 ...
    
    // 7. CSPIN 전송
    send(SendParameters{
        to: self.contractJettonWallet,  // ← 컨트랙트의 Jetton Wallet에게 명령
        body: JettonTransfer{
            amount: msg.amount,           // ← 인출할 CSPIN 양
            destination: msg.recipient    // ← 사용자 주소
        }
    });
}
```

#### 작동 흐름

```
1. 사용자: "100 CSPIN 인출 요청"
   ↓
2. 백엔드: 서명된 바우처 발급
   ↓
3. 사용자: 바우처를 컨트랙트에 제출 (가스비 부담)
   ↓
4. 컨트랙트: 자신의 Jetton Wallet에게 명령
   "내가 가진 100 CSPIN을 사용자에게 보내"
   ↓
5. 컨트랙트 Jetton Wallet: 실제 전송 실행
   ↓
6. 사용자 Jetton Wallet: 100 CSPIN 도착 ✅
```

**만약 컨트랙트 Jetton Wallet에 CSPIN이 없다면?**
- ❌ 전송 실패
- 💸 사용자는 가스비만 소모
- 😞 토큰은 받지 못함

---

### 3. 컨트랙트에 있는 CSPIN을 Owner가 회수할 수 있나요?

**답변: Yes! ✅ 방금 추가했습니다!**

#### 새로 추가된 기능: WithdrawJetton

```tact
message WithdrawJetton {
    amount: Int as coins;          // 회수할 CSPIN 양
    recipient: Address;            // 받을 주소 (보통 Owner)
}

receive(msg: WithdrawJetton) {
    self.requireOwner();  // Owner만 실행 가능
    
    // 컨트랙트 Jetton Wallet에게 명령: CSPIN을 recipient에게 전송
    send(SendParameters{
        to: self.contractJettonWallet,
        body: JettonTransfer{
            amount: msg.amount,
            destination: msg.recipient
        }
    });
}
```

---

## 🚀 실제 사용 방법

### STEP 1: 컨트랙트에 CSPIN 충전

**Tonkeeper 앱 사용**:

1. CSPIN 토큰 선택
2. "Send" 버튼 클릭
3. **받는 주소**: `EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa`
4. **수량**: 100,000 ~ 1,000,000 CSPIN (권장)
5. 전송 확인

**PowerShell 스크립트 (고급)**:
```powershell
# Owner Jetton Wallet → Contract Jetton Wallet
# 스크립트는 아직 없음, Tonkeeper 사용 권장
```

**확인**:
```
https://tonscan.org/address/EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa
```
→ "Jettons" 탭에서 CSPIN 잔액 확인

---

### STEP 2: CSPIN 회수 (Owner 전용)

#### PowerShell에서 실행:

```powershell
npx ts-node scripts/withdrawJetton.ts
```

#### 입력 정보:

1. **배포된 컨트랙트 주소**: 
   ```
   EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
   ```

2. **회수할 CSPIN 수량** (예: 50000):
   ```
   50000
   ```

3. **받을 주소** (보통 Owner):
   ```
   UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
   ```

4. **확인**: `yes`

#### 실행 결과:

```
📋 WithdrawJetton 정보:
   - 컨트랙트: EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
   - 회수할 CSPIN: 50000
   - 받을 주소: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd

계속하시겠습니까? (yes/no): yes
🔄 WithdrawJetton 전송...
✅ 메시지 전송 완료!
⏳ 블록체인 처리 대기 중 (10초)...

✅ WithdrawJetton 완료!

🔗 Tonscan으로 확인:
   https://tonscan.org/address/EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
```

---

## 📊 CSPIN 흐름도

### 충전 (Owner → Contract):

```
Owner Jetton Wallet                Contract Jetton Wallet
EQAjtIvLT_y9GNB...                 EQBsRMhs7iA5Tazp...
     💰 1,000,000 CSPIN
          ↓ (Send 버튼)
     💰 0 CSPIN                     💰 1,000,000 CSPIN ✅
```

### 사용자 인출:

```
Contract Jetton Wallet              User Jetton Wallet
💰 1,000,000 CSPIN                  💰 0 CSPIN
          ↓ (바우처 제출)
💰 999,900 CSPIN                    💰 100 CSPIN ✅
```

### 회수 (Contract → Owner):

```
Contract Jetton Wallet              Owner Jetton Wallet
💰 999,900 CSPIN                    💰 0 CSPIN
          ↓ (WithdrawJetton)
💰 0 CSPIN                          💰 999,900 CSPIN ✅
```

---

## ⚠️ 주의사항

### 1. 충전 전 확인
- ✅ 컨트랙트 주소가 정확한지 확인
- ✅ **Contract Jetton Wallet** 주소로 전송 (컨트랙트 주소 아님!)
- ❌ 실수로 메인 컨트랙트 주소로 보내면 영구 손실

### 2. 충전 수량 권장
- **최소**: 10,000 CSPIN (소액 테스트용)
- **권장**: 100,000 ~ 1,000,000 CSPIN (운영용)
- **이유**: 매번 충전하면 가스비 낭비

### 3. 회수 시 주의
- Owner만 실행 가능 (requireOwner 체크)
- 가스비: 약 0.15 TON
- 즉시 반영 (블록체인 처리 시간 제외)

### 4. 긴급 상황
- 컨트랙트를 Pause 하더라도 CSPIN은 그대로 있음
- WithdrawJetton으로 언제든 회수 가능
- 컨트랙트 폐기 전 반드시 CSPIN 회수 필요

---

## 🎯 실전 시나리오

### 시나리오 1: 초기 운영 준비

```
1. 컨트랙트 배포 ✅
2. UpdateContractWallet 설정 ✅
3. CSPIN 충전 (100,000 CSPIN) ← 지금 여기!
4. Unpause 실행
5. 사용자 인출 테스트 (10 CSPIN)
6. 본격 운영 시작
```

### 시나리오 2: 정기 충전

```
1. 컨트랙트 Jetton Wallet 잔액 확인
   → 10,000 CSPIN 남음
2. 추가 충전 (50,000 CSPIN)
3. 잔액 확인: 60,000 CSPIN ✅
```

### 시나리오 3: 긴급 회수

```
1. 보안 이슈 발견 🚨
2. Pause 실행 (모든 인출 중단)
3. WithdrawJetton 실행 (전액 회수)
4. 문제 해결 후 재충전
5. Unpause 실행
```

---

## 📋 체크리스트

### 테스트 전 확인:

- [ ] 컨트랙트 배포 완료 (EQAOLUHmaA1J_...)
- [ ] UpdateContractWallet 설정 완료
- [ ] Contract Jetton Wallet 주소 확인 (EQBsRMhs7iA5T...)
- [ ] **CSPIN 충전 완료** ← 다음 단계!
- [ ] 컨트랙트 Unpause 상태 확인
- [ ] 백엔드 서버 실행 중
- [ ] 프론트엔드 서버 실행 중

### CSPIN 충전 후:

- [ ] Tonscan에서 Contract Jetton Wallet 잔액 확인
- [ ] emergency-pause.html에서 Unpause 실행
- [ ] index.html에서 소액 인출 테스트 (10 CSPIN)
- [ ] Tonscan에서 트랜잭션 확인
- [ ] 사용자 Jetton Wallet에 CSPIN 도착 확인

---

## 💡 추가 정보

### 주소 요약:

| 이름 | 주소 | 용도 |
|------|------|------|
| 컨트랙트 | `EQAOLUHmaA1J_...rNIc` | 인출 로직 실행 |
| Contract Jetton Wallet | `EQBsRMhs7iA5T...6gGa` | **CSPIN 충전 주소** |
| Owner | `UQBFPDdSlPgq...8Mtd` | 관리자 |
| Owner Jetton Wallet | `EQAjtIvLT_y9G...7wOs` | Owner의 CSPIN 잔액 |
| Jetton Master | `EQBZ6nHfmT2w...3uvV` | CSPIN 메인 컨트랙트 |

### 스크립트 요약:

```powershell
# Jetton Wallet 주소 계산
npx ts-node scripts/getJettonWalletAddress.ts

# CSPIN 회수 (Owner → 컨트랙트)
npx ts-node scripts/withdrawJetton.ts

# 컨트랙트 상태 확인
npx ts-node scripts/checkVoucherContract.ts

# Unpause 실행
npx ts-node scripts/unpauseContract.ts
```

---

## 🎉 요약

1. **충전 필수**: 컨트랙트가 CSPIN을 전송하려면 먼저 충전 필요
2. **회수 가능**: Owner는 WithdrawJetton으로 언제든 회수 가능
3. **다음 단계**: Tonkeeper로 CSPIN 충전 → Unpause → 테스트!
