# 🚨 TON 지갑 키 교체 절차 (긴급)

> **현재 상황**: GAME_WALLET (`UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd`)의 개인키 `14ebd4df...765b`가 GitHub public에 노출됨.
> - 잔고: 0 TON, 0 CSPIN → **자금은 현재 안전**
> - 하지만 admin 권한 (CSPIN Jetton Master)이 노출된 키에 묶여 있음
> - **누군가 언제든 무제한 CSPIN 발행 가능** → 즉시 처리 필요

---

## 📋 작업 순서 (1~5)

### 1단계: 새 지갑 생성 (5분) 🆕

#### 옵션 A: Tonkeeper / MyTonWallet 앱 사용 (권장)

1. iOS/Android에서 **Tonkeeper** 설치 (https://tonkeeper.com)
2. "Create new wallet" 선택
3. **24단어 니모닉 백업** (오프라인 종이에 기록, 사진 X)
4. 새 지갑 주소 복사: `UQ...` 또는 `EQ...`

#### 옵션 B: CLI로 생성 (개발자용)

```bash
# Tonkeeper CLI 또는 tonweb 사용
npx tonweb-cli create-wallet
# 또는
npm install -g @ton-community/ton-keyring
ton-keyring generate
```

출력 예:
```
Address: UQ...새주소...
Mnemonic: word1 word2 word3 ... word24
Public Key: a1b2c3...
```

---

### 2단계: 새 지갑에 자금 이체 (이전 자산이 있다면) (5분)

만약 노출된 지갑에 잔고가 생긴다면 (혹시 0이 아니었다면) 즉시 이체:

1. **Tonkeeper에서 노출된 지갑(`moneybookcodex.ton`) 불러오기**
   - 니모닉 입력 (또는 개인키 import) — ⚠️ **이건 1회성으로만 사용 후 폐기**
2. **Send → 새 지갑 주소** → 전액 이체
3. **이체 후 노출 지갑에서 로그아웃** (앱에서 삭제)

> 💡 현재 잔고 0이라 이 단계는 생략 가능

---

### 3단계: Cloudflare Secrets 업데이트 (10분) 🔐

```bash
cd ~/projects/CandleSpinner

# 새 니모닉 (24단어)을 Cloudflare Secret에 등록
npx wrangler secret put GAME_WALLET_MNEMONIC
# 프롬프트에 24단어 입력 (공백으로 구분)

# 또는 개인키만 쓰면
npx wrangler secret put GAME_WALLET_PRIVATE_KEY
# 64자 hex 입력

# 새 지갑 주소 등록 (이건 wrangler.toml의 [vars] 섹션)
sed -i 's|VITE_GAME_WALLET_ADDRESS = "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"|VITE_GAME_WALLET_ADDRESS = "UQ새주소"|' wrangler.toml

# src/constants.ts도 마찬가지
# GAME_WALLET_ADDRESS = 'UQ새주소' 로 변경

git add -A
git commit -m "🔑 chore: rotate game wallet address to new secure key"
git push origin main
```

---

### 4단계: CSPIN Jetton Master admin 권한 이전 (20분) ⚠️ 가장 중요

CSPIN 토큰의 `admin_address`가 노출된 지갑(`EQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY`)에 묶여 있어요. **이게 가장 위험합니다.**

```bash
# 1) Jetton Master 디지스트 인터페이스 확인
#    https://tonviewer.com/EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV

# 2) "Change Admin" 메소드 호출
#    새 지갑 주소로 admin 이전
#    - TypeScript SDK 사용: ton-core의 JettonMaster contract
#    - 또는 getmethods의 change_admin 호출
```

#### TypeScript 예시 (가이드):

```typescript
import { TonClient, WalletContractV5R1, Address, toNano, fromNano } from '@ton/ton';
import { JettonMaster } from '@ton-community/assets-sdk';
import { mnemonicToPrivateKey } from '@ton/crypto';

const MNEMONIC = process.env.OLD_MNEMONIC!.split(' '); // 노출된 24단어
const NEW_ADMIN = Address.parse('UQ새주소'); // 새 admin 주소
const JETTON_MASTER = Address.parse('EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV');

async function rotateAdmin() {
  const keyPair = await mnemonicToPrivateKey(MNEMONIC);
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey, workchain: 0 });
  const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC' });
  const contract = client.open(wallet);
  
  const seqno = await contract.getSeqno();
  
  // change_admin opcode: 0x0ec77d39
  // body: 0x0ec77d39 + query_id(64) + new_admin(267 bits)
  await contract.sendTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [{
      to: JETTON_MASTER,
      value: toNano('0.05'),
      bounce: true,
      payload: beginCell()
        .storeUint(0x0ec77d39, 32)  // change_admin opcode
        .storeUint(0, 64)           // query_id
        .storeAddress(NEW_ADMIN)    // new admin
        .endCell(),
    }],
  });
  
  console.log('✅ admin 변경 트랜잭션 전송 완료');
  console.log('트랜잭션 해시:', await contract.getSeqno()); // 다음 seqno 반환 (실제 해시는 tonviewer 확인)
}

rotateAdmin().catch(console.error);
```

> ⚠️ **주의**: 트랜잭션 서명이 필요한 작업이라 Jack님이 실행해야 합니다.

#### 또는 getmethods 사용 (간단):

```bash
# ton-cli 또는 tonos-cli 사용
tonos-cli call --network mainnet \
  --addr EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV \
  --abi jetton-master.abi.json \
  change_admin '{"new_admin":"UQ새주소"}' \
  --sign OLD_MNEMONIC
```

---

### 5단계: 노출된 지갑 / 니모닉 완전 폐기 (5분) 🔴

```bash
# 1) 노출된 니모닉 24단어를 종이에 백업한 게 있다면 즉시 파쇄
# 2) Cloudflare Dashboard에서 노출된 GAME_WALLET_MNEMONIC secret 삭제
# 3) 노출된 개인키로 서명된 모든 Cloudflare 접근 토큰 rotate
# 4) 향후 노출 지갑으로의 어떤 트랜잭션도 거부됨
```

---

## ⏰ 일정 요약

| 단계 | 작업 | 소요 | 실행자 |
|:---:|---|:---:|---|
| 1 | 새 지갑 생성 | 5분 | Jack님 |
| 2 | 자금 이체 (잔고 0이라 불필요) | 0분 | - |
| 3 | Cloudflare Secrets 업데이트 + push | 10분 | Jack님 |
| 4 | **Jetton Master admin 권한 이전** | 20분 | Jack님 |
| 5 | 노출 지갑/니모닉 폐기 | 5분 | Jack님 |

---

## ❓ 도움 요청

제가 도와드릴 수 있는 것:

- ✅ 새 지갑 생성 스크립트 작성
- ✅ admin 변경 TypeScript 코드 작성 + 실행 가이드
- ✅ wrangler.toml / src/constants.ts 자동 패치
- ✅ 변경 후 GitHub push
- ✅ Antifrag 재진단

다음에 뭘 도와드릴까요?
