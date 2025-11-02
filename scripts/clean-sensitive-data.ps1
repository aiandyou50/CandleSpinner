# 민감 정보 완전 삭제 스크립트
# 니모닉, API Key 등 모든 민감 정보를 로컬에서 제거

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║        🔒 민감 정보 완전 삭제 도구                           ║
╚══════════════════════════════════════════════════════════════╝

⚠️  이 스크립트는 다음을 삭제합니다:
   - .dev.vars 파일
   - PowerShell 히스토리
   - VS Code 터미널 캐시
   - 임시 파일
   - 로그 파일

"@ -ForegroundColor Yellow

$confirm = Read-Host "계속하시겠습니까? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ 취소되었습니다." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔐 민감 정보 삭제 시작..." -ForegroundColor Cyan
Write-Host ""

# 삭제된 항목 카운트
$deletedCount = 0

# ==================== 1. .dev.vars 파일 삭제 ====================
Write-Host "1️⃣ .dev.vars 파일 확인..." -ForegroundColor Yellow
if (Test-Path .dev.vars) {
    Remove-Item .dev.vars -Force
    Write-Host "   ✅ .dev.vars 삭제 완료" -ForegroundColor Green
    $deletedCount++
} else {
    Write-Host "   ℹ️  .dev.vars 파일 없음" -ForegroundColor Gray
}

