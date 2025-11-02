# Git 히스토리 정리 자동화 스크립트 (PowerShell)
# 
# 사용법: .\run-clean.ps1
# 
# ⚠️ 경고: 이 스크립트는 Git 히스토리를 영구적으로 변경합니다!
# 실행 전 반드시:
# 1. 노출된 토큰을 무효화(회전)하세요
# 2. 백업을 생성하세요
# 3. 협업자에게 통보하세요

param(
    [switch]$Force,
    [switch]$SkipBackup
)

$ErrorActionPreference = "Stop"

# 색상 출력 함수
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 현재 디렉터리 확인
$currentDir = Get-Location
if (-not (Test-Path ".git")) {
    Write-ColorOutput "❌ 오류: Git 저장소가 아닙니다. CandleSpinner 루트 디렉터리에서 실행하세요." "Red"
    exit 1
}

Write-ColorOutput "🚀 Git 히스토리 정리를 시작합니다..." "Cyan"
Write-ColorOutput ""

# 사전 확인
if (-not $Force) {
    Write-ColorOutput "⚠️  다음 사항을 확인하셨나요?" "Yellow"
    Write-ColorOutput "1. ✅ 노출된 토큰을 무효화(회전)했나요?" "Yellow"
    Write-ColorOutput "2. ✅ 새 토큰을 GitHub Secrets에 등록했나요?" "Yellow"
    Write-ColorOutput "3. ✅ 협업자에게 사전 통보했나요? (해당 시)" "Yellow"
    Write-ColorOutput ""
    
    $confirmation = Read-Host "계속하시겠습니까? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-ColorOutput "작업이 취소되었습니다." "Yellow"
        exit 0
    }
}

# git-filter-repo 설치 확인
Write-ColorOutput "📦 git-filter-repo 확인 중..." "Cyan"
$filterRepoInstalled = $false

try {
    $null = git filter-repo --version 2>&1
    $filterRepoInstalled = $true
    Write-ColorOutput "✅ git-filter-repo 설치됨" "Green"
} catch {
    Write-ColorOutput "❌ git-filter-repo가 설치되지 않았습니다." "Red"
    Write-ColorOutput ""
    Write-ColorOutput "설치 방법:" "Yellow"
    Write-ColorOutput "  pip install git-filter-repo" "White"
    Write-ColorOutput "  또는" "White"
    Write-ColorOutput "  python -m pip install git-filter-repo" "White"
    Write-ColorOutput ""
    exit 1
}

# 백업 생성
if (-not $SkipBackup) {
    Write-ColorOutput "💾 백업 생성 중..." "Cyan"
    $backupDir = "..\CandleSpinner-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    try {
        git clone --mirror . "$backupDir"
        Write-ColorOutput "✅ 백업 생성 완료: $backupDir" "Green"
    } catch {
        Write-ColorOutput "❌ 백업 생성 실패: $_" "Red"
        exit 1
    }
}

# replace-token.txt 파일 확인
$replaceFile = "scripts\clean-secrets\replace-token.txt"
if (-not (Test-Path $replaceFile)) {
    Write-ColorOutput "❌ $replaceFile 파일이 없습니다." "Red"
    Write-ColorOutput ""
    Write-ColorOutput "replace-token.txt.example을 복사하여 사용하세요:" "Yellow"
    Write-ColorOutput "  Copy-Item scripts\clean-secrets\replace-token.txt.example scripts\clean-secrets\replace-token.txt" "White"
    exit 1
}

Write-ColorOutput ""
Write-ColorOutput "📄 사용할 replace 파일:" "Cyan"
Get-Content $replaceFile | ForEach-Object {
    if ($_ -match "^#" -or [string]::IsNullOrWhiteSpace($_)) {
        return
    }
    $parts = $_ -split "==>"
    if ($parts.Length -eq 2) {
        $masked = $parts[0].Substring(0, [Math]::Min(10, $parts[0].Length)) + "..."
        Write-ColorOutput "  $masked ==> $($parts[1])" "White"
    }
}
Write-ColorOutput ""

# 최종 확인
if (-not $Force) {
    $confirmation = Read-Host "히스토리 재작성을 시작하시겠습니까? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-ColorOutput "작업이 취소되었습니다." "Yellow"
        exit 0
    }
}

