***REMOVED***Cloudflare 인증 및 배포 설정 가이드

#***REMOVED***🔐 1. Cloudflare 인증 방법

##***REMOVED***현재 상태
```bash
npx wrangler whoami
***REMOVED***결과: sungyo0518@gmail.com로 로그인됨
```

##***REMOVED***인증 방법

###***REMOVED***A. OAuth 로그인 (현재 사용 중)
```bash
npx wrangler login
```
- 브라우저가 열리고 Cloudflare에 로그인
- OAuth Token이 로컬에 저장됨
- **저장 위치:**
  - Windows: `%USERPROFILE%\.wrangler\config\`
  - Mac/Linux: `~/.wrangler/config/`

###***REMOVED***B. API Token (GitHub Actions용)
Cloudflare Dashboard에서 생성:
1. https://dash.cloudflare.com/profile/api-tokens
2. "Create Token" 클릭
3. "Edit Cloudflare Workers" 템플릿 선택
4. 권한 설정:
   - Account: Workers Scripts (Edit)
   - Account: Workers KV Storage (Edit)
   - Zone: Workers Routes (Edit)
5. Token 생성 → 복사

###***REMOVED***C. Global API Key (비추천)
- 모든 권한을 가진 마스터 키
- 보안상 위험하므로 사용 금지

#***REMOVED***📦 2. 배포 방법

##***REMOVED***A. 수동 배포 (현재 방법)
```bash
***REMOVED***1. 프로젝트 빌드
npm run build

***REMOVED***2. Wrangler로 배포
npx wrangler deploy

***REMOVED***또는 한 번에
npm run build && npx wrangler deploy
```

##***REMOVED***B. GitHub Actions 자동 배포 (권장)

###***REMOVED***1단계: GitHub Secrets 설정
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 추가할 Secrets:

```
Name: CLOUDFLARE_API_TOKEN
Value: <Cloudflare에서 생성한 API Token>

Name: CLOUDFLARE_ACCOUNT_ID
Value: 48a09063776ab35c453778ea6ebd0172
```

###***REMOVED***2단계: 워크플로우 파일 확인
`.github/workflows/deploy.yml` 파일이 생성되었습니다.

###***REMOVED***3단계: 테스트
```bash
git add .
git commit -m "chore: Add GitHub Actions workflow"
git push origin main
```

→ GitHub Actions 탭에서 배포 진행 상황 확인

#***REMOVED***🔍 3. 현재 프로젝트 상태

##***REMOVED***Cloudflare 계정
- **Email:** sungyo0518@gmail.com
- **Account ID:** 48a09063776ab35c453778ea6ebd0172

##***REMOVED***Workers 프로젝트
- **Name:** candlespinner-workers
- **Type:** Workers (Pages가 아님!)
- **Domain:** aiandyou.me (Custom Domain)
- **마지막 배포:** 2025-11-02T03:59:49 (오늘)

##***REMOVED***KV Namespace
- **Binding:** CREDIT_KV
- **ID:** 0190e4e479144180a5e0ee7bd47b959b

#***REMOVED***🚀 4. 배포 명령어 정리

##***REMOVED***개발 모드
```bash
npm run dev          ***REMOVED***Vite 로컬 서버
npx wrangler dev     ***REMOVED***Workers 로컬 서버
```

##***REMOVED***프로덕션 배포
```bash
***REMOVED***방법 1: 빌드 + 배포 (현재 사용)
npm run build && npx wrangler deploy

***REMOVED***방법 2: package.json 스크립트 추가
npm run deploy  ***REMOVED***package.json에 "deploy" 스크립트 필요
```

##***REMOVED***배포 확인
```bash
***REMOVED***배포 목록 확인
npx wrangler deployments list --name candlespinner-workers

***REMOVED***배포 롤백 (필요시)
npx wrangler rollback --name candlespinner-workers
```

#***REMOVED***📝 5. package.json 스크립트 추가 (권장)

`package.json`에 추가:
```json
{
  "scripts": {
    "deploy": "npm run build && npx wrangler deploy",
    "deploy:watch": "npm run build && npx wrangler deploy --watch"
  }
}
```

사용:
```bash
npm run deploy          ***REMOVED***빌드 + 배포
npm run deploy:watch    ***REMOVED***파일 변경 감지 + 자동 배포
```

#***REMOVED***⚠️ 6. 주의사항

##***REMOVED***A. Pages vs Workers
- **현재:** Workers 프로젝트 ✅
- **잘못된 명령:**
  ```bash
  npx wrangler pages deploy dist  ***REMOVED***❌ Pages 명령 (사용 금지)
  ```
- **올바른 명령:**
  ```bash
  npx wrangler deploy  ***REMOVED***✅ Workers 명령
  ```

##***REMOVED***B. 환경 변수 설정
Cloudflare Dashboard에서 설정:
1. https://dash.cloudflare.com
2. Workers & Pages → candlespinner-workers
3. Settings → Variables
4. 추가 필요한 변수:
   - `GAME_WALLET_MNEMONI` (Secret)
   - `GAME_WALLET_ADDRESS`
   - `CSPIN_JETTON_MASTER`
   - `TONCENTER_API_KEY` (Optional)

##***REMOVED***C. wrangler.toml 설정
```toml
name = "candlespinner-workers"  ***REMOVED***✅ 프로젝트 이름 (변경 금지)
compatibility_date = "2024-11-01"
main = "src/index.ts"
node_compat = true

[assets]
directory = "./dist"  ***REMOVED***✅ Vite 빌드 결과물

[[kv_namespaces]]
binding = "CREDIT_KV"
id = "0190e4e479144180a5e0ee7bd47b959b"
```

#***REMOVED***🔧 7. 트러블슈팅

##***REMOVED***문제: "wrangler: command not found"
```bash
npm install --save-dev wrangler@latest
```

##***REMOVED***문제: "Authentication required"
```bash
npx wrangler logout
npx wrangler login
```

##***REMOVED***문제: "KV namespace not found"
```bash
***REMOVED***wrangler.toml에서 KV ID 확인
npx wrangler kv:namespace list
```

##***REMOVED***문제: "Asset not found"
```bash
***REMOVED***dist 폴더 확인
npm run build
ls dist/  ***REMOVED***또는 dir dist\
```

#***REMOVED***📚 8. 참고 자료

- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)
- [Workers 배포 가이드](https://developers.cloudflare.com/workers/get-started/guide/)
- [GitHub Actions 통합](https://github.com/cloudflare/wrangler-action)
- [KV Storage 문서](https://developers.cloudflare.com/kv/)

---

**작성일:** 2025-11-02  
**작성자:** GitHub Copilot