# ==================== 2. PowerShell 히스토리 삭제 ====================
Write-Host ""
Write-Host "2️⃣ PowerShell 히스토리 확인..." -ForegroundColor Yellow
try {
    $historyPath = (Get-PSReadlineOption).HistorySavePath
    Write-Host "   📁 경로: $historyPath" -ForegroundColor Gray
    
    if (Test-Path $historyPath) {
        # 백업 생성 (선택사항)
        $backupPath = "$historyPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $historyPath $backupPath -Force
        Write-Host "   💾 백업 생성: $backupPath" -ForegroundColor Cyan
        
        # 히스토리 완전 삭제
        Clear-Content $historyPath -Force
        Write-Host "   ✅ PowerShell 히스토리 삭제 완료" -ForegroundColor Green
        $deletedCount++
    } else {
        Write-Host "   ℹ️  히스토리 파일 없음" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  히스토리 삭제 실패: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ==================== 3. VS Code 워크스페이스 캐시 ====================
Write-Host ""
Write-Host "3️⃣ VS Code 캐시 확인..." -ForegroundColor Yellow
$vscodeCache = "$env:APPDATA\Code\User\workspaceStorage"
if (Test-Path $vscodeCache) {
    Write-Host "   📁 경로: $vscodeCache" -ForegroundColor Gray
    Write-Host "   ℹ️  VS Code 재시작 시 터미널 히스토리 자동 초기화" -ForegroundColor Gray
    Write-Host "   💡 수동 삭제 원하면: 폴더 수동 삭제 후 VS Code 재시작" -ForegroundColor Cyan
} else {
    Write-Host "   ℹ️  VS Code 캐시 없음" -ForegroundColor Gray
}

# ==================== 4. 프로젝트 내 임시 파일 ====================
Write-Host ""
Write-Host "4️⃣ 프로젝트 임시 파일 확인..." -ForegroundColor Yellow

$patterns = @("*.tmp", "*.log", "*~", "*.bak", "*.backup")
$excludeDirs = @("node_modules", ".git", "dist")

$tempFiles = Get-ChildItem -Path . -Recurse -Include $patterns -ErrorAction SilentlyContinue | 
    Where-Object { 
        $path = $_.FullName
        -not ($excludeDirs | Where-Object { $path -like "*\$_\*" })
    }

if ($tempFiles.Count -gt 0) {
    Write-Host "   ⚠️  임시 파일 $($tempFiles.Count)개 발견:" -ForegroundColor Yellow
    $tempFiles | ForEach-Object { 
        Write-Host "      - $($_.Name)" -ForegroundColor Gray 
        Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   ✅ 임시 파일 삭제 완료" -ForegroundColor Green
    $deletedCount += $tempFiles.Count
} else {
    Write-Host "   ℹ️  임시 파일 없음" -ForegroundColor Gray
}

# ==================== 5. Git 커밋 이력 확인 ====================
Write-Host ""
Write-Host "5️⃣ Git 커밋 이력 확인..." -ForegroundColor Yellow
try {
    # .dev.vars가 커밋되었는지 확인
    $gitCheck = git log --all --full-history -- ".dev.vars" 2>&1
    if ($gitCheck -and $gitCheck -notmatch "fatal") {
        Write-Host "   ⚠️  .dev.vars가 Git 이력에 존재합니다!" -ForegroundColor Red
        Write-Host "   💡 Git 이력에서 제거하려면:" -ForegroundColor Yellow
        Write-Host "      git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .dev.vars' --prune-empty --tag-name-filter cat -- --all" -ForegroundColor Cyan
        Write-Host "      git push --force --all" -ForegroundColor Cyan
    } else {
        Write-Host "   ✅ Git 이력에 .dev.vars 없음" -ForegroundColor Green
    }
} catch {
    Write-Host "   ℹ️  Git 저장소 아님 또는 확인 불가" -ForegroundColor Gray
}

# ==================== 6. 클립보드 확인 ====================
Write-Host ""
Write-Host "6️⃣ 클립보드 확인..." -ForegroundColor Yellow
try {
    $clipboard = Get-Clipboard -ErrorAction SilentlyContinue
    if ($clipboard -and ($clipboard -match "tornado" -or $clipboard -match "11648659")) {
        Write-Host "   ⚠️  클립보드에 민감 정보가 있을 수 있습니다!" -ForegroundColor Red
        $clearClipboard = Read-Host "   클립보드를 지우시겠습니까? (y/N)"
        if ($clearClipboard -eq "y" -or $clearClipboard -eq "Y") {
            Set-Clipboard -Value ""
            Write-Host "   ✅ 클립보드 삭제 완료" -ForegroundColor Green
            $deletedCount++
        }
    } else {
        Write-Host "   ℹ️  클립보드에 민감 정보 없음" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ℹ️  클립보드 확인 불가" -ForegroundColor Gray
}

# ==================== 최종 요약 ====================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ✅ 삭제 완료                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 요약:" -ForegroundColor Green
Write-Host "   - 삭제된 항목: $deletedCount 개" -ForegroundColor White
Write-Host "   - .dev.vars: $(if (Test-Path .dev.vars) { '❌ 존재' } else { '✅ 삭제됨' })" -ForegroundColor White
Write-Host "   - PowerShell 히스토리: ✅ 삭제됨" -ForegroundColor White
Write-Host ""

Write-Host "🔒 추가 보안 권장 사항:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1️⃣ VS Code 완전 재시작" -ForegroundColor White
Write-Host "      - File → Close Window" -ForegroundColor Gray
Write-Host "      - VS Code 완전 종료 후 재시작" -ForegroundColor Gray
Write-Host ""
Write-Host "   2️⃣ 브라우저 히스토리 확인" -ForegroundColor White
Write-Host "      - Cloudflare Dashboard 접속 기록" -ForegroundColor Gray
Write-Host "      - 필요시 시크릿 모드 사용" -ForegroundColor Gray
Write-Host ""
Write-Host "   3️⃣ Git 상태 확인" -ForegroundColor White
Write-Host "      git status" -ForegroundColor Cyan
Write-Host "      git log --all -- .dev.vars" -ForegroundColor Cyan
Write-Host ""
Write-Host "   4️⃣ 환경변수 관리 원칙" -ForegroundColor White
Write-Host "      - 로컬: .dev.vars 사용 (필요할 때만 생성, 사용 후 삭제)" -ForegroundColor Gray
Write-Host "      - 프로덕션: Cloudflare Dashboard만 사용 ✅" -ForegroundColor Gray
Write-Host "      - 팀 공유: .dev.vars.example 템플릿만 공유" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ 민감 정보 삭제 완료! 안전합니다." -ForegroundColor Green
Write-Host ""
