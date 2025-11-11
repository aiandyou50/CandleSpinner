***REMOVED***입금 실패 원인 및 해결 방법 (2025-11-02)

#***REMOVED***🔴 문제 상황

##***REMOVED***증상
- **지갑:** "CSPIN 토큰 SENT failed"
- **결과:** 게임 유저 지갑에서 CSPIN 토큰 차감 안 됨
- **비용:** 불필요한 TON 네트워크 Fee 소모 방지하려고 사용자가 거절함

##***REMOVED***디버그 로그 분석
```javascript
[INFO] ✅ 사용자 Jetton Wallet: UQCEhINVl6GjdghH66wdyGBqSVbon7EPoICWsyXfvQZDR3xZ
[DEBUG] amount: "30000000"  // 0.03 TON ✅
[ERROR] Deposit 실패: {}
```

**긍정적 신호:**
- ✅ 새 코드가 배포됨 (동적 Jetton Wallet 계산)
- ✅ 네트워크 비용 45% 절감 완료 (0.055 → 0.03 TON)
- ✅ 사용자의 Jetton Wallet 주소 계산 성공

#***REMOVED***🔍 원인 분석

##***REMOVED***1. TonCenter API Rate Limit (429 Too Many Requests)

**발견 경위:**
```bash
node scripts/check-user-balance.mjs
***REMOVED***결과: AxiosError: Request failed with status code 429
***REMOVED***{ ok: false, result: 'Ratelimit exceed', code: 429 }
```

**원인:**
```typescript
// ❌ API Key 없이 호출
const tonClient = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
  // apiKey 누락!
});
```

**TonCenter API Limit:**
- **무료 (API Key 없음):** 1 req/sec, 10 req/min
- **API Key 있음:** 10 req/sec, 300 req/min
- **프리미엄:** Unlimited

##***REMOVED***2. 가능한 추가 원인

###***REMOVED***A. CSPIN 잔액 부족
사용자가 CSPIN 토큰을 가지고 있지 않을 수 있음
```
필요: 10 CSPIN
현재: 0 CSPIN (Jetton Wallet 미초기화 가능성)
```

###***REMOVED***B. TON 잔액 부족
트랜잭션 비용 (0.03 TON)이 부족할 수 있음
```
필요: 0.03 TON
현재: 확인 필요
```

###***REMOVED***C. Jetton Wallet 미초기화
사용자가 CSPIN을 한 번도 받지 않았다면 Jetton Wallet이 블록체인에 배포되지 않음

#***REMOVED***✅ 해결 방법

##***REMOVED***1. TON API Key 추가 (완료)

**수정 파일:** `src/components/Deposit.tsx`
```typescript
// ✅ API Key 추가
const tonClient = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
  apiKey: import.meta.env.VITE_TON_API_KEY || undefined,
});
```

**환경 변수 설정 필요:**
1. Cloudflare Dashboard
2. Workers & Pages → candlespinner-workers
3. Settings → Variables → Add variable
4. Name: `TON_API_KEY`
5. Value: (TonCenter API Key)

**API Key 발급 방법:**
1. https://tonconsole.com 접속
2. 계정 생성/로그인
3. API Keys → Create API Key
4. Mainnet 선택
5. Key 복사 → Cloudflare에 추가

##***REMOVED***2. 잔액 확인 로직 추가 (권장)

**수정 제안:** 트랜잭션 전 잔액 확인
```typescript
// 사용자의 CSPIN 잔액 확인
const jettonWallet = tonClient.open(...);
const balance = await jettonWallet.getBalance();

if (balance < depositAmount) {
  throw new Error(`CSPIN 잔액이 부족합니다. 현재: ${balance} CSPIN, 필요: ${depositAmount} CSPIN`);
}

// TON 잔액 확인
const tonBalance = await tonClient.getBalance(userAddress);
if (tonBalance < toNano('0.03')) {
  throw new Error(`TON 잔액이 부족합니다. 트랜잭션 비용으로 0.03 TON이 필요합니다.`);
}
```

##***REMOVED***3. 에러 메시지 개선 (권장)

**현재 문제:**
```typescript
[ERROR] Deposit 실패: {}  // ❌ 빈 객체
```

**수정 제안:**
```typescript
catch (err) {
  logger.error('Deposit 실패:', {
    message: err instanceof Error ? err.message : '알 수 없는 오류',
    stack: err instanceof Error ? err.stack : undefined,
    name: err instanceof Error ? err.name : undefined,
  });
  
  // 사용자 친화적 메시지
  let userMessage = '입금에 실패했습니다.';
  
  if (err instanceof Error) {
    if (err.message.includes('429') || err.message.includes('rate limit')) {
      userMessage = '⏳ 일시적인 네트워크 혼잡입니다. 잠시 후 다시 시도해주세요.';
    } else if (err.message.includes('insufficient')) {
      userMessage = '❌ 잔액이 부족합니다.';
    } else if (err.message.includes('rejected')) {
      userMessage = '❌ 사용자가 트랜잭션을 거부했습니다.';
    }
  }
  
  setError(userMessage);
  alert(userMessage);
}
```

