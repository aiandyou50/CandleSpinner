# TONCENTER_API_KEY 확인 방법

**작성일**: 2025-11-02  
**목적**: Cloudflare Workers에서 TONCENTER_API_KEY가 정상적으로 설정되었는지 확인

---

## 🔍 방법 1: 기존 로그 확인 (가장 간단)

현재 `src/index.ts`에 이미 디버깅 로그가 있습니다:

```typescript
// ✅ 환경 변수 디버깅 (배포 후 확인용)
console.log('[Env Check] TONCENTER_API_KEY exists:', !!env.TONCENTER_API_KEY);
```

### 확인 방법
1. Cloudflare Dashboard 접속
2. Workers & Pages → CandleSpinner
3. **Logs** 탭 클릭 (또는 배포 후 첫 요청)
4. 로그에서 `[Env Check] TONCENTER_API_KEY exists: true/false` 확인

**결과 해석**:
- `true` → API 키 정상 설정 ✅
- `false` → API 키 미설정 ❌

---

## 🔍 방법 2: 전용 API 엔드포인트 (권장)

민감 정보 노출 없이 API 키 상태만 확인하는 엔드포인트를 추가합니다.

### 구현 코드

`src/index.ts`에 추가:

```typescript
// API 라우팅에 추가
if (url.pathname === '/api/check-api-key') {
  return handleCheckApiKey(request, env, corsHeaders);
}
```

```typescript
/**
 * TONCENTER_API_KEY 확인 (민감 정보 노출 없이)
 * 실제 API 호출로 유효성 검증
 */
async function handleCheckApiKey(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  console.log('[CheckApiKey] API 키 확인 시작');
  
  const apiKey = env.TONCENTER_API_KEY;
  
  // 1. 환경변수 존재 여부
  const exists = !!apiKey;
  console.log(`[CheckApiKey] 환경변수 존재: ${exists}`);
  
  if (!exists) {
    return new Response(JSON.stringify({
      exists: false,
      valid: false,
      message: 'TONCENTER_API_KEY 환경변수가 설정되지 않았습니다.',
      recommendation: 'Cloudflare Dashboard에서 환경변수를 추가하세요.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // 2. 실제 API 호출로 유효성 검증
  console.log('[CheckApiKey] TonCenter API 테스트 호출...');
  
  try {
    const testResponse = await fetch(
      'https://toncenter.com/api/v2/getAddressState?address=EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADdU',
      {
        headers: {
          'X-API-Key': apiKey,
        }
      }
    );
    
    const testData = await testResponse.json() as { ok: boolean; error?: string };
    
    if (!testResponse.ok || !testData.ok) {
      console.error('[CheckApiKey] API 호출 실패:', testData);
      return new Response(JSON.stringify({
        exists: true,
        valid: false,
        message: 'API 키가 존재하지만 유효하지 않습니다.',
        error: testData.error || 'Unknown error',
        recommendation: 'TonCenter에서 새로운 API 키를 발급받으세요: https://toncenter.com'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('[CheckApiKey] ✅ API 키 정상');
    
    return new Response(JSON.stringify({
      exists: true,
      valid: true,
      message: '✅ TONCENTER_API_KEY가 정상적으로 설정되어 있습니다.',
      rateLimit: 'API Key 사용 중 (Rate Limit 없음)'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[CheckApiKey] 오류:', error);
    return new Response(JSON.stringify({
      exists: true,
      valid: false,
      message: 'API 키 검증 중 오류 발생',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
```

### 사용 방법

**로컬 테스트**:
```bash
# 개발 서버 실행
npm run dev

# 브라우저 또는 curl
curl http://localhost:5173/api/check-api-key
```

**프로덕션 테스트**:
```bash
curl https://your-worker.workers.dev/api/check-api-key
```

**응답 예시**:

1. **API 키 없음** ❌:
```json
{
  "exists": false,
  "valid": false,
  "message": "TONCENTER_API_KEY 환경변수가 설정되지 않았습니다.",
  "recommendation": "Cloudflare Dashboard에서 환경변수를 추가하세요."
}
```

2. **API 키 유효** ✅:
```json
{
  "exists": true,
  "valid": true,
  "message": "✅ TONCENTER_API_KEY가 정상적으로 설정되어 있습니다.",
  "rateLimit": "API Key 사용 중 (Rate Limit 없음)"
}
```

3. **API 키 무효** ⚠️:
```json
{
  "exists": true,
  "valid": false,
  "message": "API 키가 존재하지만 유효하지 않습니다.",
  "error": "Invalid API key",
  "recommendation": "TonCenter에서 새로운 API 키를 발급받으세요: https://toncenter.com"
}
```

---

## 🔍 방법 3: Cloudflare Dashboard 직접 확인

### 단계별 가이드

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com

