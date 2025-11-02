# Cloudflare Custom Domain CORS 검증 스크립트
# 용도: Custom Domain과 Workers Direct URL의 CORS 헤더 비교

param(
    [string]$CustomDomain = "aiandyou.me",
    [string]$WorkersUrl = "candlespinner-workers.x00518.workers.dev"
)

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║           🔍 Custom Domain CORS 검증 도구                    ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# 1. Custom Domain 테스트
Write-Host "1️⃣ Custom Domain 테스트: https://$CustomDomain" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

try {
    $customHeaders = curl -sI "https://$CustomDomain/tonconnect-manifest.json" 2>&1 | Out-String
    
    $hasCorsOrigin = $customHeaders -match "access-control-allow-origin"
    $hasCorsMethods = $customHeaders -match "access-control-allow-methods"
    $hasCorsHeaders = $customHeaders -match "access-control-allow-headers"
    $hasCorsMaxAge = $customHeaders -match "access-control-max-age"
    
    if ($hasCorsOrigin) {
        Write-Host "  ✅ Access-Control-Allow-Origin: 존재" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Access-Control-Allow-Origin: 없음" -ForegroundColor Red
    }
    
    if ($hasCorsMethods) {
        Write-Host "  ✅ Access-Control-Allow-Methods: 존재" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Access-Control-Allow-Methods: 없음" -ForegroundColor Red
    }
    
    if ($hasCorsHeaders) {
        Write-Host "  ✅ Access-Control-Allow-Headers: 존재" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Access-Control-Allow-Headers: 없음" -ForegroundColor Red
    }
    
    if ($hasCorsMaxAge) {
        Write-Host "  ✅ Access-Control-Max-Age: 존재" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Access-Control-Max-Age: 없음" -ForegroundColor Red
    }
    
    $customResult = $hasCorsOrigin -and $hasCorsMethods -and $hasCorsHeaders
    
} catch {
    Write-Host "  ❌ 오류: $($_.Exception.Message)" -ForegroundColor Red
    $customResult = $false
}

Write-Host ""

# 2. Workers Direct URL 테스트
Write-Host "2️⃣ Workers Direct URL 테스트: https://$WorkersUrl" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

try {
    $workersHeaders = curl -sI "https://$WorkersUrl/tonconnect-manifest.json" 2>&1 | Out-String
    
    $hasCorsOrigin = $workersHeaders -match "access-control-allow-origin"
    $hasCorsMethods = $workersHeaders -match "access-control-allow-methods"
    $hasCorsHeaders = $workersHeaders -match "access-control-allow-headers"
    $hasCorsMaxAge = $workersHeaders -match "access-control-max-age"
    
    if ($hasCorsOrigin) {
        Write-Host "  ✅ Access-Control-Allow-Origin: 존재" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Access-Control-Allow-Origin: 없음" -ForegroundColor Red
    }
    
    if ($hasCorsMethods) {
        Write-Host "  ✅ Access-Control-Allow-Methods: 존재" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Access-Control-Allow-Methods: 없음" -ForegroundColor Red
    }
    
    if ($hasCorsHeaders) {
        Write-Host "  ✅ Access-Control-Allow-Headers: 존재" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Access-Control-Allow-Headers: 없음" -ForegroundColor Red
    }
    
    if ($hasCorsMaxAge) {
        Write-Host "  ✅ Access-Control-Max-Age: 존재" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Access-Control-Max-Age: 없음" -ForegroundColor Red
    }
    
    $workersResult = $hasCorsOrigin -and $hasCorsMethods -and $hasCorsHeaders
    
} catch {
    Write-Host "  ❌ 오류: $($_.Exception.Message)" -ForegroundColor Red
    $workersResult = $false
}

Write-Host ""

# 3. Manifest 내용 확인
Write-Host "3️⃣ Manifest 내용 확인" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

try {
    $manifestContent = curl -s "https://$WorkersUrl/tonconnect-manifest.json" 2>&1
    Write-Host $manifestContent -ForegroundColor White
} catch {
    Write-Host "  ❌ Manifest 가져오기 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Icon 접근 확인
Write-Host "4️⃣ Icon 접근 확인" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

try {
    $iconHeaders = curl -sI "https://$WorkersUrl/icon.png" 2>&1 | Out-String
    if ($iconHeaders -match "200 OK") {
        Write-Host "  ✅ Icon 접근 가능 (HTTP 200)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Icon 접근 불가" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ 오류: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 최종 결과
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    📋 검증 결과 요약                         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($customResult) {
    Write-Host "  Custom Domain ($CustomDomain): ✅ CORS 정상" -ForegroundColor Green
} else {
    Write-Host "  Custom Domain ($CustomDomain): ❌ CORS 문제 있음" -ForegroundColor Red
}

if ($workersResult) {
    Write-Host "  Workers URL ($WorkersUrl): ✅ CORS 정상" -ForegroundColor Green
} else {
    Write-Host "  Workers URL ($WorkersUrl): ❌ CORS 문제 있음" -ForegroundColor Red
}

Write-Host ""

# 권장 사항
if (-not $customResult -and $workersResult) {
    Write-Host @"
💡 권장 사항:
   
   Custom Domain에서 CORS 헤더가 누락되었습니다.
   
   ✅ 즉시 해결: Workers Direct URL 사용
      - src/main.tsx: manifestUrl을 Workers URL로 변경
      - public/tonconnect-manifest.json: iconUrl을 Workers URL로 변경
   
   🔧 근본 해결: Cloudflare Dashboard 확인
      1. Transform Rules 점검
      2. Page Rules 점검  
      3. DNS Proxy 상태 확인 (주황색 구름)
      4. Workers Routes 점검
   
   📚 자세한 내용: docs/troubleshooting/TON-Connect-Manifest-CORS-해결가이드.md

"@ -ForegroundColor Yellow
} elseif ($customResult -and $workersResult) {
    Write-Host @"
🎉 모든 검증 통과!
   
   Custom Domain과 Workers URL 모두 CORS 헤더가 정상적으로 적용되어 있습니다.
   TON Connect 연결이 문제없이 작동할 것입니다.

"@ -ForegroundColor Green
} else {
    Write-Host @"
⚠️ 심각한 문제 발견!
   
   Workers URL에서도 CORS 헤더가 누락되었습니다.
   
   🔧 즉시 조치:
      1. src/index.ts에서 CORS 헤더 설정 확인
      2. 배포 후 다시 테스트
      3. 문제 지속 시 Cloudflare 지원팀 문의
   
   📚 자세한 내용: docs/troubleshooting/TON-Connect-Manifest-CORS-해결가이드.md

"@ -ForegroundColor Red
}
