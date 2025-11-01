# RPC 없이 스마트 컨트랙트만으로 해결하는 방법

## 🎯 당신의 요구사항 정리

1. ✅ **RPC 비용 제로** (예산 제약)
2. ✅ **운영자 가스비 제로** (예산 제약)
3. ✅ **사용자가 가스비 100% 부담**
4. ✅ **백엔드 제어 유지** (보안)

---

## 🚨 중요한 사실

### **모든 블록체인 트랜잭션은 누군가가 가스비를 내야 합니다!**

```
옵션 1 (SetClaimable):
- 백엔드 → SetClaimable: 0.05 TON (운영자)
- 사용자 → Claim: 0.05 TON (사용자)
→ 운영자 부담 있음 ❌

옵션 2/3 (직접 전송):
- 백엔드 → 트랜잭션: 0.2 TON (운영자)
→ 운영자 부담 100% ❌

Signed Voucher:
- 백엔드 → 서명 생성: 0 TON (오프체인)
- 사용자 → ClaimWithVoucher: 0.05 TON (사용자)
→ 운영자 부담 0원! ✅
```

---

## 💡 최종 해결책: Signed Voucher 시스템

### **핵심 아이디어**

**백엔드는 서명만 생성 (블록체인 접촉 없음)**
**프론트엔드가 서명을 컨트랙트에 제출 (사용자 가스비)**

### **완벽한 흐름**

```
┌─────────────────────────────────────────────────────────────┐
│ 1단계: 사용자 인출 요청                                      │
└─────────────────────────────────────────────────────────────┘
프론트엔드: "인출" 버튼 클릭
   ↓
백엔드 API: POST /api/request-withdrawal
   {
     userId: "user123",
     amount: 1000
   }

┌─────────────────────────────────────────────────────────────┐
│ 2단계: 백엔드가 서명된 바우처 생성 (RPC 불필요!)            │
└─────────────────────────────────────────────────────────────┘
백엔드:
   1. DB에서 크레딧 확인 ✅
   2. 출금 한도 확인 ✅
   3. 바우처 생성:
      - amount: 1000 CSPIN
      - recipient: 사용자 주소
      - nonce: 현재 timestamp
      - signature: Owner 개인키로 서명
   
   ⚠️ 중요: RPC 호출 없음! 서명만 생성!
   
   Response:
   {
     voucher: {
       amount: "1000000000000",
       recipient: "EQC...",
       nonce: 1729812345,
       signature: "0x..."
     }
   }

┌─────────────────────────────────────────────────────────────┐
│ 3단계: 프론트엔드가 바우처를 컨트랙트에 제출                │
└─────────────────────────────────────────────────────────────┘
프론트엔드 (TonConnect):
   await tonConnectUI.sendTransaction({
     to: contractAddress,
     value: toNano('0.1'),
     body: ClaimWithVoucher {
       amount: voucher.amount,
       recipient: voucher.recipient,
       nonce: voucher.nonce,
       signature: voucher.signature
     }
   });
   
   ✅ 사용자가 가스비 부담!

┌─────────────────────────────────────────────────────────────┐
│ 4단계: 컨트랙트가 검증 및 전송                               │
└─────────────────────────────────────────────────────────────┘
스마트 컨트랙트 (CSPINWithdrawalVoucher):
   1. 긴급 정지 체크 ✅
   2. 금액 한도 체크 ✅
   3. Nonce 중복 체크 ✅
   4. Owner 서명 검증 ✅
   5. CSPIN 전송 → 사용자
   
   ✅ 운영자 가스비 0원!
```

---

## 🛠️ 구현 코드

### **1️⃣ 스마트 컨트랙트 (이미 생성됨)**

파일: `sources/CSPINWithdrawalVoucher.tact`

핵심 로직:
```tact
receive(msg: ClaimWithVoucher) {
    require(!self.paused);
    require(msg.amount <= self.maxSingleWithdraw);
    require(self.usedNonces.get(msg.nonce) == null); // 중복 방지
    
    // 서명 검증 (TODO: 구현 필요)
    // require(checkSignature(...), "Invalid signature");
    
    self.usedNonces.set(msg.nonce, true);
    
    // CSPIN 전송
    send(JettonTransfer to msg.recipient);
}
```

---

### **2️⃣ 백엔드 API (Node.js 예제)**

