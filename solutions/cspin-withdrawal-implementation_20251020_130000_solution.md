# 해결 기록: CSPIN 인출 기능 실제 트랜잭션 구현

> **원본 지시서:** `instructions/cspin-withdrawal-implementation_20251020_130000.md`
> **관련 커밋:** e5459fa
> **최종 버전:** v1.1.0

---

### 1. 해결 방법 요약

CSPIN 인출 기능을 실제 트랜잭션 전송으로 구현했습니다.

- `/api/initiate-withdrawal`에 게임 월렛 프라이빗 키를 사용한 실제 CSPIN 토큰 전송 로직 추가
- 인출 테스트 버튼에 `withdrawalAmount` 파라미터 추가하여 undefined 문제 해결
- `wrangler.toml`에 `GAME_WALLET_PRIVATE_KEY` 환경 변수 설정
- `[산출물3]` 인출 API 의사코드 실제 트랜잭션 로직으로 업데이트
- 버전을 1.1.0으로 업데이트하고 커밋&푸시

---

### 2. 핵심 코드 변경 사항

#### functions/api/initiate-withdrawal.ts
```typescript
// 실제 블록체인 전송 로직
const gameWalletPrivateKey = env.GAME_WALLET_PRIVATE_KEY;
const keyPair = keyPairFromSecretKey(Buffer.from(gameWalletPrivateKey, 'hex'));
const gameWallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });

// CSPIN transfer 메시지 생성
const jettonTransferBody = beginCell()
  .storeUint(0x0f8a7ea5, 32) // op: transfer
  .storeUint(0, 64) // query_id
  .storeCoins(toNano(withdrawalAmount.toString())) // amount
  .storeAddress(Address.parse(walletAddress)) // destination
  // ... 나머지 필드

// 트랜잭션 생성 및 전송
const transfer = gameWallet.createTransfer({
  seqno: 0,
  secretKey: keyPair.secretKey,
  messages: [transferMessage]
});

const boc = transfer.toBoc();
const bocBase64 = boc.toString('base64');
await sendBocViaTonAPI(bocBase64);
```

#### src/components/Game.tsx (테스트 버튼)
```typescript
body: JSON.stringify({ 
  walletAddress: connectedWallet.account.address, 
  withdrawalAmount: userCredit 
})
```

#### wrangler.toml
```toml
[vars]
GAME_WALLET_PRIVATE_KEY = "여기에_게임_월렛_프라이빗_키_입력"
```

#### docs/ssot/[산출물3]핵심-로직-의사코드-(MVP-확장-v2.0).md
- A.6. API 엔드포인트: `/api/initiate-withdrawal` 실제 트랜잭션 로직으로 업데이트

---

### 3. 참고 사항

- 게임 월렛 프라이빗 키는 Cloudflare Pages 환경 변수로 안전하게 저장 필요
- seqno는 현재 0으로 고정되어 있지만, 실제 운영 시 KV에 저장해서 관리해야 함
- 트랜잭션 수수료는 0.05 TON으로 설정 (조정 가능)
- PoC의 입금 로직을 참고하여 인출 로직 구현

---

### 4. 후임 AI를 위한 인수인계

- 실제 테스트 시 게임 월렛에 충분한 TON과 CSPIN이 있어야 함
- 프라이빗 키는 절대 코드에 하드코딩하지 말고 환경 변수 사용
- 트랜잭션 실패 시 재시도 로직이나 사용자 알림 추가 고려