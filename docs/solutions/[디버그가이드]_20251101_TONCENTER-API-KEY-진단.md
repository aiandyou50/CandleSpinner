***REMOVED***TONCENTER_API_KEY 디버그 가이드

**작성일**: 2025-11-01  
**이슈**: "TonCenter API 키가 설정되지 않았습니다" 오류  
**커밋**: b7297e5

---

#***REMOVED***📋 문제 상황

##***REMOVED***증상
```
[오후 5:11:40] ❌ 오류: TonCenter API 키가 설정되지 않았습니다. (API 응답 상태: 500)
```

##***REMOVED***환경
- Cloudflare Pages 프로덕션 환경
- `TONCENTER_API_KEY`가 환경변수에 설정되어 있음
- RPC 인출 시도 시 발생

---

#***REMOVED***✅ 코드 분석 결과

##***REMOVED***현재 코드는 올바름

`functions/api/initiate-withdrawal.ts` 파일 확인 결과:

```typescript
export async function onRequestPost(context: any) {
  const { request } = context;
  env = context.env;  // ✅ 올바른 패턴 사용
  
  // ...
  
  const tonCenterApiKey = env.TONCENTER_API_KEY;  // ✅ context.env에서 읽음
}
```

**✅ 확인된 사항:**
1. `context.env` 사용 (Cloudflare Functions 표준)
2. `process.env` 사용하지 않음 (클라이언트 사이드 아님)
3. 서버사이드에서만 접근
4. 코드 패턴 정상

##***REMOVED***가능한 원인

코드는 올바르므로, 다음 중 하나가 원인:

1. **환경변수 바인딩 문제**
   - Cloudflare Pages에서 Production 환경에 변수가 제대로 바인딩되지 않음
   
2. **배포 캐시 문제**
   - 이전 배포의 캐시가 남아있어 새 환경변수를 읽지 못함
   
3. **변수명 오타**
   - Cloudflare에서 설정한 변수명에 오타나 공백이 있음
   - 예: `TONCENTER_API_KEY ` (끝에 공백)

---

#***REMOVED***🔍 추가된 디버그 로깅

##***REMOVED***1. 함수 진입 시 (initiate-withdrawal.ts)

```typescript
console.log('[인출-v2.3.0] 함수 시작 - context 디버그:');
console.log(`  - context 존재: ${!!context}`);
console.log(`  - context.env 존재: ${!!context.env}`);
console.log(`  - context 키들:`, Object.keys(context || {}));
console.log(`  - context.env 키 개수: ${Object.keys(context.env).length}`);
console.log(`  - context.env의 주요 키들:`, Object.keys(context.env).slice(0, 10));
```

**출력 예시 (정상):**
```
[인출-v2.3.0] 함수 시작 - context 디버그:
  - context 존재: true
  - context.env 존재: true
  - context 키들: ["request", "env", "waitUntil", "passThroughOnException", "next", "params"]
  - context.env 키 개수: 5
  - context.env의 주요 키들: ["GAME_WALLET_PRIVATE_KEY", "GAME_WALLET_ADDRESS", "CSPIN_TOKEN_ADDRESS", "TONCENTER_API_KEY", "CREDIT_KV"]
```

##***REMOVED***2. RPC 초기화 전 (initiate-withdrawal.ts)

```typescript
console.log('[인출-v2.3.0] 환경변수 디버그:');
console.log(`  - TONCENTER_API_KEY 존재: ${!!env.TONCENTER_API_KEY}`);
console.log(`  - TONCENTER_API_KEY 타입: ${typeof env.TONCENTER_API_KEY}`);
console.log(`  - TONCENTER_API_KEY 길이: ${env.TONCENTER_API_KEY?.length || 0}`);
console.log(`  - env 객체 키들:`, Object.keys(env || {}).filter(k => k.includes('API') || k.includes('KEY')));
```

**출력 예시 (정상):**
```
[인출-v2.3.0] 환경변수 디버그:
  - TONCENTER_API_KEY 존재: true
  - TONCENTER_API_KEY 타입: string
  - TONCENTER_API_KEY 길이: 64
  - env 객체 키들: ["TONCENTER_API_KEY", "GAME_WALLET_PRIVATE_KEY"]
```

**출력 예시 (문제):**
```
[인출-v2.3.0] 환경변수 디버그:
  - TONCENTER_API_KEY 존재: false
  - TONCENTER_API_KEY 타입: undefined
  - TONCENTER_API_KEY 길이: 0
  - env 객체 키들: ["GAME_WALLET_PRIVATE_KEY"]
```

##***REMOVED***3. 에러 응답에 디버그 정보 포함

오류 발생 시 API 응답에 디버그 정보 포함:

```json
{
  "success": false,
  "error": "TonCenter API 키가 설정되지 않았습니다.",
  "debug": {
    "hasEnv": true,
    "envKeys": 4,
    "apiKeyExists": false
  }
}
```

##***REMOVED***4. 디버그 엔드포인트 (debug-withdrawal.ts)

```typescript
environment: {
  tonCenterApiKey: env.TONCENTER_API_KEY ? '✅ SET' : '❌ NOT SET',
  tonCenterApiKeyLength: env.TONCENTER_API_KEY?.length || 0
}
```

