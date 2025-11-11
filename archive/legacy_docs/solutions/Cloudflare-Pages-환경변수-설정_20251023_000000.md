***REMOVED***⚙️ Cloudflare Pages 환경변수 설정 (필수)

> **주의:** 이 설정이 없으면 배포된 게임이 정상 작동하지 않습니다.

---

#***REMOVED***🔑 설정할 환경변수

##***REMOVED***Production 환경 변수

**변수명:**
```
GAME_WALLET_PRIVATE_KEY
```

**값:**
```
[wallet-tools/mnemonic-to-key.mjs 스크립트로 생성한 개인키]
```

**설명:** TON Telegram Wallet V5R1 개인키 (64바이트 = 128자 hex)

⚠️ **보안 주의:** 
- 실제 개인키는 이 문서에 절대 포함하지 마세요
- Cloudflare 대시보드에서만 개인키를 입력하세요
- `wallet-tools/mnemonic-to-key.mjs`로 생성한 privateKey 값을 사용하세요

---

#***REMOVED***📋 설정 단계

##***REMOVED***Step 1: Cloudflare 대시보드 접속
```
https://dash.cloudflare.com
→ Pages
→ candlespinner 프로젝트 선택
```

##***REMOVED***Step 2: 환경 설정 메뉴 접근
```
Settings
  ↓
Environment variables
```

##***REMOVED***Step 3: Production 환경 변수 추가

**추가 방법:**
1. **Add variable** 버튼 클릭
2. 환경 선택: **Production** ✅
3. 변수 정보 입력:
   - **Variable name:** `GAME_WALLET_PRIVATE_KEY`
   - **Value:** `wallet-tools/mnemonic-to-key.mjs`로 생성한 privateKey 값
4. **Save** 클릭

⚠️ **절대 이 문서나 코드에 개인키를 작성하지 마세요**

##***REMOVED***Step 4: 배포
```bash
npm run build
npm run deploy
```

##***REMOVED***Step 5: 검증
```bash
curl https://aiandyou.me/api/debug-private-key
```

**기대 응답:**
```json
{
  "hasPrivateKey": true,
  "addressMatches": true,
  "verification": "✅ 개인키와 지갑 주소가 일치합니다! (V5R1 - Telegram TON Wallet)"
}
```

⚠️ **성공 응답 후:**
- 로컬 터미널 히스토리에서 개인키 관련 명령어 삭제
- 이 문서는 서버에만 보관 (개인키 값 제거됨)

---

#***REMOVED***🔐 보안 확인 체크리스트

배포 전 다음 항목을 확인하세요:

- [ ] `wrangler.toml`에 개인키 없음 ✅
  ```bash
  ***REMOVED***개인키가 있으면 안 됨 (주석만 있어야 함)
  grep "GAME_WALLET_PRIVATE_KEY" wrangler.toml | grep -v "#"
  ```

- [ ] `.gitignore`에 `.env.local` 포함됨 ✅

- [ ] Cloudflare 환경변수에 `GAME_WALLET_PRIVATE_KEY` 설정됨 ✅

- [ ] 로컬 터미널 히스토리 삭제됨 ✅
  ```bash
  ***REMOVED***PowerShell
  Remove-Item (Get-PSReadlineOption).HistorySavePath
  
  ***REMOVED***또는 Clear-History (현재 세션만)
  Clear-History
  ```

---

#***REMOVED***⚠️ 문제 해결

##***REMOVED***Q: "GAME_WALLET_PRIVATE_KEY 환경 변수 미설정" 에러
**A:** Cloudflare 환경변수 다시 확인:
1. Pages → candlespinner → Settings
2. Environment variables 섹션 확인
3. Production 환경에만 설정되어 있나 확인
4. 배포 후 5분 대기 후 재시도

##***REMOVED***Q: addressMatches가 false
**A:** 개인키 값이 잘못됨:
- 값이 정확한 128자인지 확인
- 16진수 문자만 포함되는지 확인
- 앞뒤 공백 없는지 확인
- `wallet-tools/mnemonic-to-key.mjs`로 다시 생성

##***REMOVED***Q: "지갑 생성 실패"
**A:** 개인키 형식 검증:
```bash
***REMOVED***길이 확인 (128자여야 함)
***REMOVED***wallet-tools/mnemonic-to-key.mjs 스크립트 실행하여 privateKey 다시 확인
node wallet-tools/mnemonic-to-key.mjs "your-24-word-mnemonic"
```

---

#***REMOVED***📞 지원

문제가 있으면 Cloudflare 대시보드에서:
- Pages → candlespinner → **Analytics** 탭에서 배포 로그 확인
- Deployments 히스토리에서 최근 배포 상태 확인

