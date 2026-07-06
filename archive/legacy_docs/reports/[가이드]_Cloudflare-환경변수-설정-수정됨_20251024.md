***REMOVED***🔧 Cloudflare 환경변수 설정 가이드 (수정됨)

> **작성일:** 2025년 10월 24일  
> **수정:** 개인키 길이 및 RPC 환경변수 문법 개선  
> **상태:** ✅ 배포 준비 완료

---

#***REMOVED***🎯 **핵심 수정사항**

##***REMOVED*****1. 개인키 길이: 128자 ❌ → 64자 ✅**

**이전 가정 (잘못됨):**
```
GAME_WALLET_PRIVATE_KEY = [128자 문자열]
```

**올바른 표준:**
```
GAME_WALLET_PRIVATE_KEY = [64자 hex 문자열]
```

**왜?**
```
TON ED25519 개인키:
  크기: 32바이트
  Hex 표현: 32 × 2 = 64자
  
예: ***REDACTED-MNEMONIC-SEED-ROTATE-IMMEDIATELY***
    ↑ 정확히 64자
```

**코드 증거 (wallet-tools/mnemonic-to-key.mjs):**
```javascript
const privateKeyHex = keyPair.secretKey.slice(0, 32).toString('hex');
// ↑ 32바이트 → hex → 항상 64자
```

---

##***REMOVED*****2. RPC 환경변수 문법 개선**

**이전 (작동하지 않음):**
```toml
BACKEND_RPC_URL = "https://rpc.ankr.com/ton_api_v2/${TON_RPC_API_KEY}"
```
❌ 플레이스홀더 `${...}`는 자동 해석되지 않음

**개선된 방법:**
```toml
BACKEND_RPC_URL = "https://rpc.ankr.com/ton_api_v2"
TON_RPC_API_KEY = [Cloudflare 환경변수에서 별도 제공]
```
✅ 코드에서 두 값을 조합해서 사용

**코드 사용법:**
```typescript
// ✅ 올바른 방법
const rpcUrl = `${env.BACKEND_RPC_URL}/${env.TON_RPC_API_KEY}`;
// 결과: "https://rpc.ankr.com/ton_api_v2/66910dc0e84..."
```

---

#***REMOVED***📋 **Cloudflare 환경변수 체크리스트**

##***REMOVED*****위치:**
```
Cloudflare 대시보드
  → Pages → Candlespinner
  → Settings → Environment variables
  → Production 탭
```

##***REMOVED*****필수 설정 (지금 바로 설정):**

| 변수명 | 값 | 길이 | 설명 |
|--------|-----|------|------|
| `GAME_WALLET_PRIVATE_KEY` | [64자 hex] | 64자 | **반드시 64자만!** |
| `TON_RPC_API_KEY` | `***REDACTED-ANKR-API-KEY***` | 64자 | Ankr API 키 |
| `GAME_WALLET_ADDRESS` | `UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd` | 48자 | 게임 지갱 주소 |
| `CSPIN_TOKEN_ADDRESS` | `EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV` | 48자 | CSPIN 토큰 주소 |

##***REMOVED*****주의:**
```
❌ 절대 금지:
   - BACKEND_RPC_URL에 API 키 포함
   - 개인키를 128자로 변환
   - 코드에 API 키 하드코딩

✅ 필수:
   - TON_RPC_API_KEY 별도 환경변수 설정
   - 개인키는 정확히 64자 hex
   - 코드에서 env 변수로 접근
```

---

#***REMOVED***🔄 **설정 방법 (단계별)**

##***REMOVED*****Step 1: 현재 설정 확인**

```
1. Cloudflare 대시보드 접속
2. Production 환경변수 확인
3. 각 변수의 길이 확인:
   - GAME_WALLET_PRIVATE_KEY: 64자? ✅
   - TON_RPC_API_KEY: 있음? ✅
```

##***REMOVED*****Step 2: 개인키 업데이트 (64자)**

