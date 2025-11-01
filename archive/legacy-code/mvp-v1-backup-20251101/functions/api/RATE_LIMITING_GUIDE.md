# Rate Limiting Implementation Guide

## 개요

Rate Limiting은 Cloudflare Workers + KV Storage를 사용하여 구현됩니다.

## 사용 방법

### 1. Rate Limit 확인

```typescript
import { checkRateLimit, getClientIP, RATE_LIMIT_PRESETS } from '../_rateLimit';

export async function onRequestPost(context: any): Promise<Response> {
  const clientIP = getClientIP(context.request);
  const rateLimitResult = await checkRateLimit(
    context.env.CREDIT_KV,
    clientIP,
    '/api/deposit',
    RATE_LIMIT_PRESETS.CSPIN_TRANSFER
  );
  
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetIn);
  }
  
  // Process request
}
```

## Rate Limit Tiers

1. **CSPIN_TRANSFER**: 10 req/min (입금/출금)
2. **GENERAL_API**: 100 req/min (일반 API)
3. **GAME_API**: 50 req/min (게임)
4. **EMERGENCY**: 1 req/10s (DDoS 방어)

## 구현 완료 목록

- ✅ functions/_rateLimit.ts 작성
- ⏳ API 엔드포인트 통합 (다음 단계)
- ⏳ 모니터링 설정 (다음 단계)
