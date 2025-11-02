# Git 히스토리에서 민감정보 제거 가이드

## ⚠️ 중요 사전 조치

**반드시 다음 순서를 지켜주세요:**

1. ✅ **먼저 노출된 토큰/키를 무효화(회전)하세요**
   - 텔레그램 봇: BotFather → /revoke → /newtoken
   - API 키: 해당 서비스에서 재발급
   - 이미 노출된 토큰은 히스토리를 지워도 공격자가 복사했을 수 있습니다

2. ✅ **새 토큰을 GitHub Secrets에 등록하세요**
   - Repository → Settings → Secrets and variables → Actions
   - 환경변수로만 사용하고 절대 코드에 하드코딩하지 마세요

3. ✅ **협업자에게 사전 통보하세요** (해당되는 경우)
   - 히스토리 재작성 후 모든 협업자는 저장소를 다시 클론해야 합니다
   - 기존 로컬 브랜치는 사용 불가합니다

## 발견된 민감정보

### 텔레그램 봇 토큰
- **파일**: `setup-bot.js`
- **커밋**: `8187036` (2025-10-20 22:58:19)
- **토큰**: `8312991368:AAF5csKvKGhVC_67Teb2Yb8Su37JQMbjfw4`
- **상태**: 커밋 `7ccb058`에서 파일 삭제되었으나 Git 히스토리에 여전히 존재

## 히스토리 정리 방법

### 옵션 1: git-filter-repo (권장)

#### 설치
```bash
# Python pip으로 설치
pip install git-filter-repo

# 또는 직접 다운로드
# https://github.com/newren/git-filter-repo
```

#### 실행 (PowerShell)
```powershell
# 1. 현재 디렉터리 확인
cd C:\Users\x0051\Desktop\DEV\CandleSpinner

# 2. 백업 생성 (권장)
cd ..
git clone --mirror CandleSpinner CandleSpinner-backup.git

# 3. 원본 디렉터리로 돌아가기
cd CandleSpinner

# 4. replace 파일 생성
@"
8312991368:AAF5csKvKGhVC_67Teb2Yb8Su37JQMbjfw4==>[REDACTED_TELEGRAM_BOT_TOKEN]
"@ | Out-File -Encoding utf8 replace-token.txt

# 5. git-filter-repo 실행
git filter-repo --replace-text replace-token.txt --force

# 6. 원격 저장소 다시 추가 (filter-repo가 제거함)
git remote add origin https://github.com/aiandyou50/CandleSpinner.git

# 7. 강제 푸시
git push --force --all
git push --force --tags

# 8. 정리
Remove-Item replace-token.txt
```

### 옵션 2: BFG Repo-Cleaner (대안)

```powershell
# 1. BFG 다운로드
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. replace 파일 생성
@"
8312991368:AAF5csKvKGhVC_67Teb2Yb8Su37JQMbjfw4==>[REDACTED]
"@ | Out-File -Encoding utf8 replacements.txt

# 3. 미러 클론
git clone --mirror https://github.com/aiandyou50/CandleSpinner.git

# 4. BFG 실행
java -jar bfg.jar --replace-text replacements.txt CandleSpinner.git

# 5. 정리 및 푸시
cd CandleSpinner.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

## 실행 후 검증

```powershell
# 토큰이 완전히 제거되었는지 확인
git log --all --full-history -p -S "8312991368"
# 결과가 없어야 함

# 파일 내용 확인
git show 8187036:setup-bot.js
# [REDACTED_TELEGRAM_BOT_TOKEN]으로 표시되어야 함
```

## 주의사항

1. **파괴적 작업**: 이 작업은 Git 히스토리를 영구적으로 변경합니다
2. **백업 필수**: 작업 전 반드시 백업을 만드세요
3. **협업자 재클론**: 모든 팀원이 저장소를 다시 클론해야 합니다
4. **PR/이슈 영향**: 기존 PR의 커밋 해시가 변경됩니다
5. **포크 영향**: 이 저장소를 포크한 다른 저장소는 영향받지 않습니다 (별도 정리 필요)

## 문제 해결

### "remote: error: GH013: Repository rule violations"
- Branch protection rules을 일시적으로 비활성화하세요
- Settings → Branches → Branch protection rules

### "Cannot force push"
- 저장소 권한을 확인하세요 (Admin 권한 필요)
- 2FA가 활성화된 경우 Personal Access Token 사용

### "git-filter-repo not found"
```powershell
pip install --user git-filter-repo
# 또는
python -m pip install git-filter-repo
```

## 완료 후 체크리스트

- [ ] Git 히스토리에서 토큰 완전 제거 확인
- [ ] 새 토큰으로 GitHub Secrets 업데이트
- [ ] 로컬 저장소 재클론 또는 `git pull --rebase` 실행
- [ ] CI/CD 파이프라인 정상 작동 확인
- [ ] README에 보안 개선 사항 기록 (선택)

## 참고 자료

- [git-filter-repo 공식 문서](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