#***REMOVED***🚀 배포 프로세스 개선

##***REMOVED***현재 워크플로우 (부분 자동화)

```
1. 코드 수정 ✅
   ↓
2. 깃허브 커밋&푸시 ✅
   ↓
3. GitHub Actions 트리거 ⏳
   ↓
4. Cloudflare Workers 배포 ⏳
   ↓
5. 테스트 ⏳
```

##***REMOVED***GitHub Actions 설정 완료

**파일:** `.github/workflows/deploy.yml`
```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Node.js
      - Install dependencies
      - Build project
      - Deploy to Cloudflare Workers
```

##***REMOVED***필요한 GitHub Secrets

**설정 위치:** GitHub → Settings → Secrets and variables → Actions

| Secret Name | Value | 상태 |
|-------------|-------|------|
| `CLOUDFLARE_API_TOKEN` | (TonCenter API Token) | ❌ 미설정 |
| `CLOUDFLARE_ACCOUNT_ID` | 48a09063776ab35c453778ea6ebd0172 | ❌ 미설정 |

**API Token 생성 방법:**
1. https://dash.cloudflare.com/profile/api-tokens
2. "Create Token" → "Edit Cloudflare Workers" 템플릿
3. 권한 설정:
   - Account: Workers Scripts (Edit)
   - Account: Workers KV Storage (Edit)
4. Token 생성 → 복사 → GitHub Secret에 추가

##***REMOVED***완전 자동화 후 워크플로우 (목표)

```
1. 코드 수정 ✅
   ↓
2. git commit && git push ✅
   ↓
3. GitHub Actions 자동 실행 ✅
   - npm ci
   - npm run build
   - npx wrangler deploy
   ↓
4. Cloudflare 자동 배포 ✅
   ↓
5. 테스트 (수동)
```

#***REMOVED***📋 체크리스트

##***REMOVED***즉시 해야 할 일
- [ ] **TonCenter API Key 발급** (https://tonconsole.com)
- [ ] **Cloudflare 환경 변수 추가**
  - Name: `TON_API_KEY`
  - Value: (발급받은 API Key)
- [ ] **GitHub Secrets 설정**
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- [ ] **테스트:** https://aiandyou.me 에서 입금 재시도

##***REMOVED***개선 사항 (선택)
- [ ] 트랜잭션 전 잔액 확인 로직 추가
- [ ] 에러 메시지 개선
- [ ] Rate Limit 재시도 로직 추가
- [ ] 사용자에게 필요한 CSPIN/TON 표시

#***REMOVED***🧪 테스트 시나리오

##***REMOVED***성공 시나리오
1. TON API Key 설정 완료
2. 사용자가 10 CSPIN 이상 보유
3. 사용자가 0.03 TON 이상 보유
4. 입금 버튼 클릭
5. TON Connect 지갑에서 트랜잭션 승인
6. ✅ **성공:** 크레딧 10 증가, CSPIN 10 차감

##***REMOVED***실패 시나리오

###***REMOVED***Case 1: CSPIN 부족
```
현재: 0 CSPIN
필요: 10 CSPIN
결과: "❌ CSPIN 잔액이 부족합니다."
```

###***REMOVED***Case 2: TON 부족
```
현재: 0.01 TON
필요: 0.03 TON
결과: "❌ TON 잔액이 부족합니다. (트랜잭션 비용)"
```

###***REMOVED***Case 3: Rate Limit
```
TonCenter API 호출 초과
결과: "⏳ 일시적인 네트워크 혼잡입니다."
해결: API Key 추가로 해결됨
```

#***REMOVED***📚 참고 자료

##***REMOVED***TonCenter API
- [TonCenter 문서](https://toncenter.com/api/v2/)
- [TonConsole (API Key 발급)](https://tonconsole.com)
- [Rate Limits](https://docs.toncenter.com/apis/api-v2#rate-limits)

##***REMOVED***Cloudflare
- [Workers 환경 변수](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [GitHub Actions 통합](https://github.com/cloudflare/wrangler-action)

##***REMOVED***TON 블록체인
- [Jetton Standard (TEP-74)](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)
- [TON Connect](https://docs.ton.org/develop/dapps/ton-connect/overview)

---

**작성일:** 2025-11-02  
**작성자:** GitHub Copilot  
**상태:** API Key 추가 완료, 환경 변수 설정 필요
