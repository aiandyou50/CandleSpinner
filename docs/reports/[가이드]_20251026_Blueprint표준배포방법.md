# 🚀 Blueprint 표준 배포 방법 (공식 가이드)

**작성일:** 2025-10-26 21:30 UTC  
**스마트컨트랙트 배포:** Blueprint 표준 프로세스

---

## 📋 Blueprint 배포란?

Blueprint는 TON 공식 스마트컨트랙트 개발 프레임워크입니다.

```
구조:
project/
├── contracts/
│   ├── wrappers/         ← 스마트컨트랙트 래퍼
│   ├── tests/            ← 테스트
│   ├── build/            ← 컴파일된 코드
│   └── src/              ← Tact 소스 코드
├── scripts/
│   ├── deploy.ts         ← 배포 스크립트
│   └── deployTestnet.ts  ← 테스트넷 배포
└── wrangler.toml         ← 배포 설정
```

---

## 🎯 표준 배포 프로세스

### **Step 1: 배포용 Wrapper 클래스 생성**

**파일:** `contracts/wrappers/WithdrawalManager.ts`

```typescript
import { Contract, ContractProvider, Sender, Cell, SendMode, Address } from '@ton/core';

export class WithdrawalManager implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
        return new WithdrawalManager(address);
    }

    static createFromConfig(
        config: { owner: Address; cspinJetton: Address },
        code: Cell,
        workchain = 0
    ) {
        const data = Cell.EMPTY;
        const init = { code, data };
        const address = contractAddress(workchain, init);
        return new WithdrawalManager(address, init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, opts: { amount: bigint }) {
        await provider.internal(via, {
            value: opts.amount,
            init: this.init,
            body: Cell.EMPTY,
        });
    }
}
```

### **Step 2: 배포 스크립트 작성**

**파일:** `contracts/scripts/deployTestnet.ts`

```typescript
import { compile, NetworkProvider } from '@ton/blueprint';

export const run = async (provider: NetworkProvider) => {
    // 1. 스마트컨트랙트 컴파일
    const ui = provider.ui();
    const address = provider.sender().address;

    if (!address) {
        ui.write('❌ 지갑 주소를 얻을 수 없습니다');
        return;
    }

    ui.write(`📍 배포자: ${address}`);

    // 2. WithdrawalManager 컴파일
    const code = await compile('WithdrawalManager');

    // 3. 초기 데이터 설정
    const ownerAddress = address; // 또는 다른 주소
    const cspinJetton = Address.parse('EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV');

    const withdrawalManager = WithdrawalManager.createFromConfig(
        {
            owner: ownerAddress,
            cspinJetton: cspinJetton,
        },
        code
    );

    // 4. 배포 실행
    ui.write(`🚀 배포 중... (${withdrawalManager.address})`);

    await provider.deploy(withdrawalManager, {
        value: toNano('0.05'),
        init: withdrawalManager.init,
    });

    ui.write('✅ 배포 완료!');
};
```

---

## ✅ 실제 배포 명령어

### **테스트넷 배포**

```bash
# 방법 1: 프라이빗 키 직접 사용 (CLI)
npx blueprint deploy --privkey "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6..." --testnet

# 방법 2: 상호형식 (지갑 선택)
npx blueprint run deployTestnet

# 방법 3: npm script
npm run deploy:testnet
```

### **메인넷 배포**

```bash
# 프라이빗 키 사용
npx blueprint deploy --privkey "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6..." --mainnet

# 상호형식
npx blueprint run deploy
```

---

## 🔧 현재 프로젝트 설정

### **기존 구조 확인**

```bash
# 1. 배포 스크립트 확인
ls -la contracts/scripts/

# 2. 스마트컨트랙트 소스 확인
ls -la contracts/src/

# 3. 컴파일된 코드 확인
ls -la contracts/build/
```

---

## 📊 프라이빗 키를 이용한 CLI 배포 (가장 빠름)

### **Step 1: 프라이빗 키 준비**

```
14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b
```

