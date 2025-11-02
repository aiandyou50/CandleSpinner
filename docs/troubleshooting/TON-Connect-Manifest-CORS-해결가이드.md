# TON Connect Manifest CORS 해결 가이드

## 📅 작성일: 2025년 11월 2일

## 🚨 문제 상황

### 증상
- TON Wallet에서 "App Manifest Error" 발생
- 앱 연결 시도 시 실패
- Manifest 파일은 접근 가능하지만 CORS 헤더 누락

### 발생 원인
Cloudflare Workers를 Custom Domain(aiandyou.me)을 통해 접근할 때, Workers 코드에서 설정한 CORS 헤더가 적용되지 않는 현상

## 🔍 원인 분석

### 1. Custom Domain vs Workers Direct URL

| 구분 | Custom Domain | Workers Direct URL |
|------|--------------|-------------------|
| URL | aiandyou.me | candlespinner-workers.x00518.workers.dev |
| CORS 헤더 적용 | ❌ 적용 안됨 | ✅ 정상 적용 |
| Manifest 제공 | ✅ 정상 | ✅ 정상 |
| TON Connect 호환 | ❌ 실패 | ✅ 성공 |

### 2. CORS 헤더 누락 검증

**Custom Domain 테스트:**
```bash
curl -I https://aiandyou.me/tonconnect-manifest.json
```
```
HTTP/2 200 
content-type: application/json
# ❌ Access-Control-Allow-Origin 헤더 없음!
```

**Workers Direct URL 테스트:**
```bash
curl -I https://candlespinner-workers.x00518.workers.dev/tonconnect-manifest.json
```
```
HTTP/2 200 
content-type: application/json; charset=utf-8
access-control-allow-origin: *
access-control-allow-methods: GET, POST, OPTIONS, HEAD
access-control-allow-headers: Content-Type, Accept, Origin, User-Agent
access-control-max-age: 86400
# ✅ 모든 CORS 헤더 정상!
```

### 3. Cloudflare Custom Domain의 CORS 제한 원인

Custom Domain에서 CORS 헤더가 적용되지 않는 이유:

1. **Transform Rules**: 헤더를 제거하거나 수정하는 규칙이 있을 수 있음
2. **Page Rules**: Custom Domain에 대한 우선순위 규칙이 있을 수 있음
3. **DNS Proxy 미설정**: 회색 구름(DNS Only) 상태일 경우 Workers가 적용되지 않음
4. **Cache 설정**: 캐시된 응답에 CORS 헤더가 없을 수 있음
5. **Workers Routes 우선순위**: 여러 Route가 충돌할 수 있음

## ✅ 해결 방법

### 즉시 해결 (Workaround)

Workers 직접 주소를 사용하여 TON Connect Manifest를 제공

#### 1. Manifest URL 변경

**파일: `src/main.tsx`**
```typescript
// ❌ 이전
const manifestUrl = 'https://aiandyou.me/tonconnect-manifest.json';

// ✅ 변경
const manifestUrl = 'https://candlespinner-workers.x00518.workers.dev/tonconnect-manifest.json';
```

#### 2. Icon URL 변경

**파일: `public/tonconnect-manifest.json`**
```json
{
  "url": "https://aiandyou.me",
  "name": "CandleSpinner",
  "iconUrl": "https://candlespinner-workers.x00518.workers.dev/icon.png"
}
```

**중요:** 
- `url` 필드는 앱의 메인 주소이므로 `aiandyou.me` 유지
- `iconUrl`만 Workers 직접 주소로 변경

#### 3. 배포 및 캐시 클리어

```bash
# 빌드
npm run build

# Git 커밋
git add .
git commit -m "fix: Manifest URL을 Workers 직접 주소로 변경하여 CORS 적용"
git push origin main

# GitHub Actions 자동 배포 대기 (30-40초)

# Cloudflare 캐시 클리어 (선택사항)
npx wrangler pages deployment tail
```

#### 4. 클라이언트 캐시 클리어

사용자에게 안내:
1. Telegram 앱 완전 종료
2. 디바이스 재부팅 (선택사항)
3. Telegram 재시작
4. 앱 재접속

### 근본 해결 (Root Cause Fix)

Custom Domain에서 CORS 헤더를 적용하려면:

#### 1. Cloudflare Dashboard 확인

**Transform Rules 점검:**
- URL: `https://dash.cloudflare.com/[ACCOUNT_ID]/workers-and-pages`
- 경로: Transform Rules → Modify Response Header
- 확인: `aiandyou.me`에 대한 헤더 제거 규칙이 있는지 확인

**Page Rules 점검:**
- URL: `https://dash.cloudflare.com/[ACCOUNT_ID]/[ZONE_ID]/rules`
- 확인: Custom Domain에 대한 우선순위 규칙 확인

**DNS 설정 점검:**
- URL: `https://dash.cloudflare.com/[ACCOUNT_ID]/[ZONE_ID]/dns`
- 확인: `aiandyou.me` 레코드가 **주황색 구름**(Proxied) 상태인지 확인
- ❌ 회색 구름(DNS Only): Workers가 적용되지 않음

