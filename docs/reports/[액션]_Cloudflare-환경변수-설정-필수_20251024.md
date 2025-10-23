# 🚨 Cloudflare Pages 환경변수 설정 - 즉시 필요

## 📌 상황
- 로컬 개발에서는 wrangler.toml의 변수로 테스트 가능
- 프로덕션(aiandyou.me)에서는 **Cloudflare Pages의 환경변수 설정 필요**
- 현재: 해당 환경변수가 설정되지 않아 → **HTTP 500 오류 발생**

---

## ✅ 설정해야 할 환경변수

### 1. **GAME_WALLET_PRIVATE_KEY** (개인키 - 128자)

⚠️ **보안: 절대 이 문서에 개인키 입력하지 말 것!**

**설정 위치:**
1. Cloudflare 대시보드 → aiandyou.me 프로젝트
2. Settings → Environment variables
3. Production 환경에 다음 추가:
   - **Variable name:** `GAME_WALLET_PRIVATE_KEY`
   - **Value:** `[당신의 128자 개인키]` (wallet-tools 스크립트로 생성)
   - **Type:** Encrypted

⚠️ **보안 주의:**
- 이 키는 절대 공개 저장소에 커밋하지 말 것
- 이 문서에도 절대 입력하지 말 것
- Cloudflare의 Encrypted 필드에만 저장
- 생성 후 로컬 터미널 히스토리 즉시 삭제 (Clear-History)

---

### 2. **TON_RPC_API_KEY** (Ankr API 키)
```
[당신의 Ankr API 키 입력]
```

**설정 위치:**
1. Cloudflare 대시보드 → aiandyou.me 프로젝트
2. Settings → Environment variables
3. Production 환경에 다음 추가:
   - **Variable name:** `TON_RPC_API_KEY`
   - **Value:** `[당신의 Ankr API 키]`
   - **Type:** Encrypted

---

## 📊 최종 확인 체크리스트

| 항목 | 상태 | 비고 |
|------|------|------|
| GAME_WALLET_PRIVATE_KEY 설정 | ⬜ | 128자 개인키 |
| TON_RPC_API_KEY 설정 | ⬜ | Ankr API 키 |
| 환경변수 Type | ⬜ | Encrypted 선택 |
| 저장 후 배포 | ⬜ | 자동 또는 수동 |

---

## 🔗 Cloudflare Pages 환경변수 설정 URL
```
https://dash.cloudflare.com/
→ Select your project (aiandyou.me)
→ Settings
→ Environment variables
→ Production
→ Add variables
```

---

## 🧪 설정 후 검증 단계

**1단계: 디버그 API 테스트**
```
브라우저 접속: https://aiandyou.me/api/debug-withdrawal
```

**예상 정상 응답:**
```json
{
  "environment": {
    "hasPrivateKey": true,
    "privateKeyLength": 128,
    "privateKeyMasked": "4e6568d1...978fc"
  },
  "status": {
    "privateKeyValid": true,
    "gameWalletValid": true,
    "cspinTokenValid": true
  },
  "addressMatch": {
    "match": true,
    "note": "✅ 개인키와 주소가 일치합니다"
  }
}
```

**2단계: 실제 인출 테스트**
- 웹사이트에서 1 CSPIN 인출 시도
- 에러 없이 성공해야 함

---

## ❌ 설정 전 - 현재 상태
```
Error: bad secret key size
Cause: keyPairFromSecretKey expects 64 bytes (128 hex chars)
Status: GAME_WALLET_PRIVATE_KEY 환경변수가 wrangler.toml의 매개변수로 설정됨
→ Cloudflare 프로덕션에서 인식 불가능
```

---

## ✅ 설정 후 - 예상 상태
```
privateKeyValid: true
addressMatch.match: true
Withdrawal API: HTTP 200 ✅
```

---

## 📝 참고사항

### wrangler.toml의 변수 vs Cloudflare 환경변수
- **wrangler.toml:** 로컬 개발용 + 공개 저장소에 안전한 것만 저장
- **Cloudflare 환경변수:** 프로덕션 실제 값 (개인키, API 키 등)

### RPC URL 구성
```typescript
// 코드 내부 (initiate-withdrawal.ts)
const rpcUrl = `${env.BACKEND_RPC_URL}/${env.TON_RPC_API_KEY}`;
// → https://rpc.ankr.com/ton_api_v2/YOUR_API_KEY
```

---

## 🆘 문제 해결

### "환경변수가 설정되지 않음" 오류
- Cloudflare 대시보드에서 실제로 저장되었는지 재확인
- 배포 후 2-3분 기다렸는지 확인
- 수동 배포 또는 git push로 재배포

### "bad secret key size" 여전히 발생
- 개인키가 정확히 128자인지 확인
- 오타 없는지 재확인
- Cloudflare 환경변수 다시 저장 후 배포

---

**모든 설정 완료 후 이 문서 저장하고, 테스트 결과를 공유해주세요!** 🚀