```typescript
import crypto from 'crypto';
import express from 'express';

const app = express();

// Owner 개인키 (환경 변수로 관리)
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

/**
 * 바우처 서명 생성
 * ⚠️ RPC 호출 없음! 순수 암호학적 서명
 */
function signVoucher(amount: bigint, recipient: string, nonce: number) {
    // 메시지 해시 생성
    const message = `${amount}:${recipient}:${nonce}`;
    const messageHash = crypto.createHash('sha256').update(message).digest();
    
    // Owner 개인키로 서명
    const signature = crypto.sign('sha256', messageHash, OWNER_PRIVATE_KEY);
    
    return signature.toString('hex');
}

/**
 * 인출 요청 API
 * RPC 사용 없음!
 */
app.post('/api/request-withdrawal', async (req, res) => {
    const { userId, amount } = req.body;
    
    try {
        // 1. 크레딧 확인 (DB 조회만)
        const credits = await db.query(
            'SELECT credits FROM users WHERE id = ?',
            [userId]
        );
        
        if (credits < amount) {
            return res.status(400).json({ error: 'Insufficient credits' });
        }
        
        // 2. 출금 한도 확인
        const MAX_WITHDRAW = 1000000; // 1,000,000 CSPIN
        if (amount > MAX_WITHDRAW) {
            return res.status(400).json({ error: 'Amount exceeds limit' });
        }
        
        // 3. 사용자 TON 주소 가져오기
        const userAddress = await db.query(
            'SELECT ton_address FROM users WHERE id = ?',
            [userId]
        );
        
        // 4. Nonce 생성 (timestamp)
        const nonce = Date.now();
        
        // 5. 바우처 서명 생성 (RPC 불필요!)
        const amountNano = BigInt(amount) * 1000000000n; // CSPIN to nano
        const signature = signVoucher(amountNano, userAddress, nonce);
        
        // 6. 바우처 반환
        const voucher = {
            amount: amountNano.toString(),
            recipient: userAddress,
            nonce: nonce,
            signature: signature
        };
        
        // 7. 크레딧 차감 (나중에 컨트랙트 성공 시)
        // await db.query('UPDATE users SET credits = credits - ? WHERE id = ?', [amount, userId]);
        
        res.json({
            success: true,
            voucher: voucher
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

**💡 핵심: RPC 호출이 단 한 줄도 없습니다!**

---

### **3️⃣ 프론트엔드 (TonConnect)**

```typescript
import { useTonConnectUI } from '@tonconnect/ui-react';
import { beginCell, toNano } from '@ton/core';

function WithdrawButton() {
    const [tonConnectUI] = useTonConnectUI();
    
    async function handleWithdraw() {
        // 1. 백엔드에서 바우처 받기 (RPC 없음!)
        const response = await fetch('/api/request-withdrawal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                amount: 1000 // 1000 CSPIN
            })
        });
        
        const { voucher } = await response.json();
        
        // 2. 바우처를 컨트랙트에 제출 (사용자 가스비)
        const body = beginCell()
            .storeUint(0x12345678, 32) // op: ClaimWithVoucher
            .storeCoins(BigInt(voucher.amount))
            .storeAddress(Address.parse(voucher.recipient))
            .storeUint(voucher.nonce, 64)
            .storeRef(beginCell().storeBuffer(Buffer.from(voucher.signature, 'hex')).endCell())
            .endCell();
        
        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{
                address: 'EQA...', // 컨트랙트 주소
                amount: toNano('0.1').toString(),
                payload: body.toBoc().toString('base64')
            }]
        });
        
        alert('인출 요청 완료! 잠시 후 CSPIN이 지갑에 도착합니다.');
    }
    
    return <button onClick={handleWithdraw}>인출하기</button>;
}
```

---

## 📊 비용 비교

### **옵션 1 (SetClaimable)**
```
백엔드 → SetClaimable: 0.05 TON × 1000회/월 = 50 TON/월 ($250)
사용자 → Claim: 0.05 TON (사용자 부담)
```

### **Signed Voucher (추천!)**
```
백엔드 → 서명 생성: 0 TON (무료!) ✅
사용자 → ClaimWithVoucher: 0.05 TON (사용자 부담)

운영자 비용: 0원/월 🎉
```

---

## ✅ 최종 권장: Signed Voucher

### **장점:**
1. ✅ **RPC 사용 0** (서명만 생성)
2. ✅ **운영자 가스비 0원**
3. ✅ **사용자 1클릭** (바우처 자동 제출)
4. ✅ **백엔드 제어 유지** (서명 검증)
5. ✅ **보안 우수** (Nonce로 중복 방지)

### **단점:**
- 서명 검증 로직 구현 필요 (Tact에서 지원 제한)

---

## 🚀 다음 단계

1. ✅ **컨트랙트 작성**: `CSPINWithdrawalVoucher.tact` (완료)
2. 📝 **백엔드 API 작성**: `/api/request-withdrawal`
3. 🎨 **프론트엔드 통합**: TonConnect
4. 🧪 **테스트**: 소액 인출

**원하시면 즉시 구현해드립니다!**

---

## ⚠️ 한계점: Tact 서명 검증

**현재 문제:**
Tact에서 Ed25519 서명 검증이 제한적입니다.

**임시 해결책 (프로토타입):**
```tact
receive(msg: ClaimWithVoucher) {
    // 서명 검증 대신 Owner만 호출 가능
    require(sender() == self.owner, "Unauthorized");
    
    // 나머지 로직...
}
```

**완전한 해결책:**
1. FunC로 서명 검증 구현
2. 또는 옵션 1 (SetClaimable) 사용

---

## 💡 최종 추천 (현실적)

**당신의 예산 제약을 고려하면:**

### **방법 A: SetClaimable + 최소 RPC**
- 백엔드가 SetClaimable만 호출 (0.05 TON)
- 사용자가 Claim 호출 (0.05 TON)
- RPC: 읽기만 (무료 또는 저렴)
- **운영자 부담: 월 50 TON ($250) 정도**

### **방법 B: Signed Voucher (서명 검증 없이)**
- 백엔드가 서명 생성 (0 TON)
- 사용자가 바우처 제출 (0.05 TON)
- **운영자 부담: 0원**
- **보안 위험: 서명 검증 없음**

**권장: 방법 A (SetClaimable)**
- 보안 우수
- 비용 예측 가능
- 이미 구현됨 (CSPINWithdrawal.tact)

**원하시는 방법을 선택해주세요!**
