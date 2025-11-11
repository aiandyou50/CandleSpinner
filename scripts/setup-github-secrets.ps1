#!/usr/bin/env pwsh
# GitHub Secrets 설정 스크립트

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║     CandleSpinner - GitHub Secrets 자동 설정 스크립트        ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# 1. Cloudflare Account ID 설정 (이미 완료됨)
Write-Host "✅ CLOUDFLARE_ACCOUNT_ID 이미 설정됨" -ForegroundColor Green

# 2. Cloudflare API Token 설정
Write-Host "`n📋 Cloudflare API Token을 입력하세요:" -ForegroundColor Yellow
Write-Host "   (Token 생성: https://dash.cloudflare.com/profile/api-tokens)" -ForegroundColor Gray
Write-Host "   → 'Create Token' → 'Edit Cloudflare Workers' 템플릿 선택`n" -ForegroundColor Gray

# Token 입력 (표시됨)
$token = Read-Host "Token"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "`n❌ Token이 입력되지 않았습니다." -ForegroundColor Red
    exit 1
}

# Token 검증
if ($token.Length -lt 40) {
    Write-Host "`n⚠️  Token이 너무 짧습니다. 올바른 Token인지 확인하세요." -ForegroundColor Yellow
}

# GitHub Secret으로 설정
Write-Host "`n🔄 GitHub Secret 설정 중..." -ForegroundColor Cyan
try {
    $token | & "C:\Program Files\GitHub CLI\gh.exe" secret set CLOUDFLARE_API_TOKEN
    Write-Host "✅ CLOUDFLARE_API_TOKEN 설정 완료!" -ForegroundColor Green
} catch {
    Write-Host "❌ Secret 설정 실패: $_" -ForegroundColor Red
    exit 1
}

# 3. 설정 확인
Write-Host "`n📋 현재 설정된 GitHub Secrets:" -ForegroundColor Cyan
& "C:\Program Files\GitHub CLI\gh.exe" secret list

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                     설정 완료!                               ║
║                                                              ║
║  이제 GitHub Actions가 정상적으로 작동합니다.                ║
║  https://github.com/aiandyou50/CandleSpinner/actions         ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green
