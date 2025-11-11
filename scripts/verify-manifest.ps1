#!/usr/bin/env pwsh
# TON Connect Manifest 검증 스크립트

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║        TON Connect Manifest 검증 스크립트                    ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$manifestUrl = "https://candlespinner-workers.pages.dev/tonconnect-manifest.json"

Write-Host "📋 Manifest URL: $manifestUrl" -ForegroundColor Yellow
Write-Host "`n🔍 검증 중...`n" -ForegroundColor Cyan

try {
    # 1. HTTP 요청
    Write-Host "[1/5] HTTP 요청 테스트..." -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri $manifestUrl -UseBasicParsing -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ HTTP 200 OK" -ForegroundColor Green
    } else {
        Write-Host "  ❌ HTTP $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
    
    # 2. Content-Type 확인
    Write-Host "[2/5] Content-Type 헤더 확인..." -ForegroundColor Gray
    $contentType = $response.Headers['Content-Type']
    if ($contentType -like '*application/json*') {
        Write-Host "  ✅ Content-Type: $contentType" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Content-Type: $contentType (application/json 권장)" -ForegroundColor Yellow
    }
    
    # 3. CORS 헤더 확인
    Write-Host "[3/5] CORS 헤더 확인..." -ForegroundColor Gray
    $corsHeader = $response.Headers['Access-Control-Allow-Origin']
    if ($corsHeader) {
        Write-Host "  ✅ Access-Control-Allow-Origin: $corsHeader" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  CORS 헤더 없음" -ForegroundColor Yellow
    }
    
    # 4. JSON 구조 검증
    Write-Host "[4/5] JSON 구조 검증..." -ForegroundColor Gray
    $manifest = $response.Content | ConvertFrom-Json
    
    $requiredFields = @('url', 'name', 'iconUrl')
    $allFieldsPresent = $true
    
    foreach ($field in $requiredFields) {
        if ($manifest.PSObject.Properties.Name -contains $field) {
            Write-Host "  ✅ $field : $($manifest.$field)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $field : 누락됨" -ForegroundColor Red
            $allFieldsPresent = $false
        }
    }
    
    # 선택적 필드
    $optionalFields = @('termsOfUseUrl', 'privacyUrl')
    foreach ($field in $optionalFields) {
        if ($manifest.PSObject.Properties.Name -contains $field) {
            Write-Host "  ✅ $field : $($manifest.$field)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $field : 없음 (선택사항)" -ForegroundColor Yellow
        }
    }
    
    # 5. 아이콘 URL 접근 테스트
    Write-Host "[5/5] 아이콘 URL 접근 테스트..." -ForegroundColor Gray
    try {
        $iconResponse = Invoke-WebRequest -Uri $manifest.iconUrl -Method Head -UseBasicParsing -TimeoutSec 10
        if ($iconResponse.StatusCode -eq 200) {
            Write-Host "  ✅ 아이콘 접근 가능: $($manifest.iconUrl)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ 아이콘 접근 실패: HTTP $($iconResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ 아이콘 접근 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                  ✅ 검증 완료!                               ║
╚══════════════════════════════════════════════════════════════╝

📱 이제 TON Wallet에서 앱 연결을 시도하세요:
   https://candlespinner-workers.pages.dev

💡 문제가 계속되면:
   1. 디바이스 시간을 '자동 설정'으로 변경
   2. 네트워크 전환 (Wi-Fi ↔ 모바일 데이터)
   3. Telegram 캐시 클리어
   4. 2-3분 후 재시도 (CDN 캐시 업데이트 대기)

"@ -ForegroundColor Green

} catch {
    Write-Host "`n❌ 검증 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 배포가 완료되지 않았을 수 있습니다. 2-3분 후 다시 시도하세요." -ForegroundColor Yellow
    exit 1
}