# git-filter-repo 실행
Write-ColorOutput ""
Write-ColorOutput "🔧 git-filter-repo 실행 중..." "Cyan"
Write-ColorOutput "   (이 작업은 수 분 소요될 수 있습니다)" "Gray"
Write-ColorOutput ""

try {
    git filter-repo --replace-text $replaceFile --force
    Write-ColorOutput "✅ 히스토리 재작성 완료!" "Green"
} catch {
    Write-ColorOutput "❌ git-filter-repo 실행 실패: $_" "Red"
    exit 1
}

# 원격 저장소 다시 추가
Write-ColorOutput ""
Write-ColorOutput "🔗 원격 저장소 재설정 중..." "Cyan"

try {
    $remoteUrl = "https://github.com/aiandyou50/CandleSpinner.git"
    git remote add origin $remoteUrl
    Write-ColorOutput "✅ 원격 저장소 추가 완료" "Green"
} catch {
    Write-ColorOutput "⚠️  원격 저장소 추가 실패 (이미 존재할 수 있음): $_" "Yellow"
}

# 검증
Write-ColorOutput ""
Write-ColorOutput "🔍 변경사항 검증 중..." "Cyan"

$searchResult = git log --all --full-history -p -S "8312991368" 2>&1
if ([string]::IsNullOrWhiteSpace($searchResult)) {
    Write-ColorOutput "✅ 토큰이 히스토리에서 완전히 제거되었습니다!" "Green"
} else {
    Write-ColorOutput "⚠️  경고: 토큰이 여전히 히스토리에 존재할 수 있습니다" "Yellow"
    Write-ColorOutput "   수동으로 확인하세요: git log --all -p -S '8312991368'" "Yellow"
}

# 푸시 안내
Write-ColorOutput ""
Write-ColorOutput "✅ 히스토리 정리 완료!" "Green"
Write-ColorOutput ""
Write-ColorOutput "📤 다음 명령으로 원격 저장소에 강제 푸시하세요:" "Cyan"
Write-ColorOutput ""
Write-ColorOutput "  git push --force --all" "White"
Write-ColorOutput "  git push --force --tags" "White"
Write-ColorOutput ""
Write-ColorOutput "⚠️  주의사항:" "Yellow"
Write-ColorOutput "  - 강제 푸시 후에는 되돌릴 수 없습니다" "Yellow"
Write-ColorOutput "  - 다른 컴퓨터나 협업자는 저장소를 다시 클론해야 합니다" "Yellow"
Write-ColorOutput "  - 로컬 브랜치가 있다면 삭제 후 다시 체크아웃하세요" "Yellow"
Write-ColorOutput ""

$pushNow = Read-Host "지금 바로 강제 푸시하시겠습니까? (yes/no)"
if ($pushNow -eq "yes") {
    Write-ColorOutput ""
    Write-ColorOutput "📤 원격 저장소에 강제 푸시 중..." "Cyan"
    
    try {
        git push --force --all
        git push --force --tags
        Write-ColorOutput "✅ 강제 푸시 완료!" "Green"
        Write-ColorOutput ""
        Write-ColorOutput "🎉 모든 작업이 완료되었습니다!" "Green"
        Write-ColorOutput "   GitHub에서 히스토리를 확인해보세요." "Green"
    } catch {
        Write-ColorOutput "❌ 강제 푸시 실패: $_" "Red"
        Write-ColorOutput ""
        Write-ColorOutput "수동으로 푸시하세요:" "Yellow"
        Write-ColorOutput "  git push --force --all" "White"
        Write-ColorOutput "  git push --force --tags" "White"
    }
} else {
    Write-ColorOutput ""
    Write-ColorOutput "수동으로 푸시하려면 위 명령을 실행하세요." "Yellow"
}

Write-ColorOutput ""
Write-ColorOutput "📋 완료 체크리스트:" "Cyan"
Write-ColorOutput "  [ ] git push --force 완료" "White"
Write-ColorOutput "  [ ] GitHub에서 토큰 제거 확인" "White"
Write-ColorOutput "  [ ] GitHub Secrets에 새 토큰 등록 확인" "White"
Write-ColorOutput "  [ ] CI/CD 정상 작동 확인" "White"
Write-ColorOutput ""