2. **Workers & Pages 메뉴**
   - 좌측 메뉴에서 "Workers & Pages" 클릭

3. **CandleSpinner 선택**
   - 프로젝트 목록에서 "CandleSpinner" 클릭

4. **Settings → Variables**
   - 상단 탭에서 "Settings" 클릭
   - 좌측에서 "Variables" 클릭

5. **환경변수 확인**
   ```
   Production (Production)
   ├─ TONCENTER_API_KEY: ••••••••••••••••
   ├─ GAME_WALLET_MNEMONIC: ••••••••••••••••
   ├─ GAME_WALLET_ADDRESS: UQB...
   └─ CSPIN_JETTON_MASTER: EQD...
   ```

### 확인 포인트
- ✅ `TONCENTER_API_KEY`가 목록에 있어야 함
- ✅ 값이 `••••••` (마스킹)로 표시되어야 함
- ⚠️ **Plain text**가 아닌 **Encrypted** 타입으로 설정

---

## 🔍 방법 4: 실제 인출 테스트 (최종 검증)

API 키가 정상적으로 동작하는지 확인하는 가장 확실한 방법입니다.

### 테스트 시나리오

1. **게임 화면 진입**
2. **크레딧 확인** (10 CSPIN 보유)
3. **인출 시도** (1 CSPIN)
4. **로그 확인**

### 성공 로그 예시
```
[Withdraw] 인출 요청 시작
[Withdraw] 사용자: UQA...
[Withdraw] 금액: 1 CSPIN
[환경변수] 확인 완료
[환경변수] TONCENTER_API_KEY: 있음  ← ✅ 여기 확인!
[getGameWallet] 니모닉 → 키 쌍 변환 시작
[seqno] TONCENTER_API_KEY 사용  ← ✅ 여기도 확인!
[getGameJettonWallet] TONCENTER_API_KEY 사용  ← ✅ 여기도 확인!
[TonCenter] TONCENTER_API_KEY 사용  ← ✅ 여기도 확인!
✅ 인출 성공: abc123...
```

### 실패 로그 예시 (API 키 없음)
```
[Withdraw] 인출 요청 시작
[환경변수] TONCENTER_API_KEY: 없음 (Rate Limit 주의)  ← ❌ 문제!
[seqno] ⚠️ TONCENTER_API_KEY 없음 (Rate Limit 주의)  ← ❌
[getGameJettonWallet] ⚠️ TONCENTER_API_KEY 없음 (Rate Limit 주의)  ← ❌
```

---

## 📋 체크리스트

### 환경변수 설정 확인
- [ ] Cloudflare Dashboard → Variables에 `TONCENTER_API_KEY` 존재
- [ ] 타입: **Encrypted** (Plain text 아님)
- [ ] 값: TonCenter에서 발급받은 실제 API 키

### API 키 유효성 확인
- [ ] `/api/check-api-key` 호출 → `valid: true`
- [ ] 로그에 `[Env Check] TONCENTER_API_KEY exists: true`
- [ ] 인출 테스트 시 "TONCENTER_API_KEY 사용" 로그 확인

### Rate Limit 확인
- [ ] TonCenter API 호출 시 429 에러 없음
- [ ] 연속 요청 가능 (API Key 덕분)

---

## 🔑 API 키 발급 방법 (없는 경우)

1. **TonCenter 접속**
   - https://toncenter.com

2. **API Keys 메뉴**
   - 우측 상단 "API Keys" 클릭

3. **새 키 생성**
   - "Create API Key" 버튼 클릭
   - 키 복사 (한 번만 표시됨!)

4. **Cloudflare에 추가**
   - Workers & Pages → CandleSpinner → Settings → Variables
   - "Add" 버튼 클릭
   - Variable name: `TONCENTER_API_KEY`
   - Value: 복사한 API 키
   - Type: **Encrypted** 선택 ✅
   - "Deploy" 버튼 클릭

---

## ⚠️ 주의사항

### API 키 보안
- ❌ Git에 커밋 금지
- ❌ 로그에 전체 키 출력 금지
- ✅ Cloudflare Encrypted Variables 사용
- ✅ 로컬 `.dev.vars` 파일 사용 (`.gitignore` 포함)

### Rate Limit
- API 키 없음: 초당 1회 제한
- API 키 있음: 초당 10회 제한
- 게임 인출: API 키 필수! (동시 요청 대응)

---

## 🎯 권장 구현 순서

1. ✅ `/api/check-api-key` 엔드포인트 추가 (이 가이드 참고)
2. ✅ 로컬에서 테스트 (`npm run dev`)
3. ✅ Cloudflare에 배포 (`npm run deploy`)
4. ✅ 프로덕션에서 `/api/check-api-key` 호출
5. ✅ 인출 테스트로 최종 검증

---

**다음 단계**: `/api/check-api-key` 엔드포인트를 `src/index.ts`에 추가
