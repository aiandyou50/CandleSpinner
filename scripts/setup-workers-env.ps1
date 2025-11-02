# Cloudflare Workers 환경변수 설정 스크립트
# 사용법: .\scripts\setup-workers-env.ps1

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║     🔐 Cloudflare Workers 환경변수 설정                      ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "⚠️  주의: 환경변수는 Cloudflare Dashboard에서 설정해야 합니다." -ForegroundColor Yellow
Write-Host ""

# 필수 환경변수 목록
$requiredVars = @(
    @{
        Name = "GAME_WALLET_MNEMONIC"
        Description = "게임 운영 지갑 니모닉 (24단어)"
        Example = "word1 word2 word3 ... word24"
        IsSecret = $true
    },
    @{
        Name = "GAME_WALLET_ADDRESS"
        Description = "게임 운영 지갑 주소"
        Example = "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
        IsSecret = $false
    },
    @{
        Name = "CSPIN_JETTON_MASTER"
        Description = "CSPIN Jetton Master 주소"
        Example = "EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV"
        IsSecret = $false
    },
    @{
        Name = "CSPIN_JETTON_WALLET"
        Description = "게임의 Jetton Wallet 주소"
        Example = "EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs"
        IsSecret = $false
    },
    @{
        Name = "TONCENTER_API_KEY"
        Description = "TonCenter API Key"
        Example = "abcd1234efgh5678..."
        IsSecret = $true
    }
)

Write-Host "📋 필수 환경변수 목록:" -ForegroundColor Green
Write-Host ""

foreach ($var in $requiredVars) {
    $typeLabel = if ($var.IsSecret) { "[SECRET]" } else { "[PUBLIC]" }
    $typeColor = if ($var.IsSecret) { "Red" } else { "Green" }
    
    Write-Host "  $($var.Name) " -NoNewline
    Write-Host $typeLabel -ForegroundColor $typeColor
    Write-Host "    설명: $($var.Description)" -ForegroundColor Gray
    Write-Host "    예시: $($var.Example)" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                  설정 방법 (2가지 방식)                      ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "방법 1️⃣: Cloudflare Dashboard (권장)" -ForegroundColor Yellow
Write-Host @"
  1. https://dash.cloudflare.com 로그인
  2. Workers & Pages 선택
  3. candlespinner-workers 선택
  4. Settings 탭 → Variables
  5. Add Variable 클릭
  6. 위의 환경변수들을 하나씩 추가
     - Secret 변수: "Encrypt" 체크
     - Public 변수: "Encrypt" 체크 해제
  7. Deploy 버튼 클릭

"@ -ForegroundColor White

Write-Host "방법 2️⃣: Wrangler CLI (커맨드라인)" -ForegroundColor Yellow
Write-Host @"
  # SECRET 변수 (암호화됨)
  npx wrangler secret put GAME_WALLET_MNEMONIC
  npx wrangler secret put TONCENTER_API_KEY
  
  # PUBLIC 변수 (평문)
  # wrangler.toml의 [vars] 섹션에 추가:
  # [vars]
  # GAME_WALLET_ADDRESS = "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
  # CSPIN_JETTON_MASTER = "EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV"
  # CSPIN_JETTON_WALLET = "EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs"

"@ -ForegroundColor White

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║              🔑 TonCenter API Key 발급 방법                  ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host @"
  1. https://toncenter.com 접속
  2. 우측 상단 "API KEY" 클릭
  3. Telegram Bot을 통해 API Key 발급
  4. 발급받은 Key를 TONCENTER_API_KEY에 설정

  💡 무료 플랜 한도:
     - 1초당 1 요청
     - 하루 10,000 요청
     - 게임 서비스에는 충분

"@ -ForegroundColor White

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                    검증 방법                                 ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host @"
  # 환경변수 확인 (SECRET은 표시 안됨)
  npx wrangler secret list
  
  # 로그 확인 (배포 후)
  npx wrangler tail
  
  # 환경변수가 제대로 로드되는지 확인
  # src/index.ts의 console.log 출력 확인

"@ -ForegroundColor White

Write-Host @"

✅ 환경변수 설정 후:
   1. GitHub Actions가 자동 배포
   2. 또는 수동 배포: npm run build && npx wrangler deploy
   3. 입금 기능 테스트

"@ -ForegroundColor Green

# 현재 설정된 Secrets 확인
Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║              현재 설정된 Secrets 확인                         ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

try {
    Write-Host "⏳ Cloudflare Workers Secrets 조회 중..." -ForegroundColor Yellow
    $secrets = npx wrangler secret list --name candlespinner-workers 2>&1
    
    if ($secrets -match "\[\]") {
        Write-Host "❌ 설정된 Secret이 없습니다!" -ForegroundColor Red
        Write-Host "   위의 방법대로 환경변수를 설정해주세요." -ForegroundColor Yellow
    } else {
        Write-Host "✅ 설정된 Secrets:" -ForegroundColor Green
        Write-Host $secrets -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  Secrets 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Cloudflare Dashboard에서 직접 확인해주세요." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Cloudflare Dashboard:" -ForegroundColor Cyan
Write-Host "   https://dash.cloudflare.com/48a09063776ab35c453778ea6ebd0172/workers-and-pages/view/candlespinner-workers/settings/variables" -ForegroundColor Blue
Write-Host ""