##***REMOVED***5. 환경변수 목록 (debug-private-key.ts)

모든 환경변수 키 출력:

```typescript
console.log(`  - 환경변수 키 목록:`, Object.keys(env));
```

---

#***REMOVED***🧪 배포 후 테스트 절차

##***REMOVED***Step 1: 디버그 엔드포인트 확인

```bash
curl https://aiandyou.me/api/debug-withdrawal
```

**확인 항목:**
```json
{
  "environment": {
    "tonCenterApiKey": "✅ SET" or "❌ NOT SET",
    "tonCenterApiKeyLength": 64
  },
  "status": {
    "tonCenterApiKeyValid": true or false
  }
}
```

##***REMOVED***Step 2: 인출 시도

```bash
curl -X POST https://aiandyou.me/api/initiate-withdrawal \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "UQB...",
    "withdrawalAmount": 1,
    "userJettonWalletAddress": "EQA..."
  }'
```

##***REMOVED***Step 3: Cloudflare Pages 로그 확인

1. Cloudflare Dashboard 접속
2. Pages → 프로젝트 → Functions
3. Real-time logs 또는 Logpush 확인
4. `[인출-v2.3.0]` 태그가 붙은 로그 검색

**찾아야 할 정보:**
- `context.env 키들:` - 실제 사용 가능한 키 목록
- `TONCENTER_API_KEY 존재:` - true/false
- `env 객체 키들:` - API 또는 KEY가 포함된 키들

---

#***REMOVED***🔧 문제 해결 방법

##***REMOVED***방법 1: 환경변수 재설정

1. Cloudflare Dashboard → Pages → Settings → Environment variables
2. `TONCENTER_API_KEY` 삭제
3. 다시 추가 (Production 환경)
4. 재배포

##***REMOVED***방법 2: 캐시 클리어 및 재배포

```bash
***REMOVED***강제 재배포
git commit --allow-empty -m "Force redeploy to refresh env vars"
git push
```

##***REMOVED***방법 3: 변수명 확인

Cloudflare에서 설정된 변수명 확인:
- 대소문자 정확히 일치: `TONCENTER_API_KEY`
- 공백 없음
- 특수문자 없음

##***REMOVED***방법 4: Wrangler로 로컬 테스트

```bash
***REMOVED***wrangler.toml에 추가
[env.production.vars]
TONCENTER_API_KEY = "your_key_here"

***REMOVED***로컬 테스트
npx wrangler pages dev dist
```

---

#***REMOVED***📊 예상 로그 시나리오

##***REMOVED***시나리오 A: 환경변수가 완전히 없음

```
[인출-v2.3.0] 함수 시작 - context 디버그:
  - context.env 키 개수: 1
  - context.env의 주요 키들: ["CREDIT_KV"]

[인출-v2.3.0] 환경변수 디버그:
  - TONCENTER_API_KEY 존재: false
  - env 객체 키들: []

[인출-v2.3.0] ❌ TONCENTER_API_KEY 없음!
[인출-v2.3.0] 사용 가능한 환경변수: ["CREDIT_KV"]
```

**원인**: Cloudflare에서 환경변수가 바인딩되지 않음

##***REMOVED***시나리오 B: 다른 이름으로 설정됨

```
[인출-v2.3.0] 환경변수 디버그:
  - TONCENTER_API_KEY 존재: false
  - env 객체 키들: ["TON_CENTER_API_KEY"]  ← 언더스코어 위치 다름
```

**원인**: 변수명 오타

##***REMOVED***시나리오 C: 빈 문자열

```
[인출-v2.3.0] 환경변수 디버그:
  - TONCENTER_API_KEY 존재: true
  - TONCENTER_API_KEY 타입: string
  - TONCENTER_API_KEY 길이: 0  ← 빈 문자열!
```

**원인**: 환경변수 값이 비어있음

---

#***REMOVED***✅ 정상 작동 시 로그

```
[인출-v2.3.0] 함수 시작 - context 디버그:
  - context 존재: true
  - context.env 존재: true
  - context.env 키 개수: 5

[인출-v2.3.0] 환경변수 디버그:
  - TONCENTER_API_KEY 존재: true
  - TONCENTER_API_KEY 타입: string
  - TONCENTER_API_KEY 길이: 64
  - env 객체 키들: ["TONCENTER_API_KEY", "GAME_WALLET_PRIVATE_KEY"]

[인출-v2.3.0] TonCenter v3 RPC 초기화 완료
```

---

#***REMOVED***🔐 보안 참고사항

**추가된 로그는 안전합니다:**
- ✅ 환경변수 **존재 여부**만 표시
- ✅ 환경변수 **길이**만 표시
- ✅ 환경변수 **키 이름**만 표시
- ❌ 실제 **값**은 절대 로그하지 않음

---

#***REMOVED***📞 다음 단계

1. ✅ 코드 배포 (b7297e5 커밋)
2. ⏳ 인출 시도하여 로그 생성
3. ⏳ Cloudflare Pages 로그 확인
4. ⏳ 로그 결과에 따라 환경변수 수정
5. ⏳ 재배포 후 재테스트

---

**작성자**: GitHub Copilot AI Agent  
**날짜**: 2025-11-01  
**커밋**: b7297e5
