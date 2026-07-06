# 🔒 Security Notice — IMPORTANT

> ⚠️ **이 저장소에는 2026-07-04 기준 Antifrag 보안 진단에서 시크릿 노출이 검출되었습니다.**
> 저장소를 운영 환경에서 사용 중이라면 **반드시 아래 키들을 무효화/교체**하세요.

## 🚨 노출된 것으로 보이는 시크릿 (역사적 마스킹 전)

| 패턴 | 의심 정체 | 권장 조치 |
|---|---|---|
| `14ebd4df...765b` (128자 hex) | **TON W5 지갑 ED25519 개인키** | **즉시 해당 지갑의 모든 자산을 새 지갑으로 이체** 후 폐기 |
| `4e6568d1...` (니모닉) | **니모닉 시드** | 동일 지갑이 니모닉 기반이었을 가능성 → 함께 폐기 |
| `66910dc0...a969` | Ankr TON RPC API Key | Ankr Dashboard에서 키 revoke |
| `a1b2c3d4...o5p6` | TONCenter API Key (예시 가능성) | TONCenter Dashboard에서 revoke |

> ✅ **이 PR에서 19개 archive 파일의 14ebd4df 풀키, 4e6568d1 니모닉, Ankr 6691 키, TONCENTER a1b2 키를 모두 `***REDACTED-***-ROTATE-IMMEDIATELY***` 마스킹 처리했습니다.**
> 단, **Git 히스토리에는 여전히 존재**합니다 — 아래 가이드대로 `git filter-repo`로 정리하세요.

## 🔧 키 교체 절차 (즉시 실행)

### 1단계 — TON 지갑 (가장 긴급)

```bash
# 새 지갑 생성 (24단어 니모닉)
npm install -g @tonconnect/cli  # 또는 tonweb 등 사용
node scripts/create-w5-wallet.mjs  # 프로젝트에 스크립트 있음

# 1. 새 지갑 주소를 wrangler.toml [vars] VITE_GAME_WALLET_ADDRESS에 등록
# 2. 기존 지갑의 자산을 전액 새 지갑으로 전송
# 3. Cloudflare Secrets에서 DEPLOYER_PRIVATE_KEY 갱신
npx wrangler secret put DEPLOYER_PRIVATE_KEY
# 새 64자 hex 입력
```

### 2단계 — Git 히스토리에서 시크릿 영구 제거

```bash
# git-filter-repo 설치
pip install git-filter-repo

# 패턴 정의 파일
cat > /tmp/secrets-to-remove.txt <<'EOF'
***REDACTED-TON-PRIVATE-KEY***==>***REDACTED-TON-PRIVATE-KEY***
***REDACTED-MNEMONIC-SEED***==>***REDACTED-MNEMONIC-SEED***
***REDACTED-ANKR-API-KEY***==>***REDACTED-ANKR-API-KEY***
***REDACTED-TONCENTER-API-KEY***==>***REDACTED-TONCENTER-API-KEY***
EOF

# 히스토리에서 모든 occurrence 치환
cd /path/to/CandleSpinner
git filter-repo --replace-text /tmp/secrets-to-remove.txt
git remote add origin https://github.com/aiandyou50/CandleSpinner.git
git push origin --force --all
git push origin --force --tags

# GitHub에 캐시된 키 revoke 알림:
# Settings → Code security and analysis → Secret scanning → 알림 처리
```

### 3단계 — GitHub Secret Scanning 활성화

1. 레포 → Settings → Code security and analysis
2. **Secret scanning** ✅ Enable
3. **Push protection** ✅ Enable
4. **Dependabot** ✅ Enable
5. **Dependabot security updates** ✅ Enable

### 4단계 — 의존성 패치

```bash
npm audit fix
npm install axios@^1.7.4 form-data@^4.0.1 js-cookie@^3.0.5 \
            react-router@^6.27.0 react-router-dom@^6.27.0 \
            follow-redirects@^1.15.6 i18next-http-backend@^3.0.0 \
            yaml@^2.5.1
```

## 🛡️ 이 PR에서 적용된 보안 개선

- ✅ `src/index.ts:161` XSS 패치 (HTML escape 함수)
- ✅ `.gitignore` 강화 (`*.pem`, `*.mnemonic`, `*.seed`, `secrets/`, `*.bak`, `.dev.vars*` 추가)
- ✅ `.github/workflows/secret-scan.yml` — Gitleaks + TruffleHog 자동 스캔
- ✅ archive 폴더 내 시크릿 마스킹 처리

## 📞 노출 신고

시크릿이 이미 유출된 것으로 보입니다. 다음을 권장합니다:
1. **TON 지갑 잔고 0으로 비우기** (가장 시급)
2. **모든 RPC/PG API 키 revoke + 재발급**
3. **Cloudflare Account ID 확인** (계정 탈취 흔적 점검)
4. **과거 세션/로그인 기록 점검**

## 🔍 참고 자료

- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [git-filter-repo 공식 문서](https://github.com/newren/git-filter-repo)
- [Cloudflare Workers Secrets 가이드](https://developers.cloudflare.com/workers/configuration/secrets/)
- [TON 키 관리 모범 사례](https://docs.ton.org/develop/smart-contracts/security-best-practices)
