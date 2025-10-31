# Cloudflare Workers 배포 가이드

## 1️⃣ Hono API 로컬 테스트

```bash
cd workers
npm install
npm run dev
```

브라우저에서 `http://localhost:8787` 접속

## 2️⃣ Cloudflare Workers 배포

### Wrangler 로그인
```bash
npx wrangler login
```

### Owner 니모닉 설정 (Secret)
```bash
npx wrangler secret put OWNER_MNEMONIC
```
입력: `word1 word2 word3 ... word24` (24단어)

### 배포
```bash
npm run deploy
```

배포된 URL: `https://cspin-voucher-api.<your-subdomain>.workers.dev`

## 3️⃣ 환경 변수 설정

Cloudflare Workers Dashboard에서 설정:
- `OWNER_MNEMONIC`: Owner 지갑 니모닉 (Secret)
- `CONTRACT_ADDRESS`: CSPINWithdrawalVoucher 주소
- `MAX_SINGLE_WITHDRAW`: 최대 단일 인출 (기본: 1000000)

## 4️⃣ API 테스트

```bash
curl https://cspin-voucher-api.<your-subdomain>.workers.dev/health
```

```bash
curl -X POST https://cspin-voucher-api.<your-subdomain>.workers.dev/api/request-voucher \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "amount": 100,
    "recipientAddress": "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
  }'
```

## 5️⃣ 모니터링

Cloudflare Workers Dashboard:
- Real-time Logs
- Request Statistics
- Error Tracking

## 🔐 보안 주의사항

- ⚠️ `OWNER_MNEMONIC`은 반드시 Secret으로 설정 (wrangler secret put)
- ⚠️ Git에 커밋하지 마세요
- ⚠️ Dashboard에서만 확인 가능

## 💰 비용

- Free Plan: 100,000 requests/day
- Paid Plan: $5/month (10M requests)
- **서명 생성만 하므로 RPC 비용 $0**
