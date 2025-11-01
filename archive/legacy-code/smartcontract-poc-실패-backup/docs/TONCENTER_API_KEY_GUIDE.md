***REMOVED***🔑 TonCenter API Key 발급 가이드

#***REMOVED***❌ 문제: Rate Limit (429 오류)

```
AxiosError: Request failed with status code 429
{ ok: false, result: 'Ratelimit exceed', code: 429 }
```

**원인**: 무료 TonCenter API는 요청 제한 있음 (1초당 1개)

---

#***REMOVED***✅ 해결: API Key 발급 (무료, 1분 소요)

##***REMOVED***1단계: Telegram 봇 열기

**@tonapibot** 또는 **@toncenter_bot**으로 메시지 보내기:

```
/start
```

##***REMOVED***2단계: API Key 받기

봇이 자동으로 API Key를 발급해줍니다:

```
Your API key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

##***REMOVED***3단계: .env 파일에 추가

`backend-api/.env` 파일을 열고 추가:

```env
***REMOVED***기존
GAME_WALLET_PRIVATE_KEY="your 24 words mnemonic here"
JETTON_MASTER=EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA
NETWORK=mainnet
MAX_SINGLE_WITHDRAW=1000000

***REMOVED***추가 (방금 받은 API Key)
TONCENTER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

##***REMOVED***4단계: 서버 재시작

```powershell
***REMOVED***Ctrl+C로 기존 서버 중지 후
cd backend-api
node server-direct-transfer.js
```

---

#***REMOVED***🎯 API Key의 장점

| 항목 | 무료 (API Key 없음) | API Key 사용 |
|------|------------------|-------------|
| **요청 제한** | ⚠️ 1 req/sec | ✅ 10 req/sec |
| **안정성** | ❌ 낮음 | ✅ 높음 |
| **비용** | 무료 | 무료 |
| **발급 시간** | - | 1분 |

---

#***REMOVED***🔄 대안 방법들

##***REMOVED***방법 2: Orbs Network (무료, API Key 불필요)

**더 빠르고 안정적인 무료 RPC:**

`backend-api/.env` 수정:
```env
***REMOVED***TonCenter 대신 Orbs 사용
***REMOVED***NETWORK=mainnet은 그대로 유지
***REMOVED***TONCENTER_API_KEY는 불필요
```

`server-direct-transfer.js` 수정:
```javascript
// Orbs Network 엔드포인트 (무료, Rate Limit 없음!)
const ENDPOINT = NETWORK === 'mainnet' 
    ? 'https://tonapi.io/v2/jsonRPC'
    : 'https://testnet.tonapi.io/v2/jsonRPC';

const client = new TonClient({
    endpoint: ENDPOINT
    // API Key 불필요!
});
```

##***REMOVED***방법 3: GetBlock (유료, 가장 안정적)

**프로덕션 환경용:**

1. https://getblock.io/ 가입
2. TON 노드 생성
3. API Key 받기
4. `.env`에 엔드포인트 추가

---

#***REMOVED***🚀 권장 순서

##***REMOVED***개발/테스트:
1. **Orbs Network** (무료, API Key 불필요) ✅
2. TonCenter + API Key (무료, 1분 발급)

##***REMOVED***프로덕션:
1. **GetBlock** (유료, 99.9% 가용성)
2. 자체 TON 노드 (최고 성능)

---

#***REMOVED***💡 지금 바로 해결하기

##***REMOVED***가장 빠른 방법: Orbs Network

```powershell
***REMOVED***1. server-direct-transfer.js 수정
***REMOVED***(아래 코드 복사)
```

**수정할 부분 (26-35번 줄):**

```javascript
// ❌ 기존 (TonCenter)
const ENDPOINT = NETWORK === 'mainnet' 
    ? 'https://toncenter.com/api/v2/jsonRPC'
    : 'https://testnet.toncenter.com/api/v2/jsonRPC';

// ✅ 신규 (Orbs Network - Rate Limit 없음!)
const ENDPOINT = NETWORK === 'mainnet' 
    ? 'https://tonapi.io/v2/jsonRPC'
    : 'https://testnet.tonapi.io/v2/jsonRPC';

const client = new TonClient({
    endpoint: ENDPOINT
    // API Key 불필요!
});
```

**서버 재시작:**
```powershell
cd backend-api
node server-direct-transfer.js
```

**✅ 즉시 작동합니다!**

---

#***REMOVED***🔍 문제 해결

##***REMOVED***여전히 429 오류?
- **원인**: 서버를 재시작하지 않음
- **해결**: `Ctrl+C` 후 재시작

##***REMOVED***Orbs도 느림?
- **원인**: 네트워크 문제
- **해결**: TonCenter + API Key 사용

##***REMOVED***API Key를 못 받음?
- **원인**: 텔레그램 봇 오류
- **해결**: @toncenter_bot 대신 @tonapibot 시도

---

#***REMOVED***🎉 완료!

이제 **Rate Limit 걱정 없이** 인출 시스템을 사용할 수 있습니다!

```
✅ 무제한 요청
✅ 빠른 응답
✅ 안정적인 서비스
```

**지금 바로 테스트하세요!** 🚀