```bash
***REMOVED***터미널에서 생성한 개인키 (이전 세션)
***REMOVED***privateKey: ***REDACTED-MNEMONIC-SEED-ROTATE-IMMEDIATELY***...ef7978fc

***REMOVED***Cloudflare에 설정:
***REMOVED***GAME_WALLET_PRIVATE_KEY = ***REDACTED-MNEMONIC-SEED-ROTATE-IMMEDIATELY***...ef7978fc (64자)
```

##***REMOVED*****Step 3: RPC 키 설정**

```
Cloudflare 환경변수에 추가:
  TON_RPC_API_KEY = ***REDACTED-ANKR-API-KEY***
```

##***REMOVED*****Step 4: 배포 확인**

```
Cloudflare 대시보드 → Deployments
→ 최신 배포 상태 확인 (약 2-3분)
```

---

#***REMOVED***📊 **TON 개인키 표준 검증**

##***REMOVED*****비교표:**

| 블록체인 | 곡선 | 크기 | Hex 자릿수 |
|---------|------|------|----------|
| Bitcoin | secp256k1 | 256비트 | 64자 |
| Ethereum | secp256k1 | 256비트 | 64자 |
| **TON** | **ED25519** | **256비트** | **64자** ✅ |

##***REMOVED*****TON 공식 SDK 확인:**

```typescript
// @ton/crypto 라이브러리
import { mnemonicToPrivateKey } from '@ton/crypto';

const keyPair = await mnemonicToPrivateKey(mnemonic);
const privateKeyHex = keyPair.secretKey.slice(0, 32).toString('hex');
// ↑ 항상 64자 hex 반환!
```

---

#***REMOVED***🚀 **다음 단계**

##***REMOVED*****당신이 해야 할 일:**

1. ✅ **개인키 확인**
   ```
   길이: 정확히 64자인가?
   형식: 16진수(0-9, a-f)만 포함?
   ```

2. ✅ **Cloudflare 환경변수 업데이트**
   ```
   GAME_WALLET_PRIVATE_KEY = [64자 hex]
   TON_RPC_API_KEY = [이미 보유한 API 키]
   GAME_WALLET_ADDRESS = [기존값 유지]
   CSPIN_TOKEN_ADDRESS = [기존값 유지]
   ```

3. ✅ **배포 대기**
   ```
   Cloudflare Pages 자동 배포 (2-3분)
   ```

4. ✅ **디버그 API 확인**
   ```
   https://aiandyou.me/api/debug-withdrawal
   addressMatch.match = true ✅
   ```

5. ✅ **인출 기능 테스트**
   ```
   브라우저에서 인출 시도
   ```

---

#***REMOVED***💡 **FAQ**

##***REMOVED*****Q: 개인키를 128자로 변환해야 하나?**
A: ❌ NO! 64자 그대로 사용하세요. TON 표준입니다.

##***REMOVED*****Q: RPC URL에 API 키를 포함해야 하나?**
A: ❌ NO! 코드에서 `${env.BACKEND_RPC_URL}/${env.TON_RPC_API_KEY}`로 조합하세요.

##***REMOVED*****Q: 이전에 128자로 설정했으면?**
A: ✅ 지금 64자로 수정하세요. 현재 설정이 인출 실패의 원인입니다.

##***REMOVED*****Q: 개인키가 맞는지 어떻게 확인하나?**
A: 
```
1. https://aiandyou.me/api/debug-withdrawal 접속
2. addressMatch.match = true ✅ → 맞음
3. addressMatch.match = false ❌ → 틀림
```

---

#***REMOVED***✨ **요약**

**지금까지 해결된 것:**
1. ✅ 개인키 길이 명확화 (128자 ❌ → 64자 ✅)
2. ✅ RPC 환경변수 문법 개선
3. ✅ 코드 수정 완료 (debug-withdrawal.ts)
4. ✅ wrangler.toml 업데이트
5. ✅ Git 커밋 및 배포

**다음 단계:**
→ Cloudflare 환경변수에서 설정 확인 및 업데이트

---

**준비 완료! 환경변수를 확인하고 업데이트해주세요.** 🚀
