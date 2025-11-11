# Cloudflare Workers Secrets 설정 가이드

## 필수 Secrets 설정

Cloudflare Workers에서 백엔드 API가 작동하려면 다음 Secrets를 설정해야 합니다:

### 방법 1: Wrangler CLI로 설정 (권장)

```powershell
# 1. TonCenter API Key
npx wrangler secret put TONCENTER_API_KEY
# 입력 프롬프트에서 API Key 입력

# 2. 게임 지갑 니모닉 (24단어)
npx wrangler secret put GAME_WALLET_MNEMONIC
# 입력 프롬프트에서 니모닉 입력

# 3. 게임 지갑 주소
npx wrangler secret put GAME_WALLET_ADDRESS
# 입력: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd

# 4. CSPIN Jetton Master 주소
npx wrangler secret put CSPIN_JETTON_MASTER
# 입력: EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV

# 5. CSPIN Jetton Wallet 주소
npx wrangler secret put CSPIN_JETTON_WALLET
# 입력: EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs
```

### 방법 2: Cloudflare Dashboard로 설정

1. https://dash.cloudflare.com 접속
2. **Workers & Pages** 클릭
3. **candlespinner-workers** 선택
4. **Settings** → **Variables and Secrets** 클릭
5. **Add** 버튼 클릭
6. 아래 변수들을 **Encrypt** 옵션으로 추가:

| Variable Name | Value | Type |
|--------------|-------|------|
| `TONCENTER_API_KEY` | (TonCenter API Key) | Secret |
| `GAME_WALLET_MNEMONIC` | (24단어 니모닉) | Secret |
| `GAME_WALLET_ADDRESS` | UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd | Secret |
| `CSPIN_JETTON_MASTER` | EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV | Secret |
| `CSPIN_JETTON_WALLET` | EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs | Secret |

7. **Save and Deploy** 클릭

---

## TonCenter API Key 발급 방법

입금 검증을 위해서는 TonCenter API Key가 **필수**입니다.

### 1. TonConsole 접속
https://tonconsole.com

### 2. 로그인
- GitHub 또는 TON Wallet으로 로그인

### 3. API Key 생성
1. **API Keys** 메뉴 클릭
2. **Create new API key** 클릭
3. **Name**: CandleSpinner
4. **Type**: Mainnet
5. **Create** 클릭

### 4. API Key 복사
생성된 API Key를 복사해서 위의 Secrets 설정에 사용

---

## 설정 확인 방법

### 1. Secrets 목록 확인
```powershell
npx wrangler secret list
```

### 2. Workers 로그 확인
```powershell
npx wrangler tail
```

입금 시도 시 로그에서 다음 메시지 확인:
- ✅ `[VerifyDeposit] 입금 검증 시작:` → 정상
- ❌ `[VerifyDeposit] TONCENTER_API_KEY is not set!` → API Key 미설정

---

## 임시 해결 방법 (개발용 Only!)

**⚠️ 경고: 프로덕션에서는 절대 사용하지 마세요!**

테스트를 위해 임시로 API 검증을 건너뛰려면:

```typescript
// src/index.ts의 handleVerifyDeposit 함수에서
// TonCenter API 검증 부분을 주석 처리
```

하지만 이 방법은:
- 보안 위험 (누구나 임의 금액 입금 가능)
- 실제 트랜잭션 검증 불가
- **반드시 실제 배포 전에 제거 필요**

---

## 다음 단계

1. ✅ TonCenter API Key 발급
2. ✅ wrangler secret으로 Secrets 설정
3. ✅ Workers 재배포: `npx wrangler deploy`
4. ✅ 입금 테스트
5. ✅ Workers 로그로 동작 확인: `npx wrangler tail`
