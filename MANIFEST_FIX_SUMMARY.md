# TON Connect Manifest Error 해결 완료

**날짜**: 2025년 11월 2일  
**문제**: App Manifest Error in TON Wallet  
**참조**: [TON Wallet 공식 가이드](https://help.wallet.tg/article/281-ton-connect-and-how-to-connect-apps)

---

## ✅ 해결된 문제

### 1. Manifest 필드명 오류
**문제**: `privacyPolicyUrl` (비표준 필드명)  
**해결**: `privacyUrl` (TON Connect 표준)

```json
// ❌ 이전 (잘못됨)
{
  "privacyPolicyUrl": "https://..."
}

// ✅ 수정 (올바름)
{
  "privacyUrl": "https://..."
}
```

### 2. CORS 헤더 누락
**문제**: TON Wallet이 manifest 파일을 읽을 수 없음  
**해결**: 명시적 CORS 헤더 추가

```typescript
// src/index.ts에 추가
if (url.pathname === '/tonconnect-manifest.json') {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Content-Type', 'application/json');
  newHeaders.set('Cache-Control', 'public, max-age=3600');
  
  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
}
```

### 3. GitHub Actions 배포 오류
**문제**: `CLOUDFLARE_API_TOKEN` 환경 변수 누락  
**해결**: GitHub CLI로 Secrets 자동 설정

```powershell
# GitHub CLI 설치 및 인증
winget install --id GitHub.cli
& 'C:\Program Files\GitHub CLI\gh.exe' auth login

# Secrets 설정
& 'C:\Program Files\GitHub CLI\gh.exe' secret set CLOUDFLARE_API_TOKEN
& 'C:\Program Files\GitHub CLI\gh.exe' secret set CLOUDFLARE_ACCOUNT_ID -b '48a09063776ab35c453778ea6ebd0172'
```

---

## 📋 최종 Manifest 구조

```json
{
  "url": "https://candlespinner-workers.pages.dev",
  "name": "CandleSpinner",
  "iconUrl": "https://raw.githubusercontent.com/aiandyou50/CandleSpinner/main/public/icon-512.svg",
  "termsOfUseUrl": "https://candlespinner-workers.pages.dev/terms",
  "privacyUrl": "https://candlespinner-workers.pages.dev/privacy"
}
```

**필수 필드**:
- ✅ `url`: 앱 메인 URL
- ✅ `name`: 앱 이름
- ✅ `iconUrl`: 앱 아이콘 (HTTPS, 공개 접근 가능)

**선택 필드**:
- ✅ `termsOfUseUrl`: 이용약관
- ✅ `privacyUrl`: 개인정보처리방침

---

## 🚀 배포 결과

### GitHub Actions
- ✅ 자동 배포 성공 (30초)
- ✅ Cloudflare Workers 배포 완료
- 📊 [Actions 로그](https://github.com/aiandyou50/CandleSpinner/actions)

### 배포 URL
- 📱 **메인**: https://candlespinner-workers.pages.dev
- 📋 **Manifest**: https://candlespinner-workers.pages.dev/tonconnect-manifest.json

---

## 🧪 테스트 방법

### 1. 자동 검증 스크립트
```powershell
.\verify-manifest.ps1
```

### 2. 수동 테스트
1. **DNS 전파 대기** (2-3분)
2. 모바일에서 Telegram 열기
3. https://candlespinner-workers.pages.dev 접속
4. TON 지갑 연결 버튼 클릭
5. 'Open Wallet in Telegram' 클릭

---

## 💡 문제 해결 (TON Wallet 공식 가이드)

### App Manifest Error가 계속 발생하면:

#### 1. 디바이스 시간 자동 설정
```
설정 > 날짜 및 시간 > '자동으로 시간 설정' ON
```

#### 2. 네트워크 변경
- Wi-Fi 사용 중 → 모바일 데이터로 전환
- 모바일 데이터 사용 중 → Wi-Fi로 전환

#### 3. Telegram 캐시 클리어

**iOS**:
```
Telegram 설정 > 데이터 및 저장공간 > 저장공간 사용량 > 캐시 지우기
```

**Android**:
```
설정 > 앱 > Telegram > 캐시 지우기
설정 > 앱 > Android System WebView > 캐시 지우기
```

⚠️ **중요**: 캐시 클리어 전 TON Wallet Secret Recovery Phrase 저장 또는 이메일 복구 활성화!

#### 4. 재시도
- Telegram 완전 종료 후 재시작
- 앱 연결 재시도

---

## 🛠️ 유용한 명령어

### GitHub Actions 재실행
```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' workflow run "Deploy to Cloudflare Workers"
```

### 실시간 로그 확인
```powershell
npx wrangler tail
```

### Manifest 검증
```powershell
.\verify-manifest.ps1
```

### GitHub Secrets 확인
```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' secret list
```

---

## 📚 참고 문서

- [TON Wallet - TON Connect 공식 가이드](https://help.wallet.tg/article/281-ton-connect-and-how-to-connect-apps)
- [TON Connect Manifest Error 해결](https://help.wallet.tg/article/281-ton-connect-and-how-to-connect-apps#I-am-not-able-to-connect-my-TON-Space-to-an-app-I-receive-an-App-Mani-9AXLQ)
- [GitHub Actions - Cloudflare Workers](https://github.com/cloudflare/wrangler-action)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

---

## ✅ 체크리스트

- [x] Manifest 필드명 수정 (`privacyUrl`)
- [x] CORS 헤더 추가
- [x] GitHub Actions 설정 완료
- [x] Cloudflare Workers 배포 성공
- [x] 검증 스크립트 작성
- [ ] 모바일에서 TON Wallet 연결 테스트
- [ ] 입금/출금 기능 테스트

---

**마지막 업데이트**: 2025-11-02 15:30 (KST)  
**상태**: ✅ 배포 완료, 테스트 대기 중
