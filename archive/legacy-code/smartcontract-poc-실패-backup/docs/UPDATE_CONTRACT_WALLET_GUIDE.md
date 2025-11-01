***REMOVED***📘 update-contract-wallet.ps1 완벽 가이드

#***REMOVED***🎯 목적

**컨트랙트에게 "자신의 Jetton Wallet 주소"를 알려주는 작업**

---

#***REMOVED***❓ 왜 필요한가?

##***REMOVED***문제 상황

```
배포 시점:
- 컨트랙트: "나는 EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc야"
- 컨트랙트: "그런데 내 Jetton Wallet 주소는 모르겠어..." 😢

이유:
- Jetton Wallet은 Jetton Master가 동적으로 생성함
- 컨트랙트는 배포 시점에 자신의 Jetton Wallet 주소를 알 수 없음
```

##***REMOVED***해결 방법

```
1. Jetton Master에게 물어봄:
   "EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc의 Jetton Wallet 주소가 뭐야?"
   
2. Jetton Master 답변:
   "EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa야!"
   
3. 컨트랙트에게 알려줌:
   UpdateContractWallet 메시지 전송
   → 컨트랙트: "아! 내 Jetton Wallet은 EQBsRMhs...구나!" 😊
```

---

#***REMOVED***📋 단계별 실행

##***REMOVED*****1단계: 컨트랙트 Jetton Wallet 계산** ✅ 완료

```powershell
npx ts-node scripts/getJettonWalletAddress.ts
```

**결과:**
```
컨트랙트의 CSPIN Jetton Wallet:
EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa
```

---

##***REMOVED*****2단계: 컨트랙트에 알려주기** ← 지금 할 작업!

```powershell
.\update-contract-wallet.ps1
```

**입력할 내용:**
```
컨트랙트 주소: EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
Jetton Wallet 주소: EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa
니모닉: [Owner 지갑 24단어]
```

**실행되는 일:**
```
1. Owner 지갑에서 UpdateContractWallet 메시지 전송
2. 가스비: 0.05 TON (Owner 부담)
3. 컨트랙트 상태 변경:
   contractJettonWallet = EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa
```

---

#***REMOVED***🔍 왜 이 작업이 필요한가?

##***REMOVED***ClaimWithVoucher 메시지 처리 시:

```tact
receive(msg: ClaimWithVoucher) {
    // 1. 검증
    require(!self.paused);
    require(msg.amount <= self.maxSingleWithdraw);
    require(self.usedNonces.get(msg.nonce) == null);
    
    // 2. CSPIN 전송 - 이때 필요!
    send(SendParameters{
        to: self.contractJettonWallet, // ← 이 주소를 알아야 함!
        body: JettonTransfer{
            amount: msg.amount,
            destination: msg.recipient
        }
    });
}
```

**❌ contractJettonWallet이 비어있으면?**
→ 전송 실패! 컨트랙트가 작동하지 않음!

**✅ contractJettonWallet이 설정되면?**
→ 정상 작동! 사용자에게 CSPIN 전송 가능!

---

#***REMOVED***📊 전체 흐름 요약

```
┌─────────────────────────────────────────────────┐
│ 1. 컨트랙트 배포                                 │
└─────────────────────────────────────────────────┘
   컨트랙트: EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
   contractJettonWallet: null ❌

┌─────────────────────────────────────────────────┐
│ 2. Jetton Wallet 주소 계산 (getJettonWalletAddress) │
└─────────────────────────────────────────────────┘
   Jetton Master에게 질문
   → 답변: EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa

┌─────────────────────────────────────────────────┐
│ 3. UpdateContractWallet 실행 (update-contract-wallet) │
└─────────────────────────────────────────────────┘
   Owner → 컨트랙트: "네 Jetton Wallet은 EQBsRMhs...야"
   컨트랙트: contractJettonWallet = EQBsRMhs... ✅

┌─────────────────────────────────────────────────┐
│ 4. CSPIN 충전                                    │
└─────────────────────────────────────────────────┘
   Owner Jetton Wallet → 컨트랙트 Jetton Wallet
   1,000,000 CSPIN 전송

┌─────────────────────────────────────────────────┐
│ 5. 사용자 인출 (ClaimWithVoucher)                │
└─────────────────────────────────────────────────┘
   컨트랙트 Jetton Wallet → 사용자 Jetton Wallet
   자동 전송 가능! ✅
```

---

#***REMOVED***🎯 요약

##***REMOVED***update-contract-wallet.ps1 = "주소 알려주기"

**Before:**
```
컨트랙트: "내 Jetton Wallet이 어딘지 몰라서 전송 못해..." 😢
```

**After:**
```
컨트랙트: "내 Jetton Wallet은 EQBsRMhs...구나! 이제 전송할 수 있어!" 😊
```

---

#***REMOVED***🚀 다음 단계

**지금 실행:**
```powershell
.\update-contract-wallet.ps1
```

**입력:**
- 컨트랙트: `EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc`
- Jetton Wallet: `EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa`
- 니모닉: Owner 지갑 24단어

**결과:**
- 가스비: 0.05 TON
- 상태: contractJettonWallet 설정 완료
- 다음: CSPIN 충전 가능