**Workers Routes 점검:**
- URL: `https://dash.cloudflare.com/[ACCOUNT_ID]/workers-and-pages/workers`
- 확인: `aiandyou.me/*` Route가 `candlespinner-workers` Worker에 연결되어 있는지 확인

#### 2. CORS 헤더 명시적 설정 (Workers 코드)

**파일: `src/index.ts`**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, User-Agent',
  'Access-Control-Max-Age': '86400',
};

// Manifest 전용 엔드포인트
if (url.pathname === '/tonconnect-manifest.json') {
  try {
    const manifestContent = await env.ASSETS.fetch(request);
    const manifestText = await manifestContent.text();
    
    return new Response(manifestText, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Manifest fetch error:', error);
    return new Response('Manifest not found', { status: 404 });
  }
}
```

#### 3. 검증 스크립트

**파일: `scripts/verify-custom-domain-cors.ps1`**
```powershell
Write-Host "🔍 Custom Domain CORS 검증" -ForegroundColor Cyan

$domain = "aiandyou.me"
$workersUrl = "candlespinner-workers.x00518.workers.dev"

Write-Host "`n1️⃣ Custom Domain 테스트:" -ForegroundColor Yellow
$customResponse = curl -I "https://$domain/tonconnect-manifest.json" 2>&1
if ($customResponse -match "access-control-allow-origin") {
    Write-Host "✅ CORS 헤더 존재" -ForegroundColor Green
} else {
    Write-Host "❌ CORS 헤더 없음" -ForegroundColor Red
}

Write-Host "`n2️⃣ Workers Direct URL 테스트:" -ForegroundColor Yellow
$workersResponse = curl -I "https://$workersUrl/tonconnect-manifest.json" 2>&1
if ($workersResponse -match "access-control-allow-origin") {
    Write-Host "✅ CORS 헤더 존재" -ForegroundColor Green
} else {
    Write-Host "❌ CORS 헤더 없음" -ForegroundColor Red
}

Write-Host "`n📋 검증 완료" -ForegroundColor Cyan
```

## 🛠️ 예방 체크리스트

### 새 프로젝트 시작 시

- [ ] Workers 코드에 CORS 헤더 명시적 설정
- [ ] Custom Domain DNS가 Proxied(주황색 구름) 상태인지 확인
- [ ] Transform Rules에 헤더 제거 규칙이 없는지 확인
- [ ] Page Rules와 Workers Routes 우선순위 확인
- [ ] 로컬 테스트 후 Workers Direct URL로 먼저 테스트
- [ ] Custom Domain CORS 검증 스크립트 실행
- [ ] TON Connect Manifest 접근 시 CORS 헤더 로깅 추가

### TON Connect 통합 시

- [ ] Manifest URL은 CORS가 보장된 주소 사용
- [ ] Icon URL도 동일한 CORS 정책 적용
- [ ] `url` 필드는 실제 앱 주소 (브랜딩 목적)
- [ ] 필수 필드만 포함 (`url`, `name`, `iconUrl`)
- [ ] 선택 필드는 접근 가능한 URL인지 확인 후 추가
- [ ] 배포 후 `curl -I` 명령으로 CORS 헤더 확인

### 배포 전 검증

```bash
# 1. 빌드 테스트
npm run build

# 2. Workers Direct URL CORS 확인
curl -I https://[YOUR-WORKERS-URL]/tonconnect-manifest.json

# 3. Custom Domain CORS 확인
curl -I https://[YOUR-DOMAIN]/tonconnect-manifest.json

# 4. Manifest 내용 확인
curl -s https://[YOUR-WORKERS-URL]/tonconnect-manifest.json | jq .

# 5. Icon 접근 확인
curl -I https://[YOUR-WORKERS-URL]/icon.png
```

## 📚 관련 문서

- [TON Connect Manifest 공식 문서](https://docs.ton.org/develop/dapps/ton-connect/manifest)
- [Cloudflare Workers CORS 가이드](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- [Cloudflare Custom Domains 설정](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

## 🎯 핵심 요약

### 문제
Custom Domain(aiandyou.me)을 통한 Manifest 접근 시 CORS 헤더 누락

### 해결
Workers 직접 주소(candlespinner-workers.x00518.workers.dev)로 Manifest 제공

### 교훈
1. **Custom Domain과 Workers Direct URL은 다르게 동작**할 수 있음
2. **CORS 헤더는 반드시 검증** (curl -I 명령 사용)
3. **Cloudflare Dashboard 설정**이 Workers 코드보다 우선순위가 높을 수 있음
4. **TON Connect는 엄격한 CORS 정책** 적용
5. **Workaround 먼저, 근본 해결은 나중에** (서비스 우선)

## ✅ 성공 기준

- [ ] `curl -I https://[MANIFEST-URL]` 명령 시 `access-control-allow-origin: *` 헤더 존재
- [ ] TON Wallet 연결 시 "App Manifest Error" 발생하지 않음
- [ ] 지갑 연결 프로세스가 정상적으로 진행됨
- [ ] 트랜잭션 미리보기가 "Failed" 없이 표시됨

---

**작성자**: GitHub Copilot  
**최종 검증**: 2025년 11월 2일  
**상태**: ✅ 해결 완료
