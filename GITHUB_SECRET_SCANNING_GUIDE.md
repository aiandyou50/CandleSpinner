# 🔒 GitHub Secret Scanning 활성화 가이드

> ⚠️ 이 작업은 **레포 관리자 (Jack님)** 만 가능합니다.
> SSH 키로도 GitHub REST API는 호출 가능하지만, repo admin scope 토큰이 필요해서 직접 못 함.

## 📌 활성화 방법 (3분, 1번만)

### 1단계: 레포 Settings 이동
- https://github.com/aiandyou50/CandleSpinner
- 우측 상단 **`Settings`** 탭 클릭
- (조직 레포라면 Admin 권한 필요)

### 2단계: 좌측 메뉴 "Code security and analysis" 클릭
- https://github.com/aiandyou50/CandleSpinner/settings/security_analysis

### 3단계: 4개 모두 ON ✅

| 기능 | ON 시 효과 |
|---|---|
| **Dependency graph** | npm 의존성 트리 자동 추적 |
| **Dependabot alerts** | 새 CVE 발견 시 알림 |
| **Dependabot security updates** | CVE 패치 PR 자동 생성 |
| **Secret scanning** | 커밋에서 API 키 자동 탐지 |
| **Push protection** | 시크릿 포함 커밋 push 차단 |

> 💡 **Secret scanning + Push protection**이 가장 중요 (이미 마스킹했지만 재발 방지)

### 4단계: Dependabot 설정 (선택)
- 좌측 "Code security and analysis" → **Dependabot** 섹션
- 또는 `.github/dependabot.yml` 생성:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    # 그룹으로 묶어서 한 PR에 몰아넣기
    groups:
      production:
        dependency-type: "production"
      development:
        dependency-type: "development"
```

## 🎯 부가 효과

활성화 후:
- GitHub이 주기적으로 스캔
- 새 CVE 발견 시 Issue/PR 자동 생성
- 시크릿 발견 시 알림 → 즉시 revoke 가능

## ⚙️ GitHub CLI로 자동화 (선택)

`gh` CLI가 설치되어 있다면 다음 한 줄로 가능:

```bash
gh auth login
gh api -X PATCH /repos/aiandyou50/CandleSpinner \
  -f security_and_analysis='{
    "secret_scanning": {"status": "enabled"},
    "secret_scanning_push_protection": {"status": "enabled"},
    "dependabot_security_updates": {"status": "enabled"}
  }'
```

근데 gh CLI는 sudo apt install gh 필요.

## 📊 활성화 후 Antifrag 재진단

Secret Scanning이 ON 상태면 Antifrag가 "재발 방지 메커니즘 있음"으로 점수 가산하는 경우가 있어요. D단계 완료 후 재진단 요청해 주세요!