### **Step 2: 스마트컨트랙트 빌드**

```bash
cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts
npm run build
```

**예상 출력:**
```
✅ Successfully compiled WithdrawalManager
  └─ build/build.tact_WithdrawalManager.code.boc (769 bytes)
```

### **Step 3: Blueprint 배포**

```bash
# 테스트넷 배포 (프라이빗 키 사용)
npx blueprint deploy \
  --privkey "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b" \
  --testnet
```

### **Step 4: 배포 확인**

Blueprint가 자동으로:
1. ✅ 키 검증
2. ✅ 초기 데이터 생성
3. ✅ 트랜잭션 서명
4. ✅ RPC에 전송
5. ✅ Tonscan 링크 제공

**예상 출력:**
```
🚀 Blueprint Deployment

✅ Wallet: UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
✅ Network: Testnet
✅ Contract: WithdrawalManager

📋 Deployment Details:
  Code: build.tact_WithdrawalManager.code.boc
  Init: With owner and CSPIN Jetton address
  Amount: 0.05 TON

✅ Transaction Sent!
📡 Tonscan: https://testnet.tonscan.org/tx/[TX_HASH]
```

---

## 🎯 배포 후 단계

### **1. Tonscan에서 확인**

```
URL: https://testnet.tonscan.org/address/[계약_주소]

확인 항목:
- Transaction Status: ✅ Success
- Contract Type: SmartContract
- Initial Data: Owner + CSPIN Jetton
```

### **2. 배포된 주소 기록**

```
contracts/deployment.json 생성:
{
  "network": "testnet",
  "contractAddress": "0QC2DJ8...",
  "deployedAt": "2025-10-26T21:30:00Z",
  "transactionHash": "..."
}
```

### **3. 백엔드에서 사용**

```typescript
// backend/config/contracts.ts
export const WithdrawalManager = {
  testnet: '0QC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC',
  mainnet: 'UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC',
};
```

---

## 🔐 보안 주의사항

### **프라이빗 키 사용 시**

```
⚠️  절대하지 말 것:
  1. GitHub/공개 저장소에 커밋
  2. 커밋 히스토리에 노출
  3. 스크린샷으로 공유
  4. 로그 파일에 기록

✅ 안전한 방법:
  1. 환경 변수 (.env.local - .gitignore)
  2. CI/CD 시크릿
  3. 배포 직전에만 터미널에 입력
```

### **.env.local (안전)**

```bash
# 절대 커밋하지 않음 (.gitignore 필수)
DEPLOYER_PRIVATE_KEY=14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6...
```

### **CLI 사용 (일시적)**

```bash
# 터미널에 직접 입력 (로그 남지 않음)
npx blueprint deploy --privkey "[키]" --testnet
```

---

## 📋 체크리스트

배포 전:

- [ ] 프라이빗 키: 검증됨 ✅
- [ ] 네트워크 선택: testnet/mainnet 결정
- [ ] 스마트컨트랙트: npm run build 완료
- [ ] 초기 데이터: owner, cspinJetton 확정
- [ ] 배포 비용: 0.1 TON 이상 보유
- [ ] RPC: 연결 가능 확인

배포 후:

- [ ] Tonscan에서 Success 확인
- [ ] 거래 해시 기록
- [ ] 계약 주소 기록
- [ ] deployment.json 생성
- [ ] 환경 변수 업데이트
- [ ] 백엔드에 주소 전달

---

## 🚀 최종 명령어 (지금 실행)

```powershell
# 1. 디렉토리 이동
cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts

# 2. 빌드 확인
npm run build

# 3. 배포 (프라이빗 키 사용)
npx blueprint deploy `
  --privkey "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b" `
  --testnet
```

---

## 💡 Blueprint 공식 문서

```
https://ton.org/docs/#/deploy
https://github.com/ton-org/blueprint
```

---

**✅ 이것이 공식 Blueprint 표준 배포 방법입니다.**

*가이드: 2025-10-26 21:30 UTC*
