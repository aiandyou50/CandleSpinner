# .dev.vars 파일 자동 생성 스크립트
# Cloudflare Dashboard에서 설정한 환경변수를 로컬 개발 환경에 동기화

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║        🔐 Wrangler 로컬 개발 환경변수 설정                   ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# .dev.vars 파일 경로
$devVarsPath = ".dev.vars"
$devVarsExamplePath = ".dev.vars.example"

# .dev.vars 파일이 이미 존재하는지 확인
if (Test-Path $devVarsPath) {
    Write-Host "⚠️  .dev.vars 파일이 이미 존재합니다." -ForegroundColor Yellow
    $overwrite = Read-Host "덮어쓰시겠습니까? (y/N)"
    
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "❌ 취소되었습니다. 기존 파일을 유지합니다." -ForegroundColor Red
        exit
    }
}

Write-Host @"

📋 환경변수 입력 안내:

⚠️  주의: 입력한 값은 로컬 .dev.vars 파일에 저장됩니다.
         이 파일은 .gitignore에 포함되어 있어 Git에 커밋되지 않습니다.

💡 Cloudflare Dashboard에 이미 설정한 값과 동일하게 입력하세요.

"@ -ForegroundColor Cyan

# 환경변수 입력 받기
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 1. TONCENTER_API_KEY (SECRET)
Write-Host "1️⃣ TONCENTER_API_KEY (SECRET)" -ForegroundColor Yellow
Write-Host "   설명: TonCenter API Key" -ForegroundColor Gray
Write-Host "   발급: https://toncenter.com → API KEY 클릭" -ForegroundColor Gray
$TONCENTER_API_KEY = Read-Host "   값 입력"
Write-Host ""

# 2. GAME_WALLET_MNEMONIC (SECRET)
Write-Host "2️⃣ GAME_WALLET_MNEMONIC (SECRET)" -ForegroundColor Yellow
Write-Host "   설명: 게임 운영 지갑 니모닉 (24단어)" -ForegroundColor Gray
Write-Host "   형식: word1 word2 word3 ... word24" -ForegroundColor Gray
$GAME_WALLET_MNEMONIC = Read-Host "   값 입력"
Write-Host ""

# 3. GAME_WALLET_ADDRESS (PUBLIC)
Write-Host "3️⃣ GAME_WALLET_ADDRESS (PUBLIC)" -ForegroundColor Green
Write-Host "   설명: 게임 운영 지갑 주소" -ForegroundColor Gray
Write-Host "   기본값: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd" -ForegroundColor DarkGray
$GAME_WALLET_ADDRESS = Read-Host "   값 입력 (엔터=기본값)"
if ([string]::IsNullOrWhiteSpace($GAME_WALLET_ADDRESS)) {
    $GAME_WALLET_ADDRESS = "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
}
Write-Host ""

# 4. CSPIN_JETTON_MASTER (PUBLIC)
Write-Host "4️⃣ CSPIN_JETTON_MASTER (PUBLIC)" -ForegroundColor Green
Write-Host "   설명: CSPIN Jetton Master 주소" -ForegroundColor Gray
Write-Host "   기본값: EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV" -ForegroundColor DarkGray
$CSPIN_JETTON_MASTER = Read-Host "   값 입력 (엔터=기본값)"
if ([string]::IsNullOrWhiteSpace($CSPIN_JETTON_MASTER)) {
    $CSPIN_JETTON_MASTER = "EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV"
}
Write-Host ""

# 5. CSPIN_JETTON_WALLET (PUBLIC)
Write-Host "5️⃣ CSPIN_JETTON_WALLET (PUBLIC)" -ForegroundColor Green
Write-Host "   설명: 게임의 Jetton Wallet 주소" -ForegroundColor Gray
Write-Host "   기본값: EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs" -ForegroundColor DarkGray
$CSPIN_JETTON_WALLET = Read-Host "   값 입력 (엔터=기본값)"
if ([string]::IsNullOrWhiteSpace($CSPIN_JETTON_WALLET)) {
    $CSPIN_JETTON_WALLET = "EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs"
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 입력값 검증
Write-Host "🔍 입력값 검증 중..." -ForegroundColor Yellow

$hasError = $false

if ([string]::IsNullOrWhiteSpace($TONCENTER_API_KEY)) {
    Write-Host "❌ TONCENTER_API_KEY가 비어있습니다!" -ForegroundColor Red
    $hasError = $true
}

if ([string]::IsNullOrWhiteSpace($GAME_WALLET_MNEMONIC)) {
    Write-Host "❌ GAME_WALLET_MNEMONIC이 비어있습니다!" -ForegroundColor Red
    $hasError = $true
} else {
    $wordCount = ($GAME_WALLET_MNEMONIC -split '\s+').Count
    if ($wordCount -ne 24) {
        Write-Host "⚠️  경고: GAME_WALLET_MNEMONIC은 24개 단어여야 합니다. (현재: $wordCount개)" -ForegroundColor Yellow
    }
}

if ($hasError) {
    Write-Host ""
    Write-Host "❌ 필수 값이 누락되었습니다. 다시 실행해주세요." -ForegroundColor Red
    exit 1
}

# .dev.vars 파일 생성
Write-Host "📝 .dev.vars 파일 생성 중..." -ForegroundColor Yellow

$devVarsContent = @"
# Wrangler 로컬 개발용 환경변수
# 이 파일은 절대 커밋하지 마세요! (.gitignore에 추가됨)
# 생성일: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# ===== SECRET 변수 =====
TONCENTER_API_KEY=$TONCENTER_API_KEY
GAME_WALLET_MNEMONIC=$GAME_WALLET_MNEMONIC

# ===== PUBLIC 변수 =====
GAME_WALLET_ADDRESS=$GAME_WALLET_ADDRESS
CSPIN_JETTON_MASTER=$CSPIN_JETTON_MASTER
CSPIN_JETTON_WALLET=$CSPIN_JETTON_WALLET
"@

try {
    Set-Content -Path $devVarsPath -Value $devVarsContent -Encoding UTF8
    Write-Host "✅ .dev.vars 파일이 생성되었습니다!" -ForegroundColor Green
} catch {
    Write-Host "❌ .dev.vars 파일 생성 실패: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                    ✅ 설정 완료!                             ║
╚══════════════════════════════════════════════════════════════╝

📁 생성된 파일: .dev.vars

🔐 설정된 환경변수:
   ✅ TONCENTER_API_KEY ($(if ($TONCENTER_API_KEY.Length -gt 10) { $TONCENTER_API_KEY.Substring(0, 10) + "..." } else { "설정됨" }))
   ✅ GAME_WALLET_MNEMONIC ($(($GAME_WALLET_MNEMONIC -split '\s+').Count)개 단어)
   ✅ GAME_WALLET_ADDRESS ($($GAME_WALLET_ADDRESS.Substring(0, 10))...)
   ✅ CSPIN_JETTON_MASTER ($($CSPIN_JETTON_MASTER.Substring(0, 10))...)
   ✅ CSPIN_JETTON_WALLET ($($CSPIN_JETTON_WALLET.Substring(0, 10))...)

🚀 다음 단계:

1. 로컬 개발 서버 실행:
   
   npx wrangler dev
   
   또는
   
   npm run dev  (Vite + Workers)

2. 환경변수 사용 (src/index.ts):
   
   export default {
     async fetch(request, env) {
       const apiKey = env.TONCENTER_API_KEY;
       const mnemonic = env.GAME_WALLET_MNEMONIC;
       // ...
     }
   }

3. 환경변수 확인:
   
   콘솔에 로그가 출력되는지 확인
   "TONCENTER_API_KEY: ✅ 설정됨"

⚠️  주의사항:

   - .dev.vars는 로컬 개발 전용입니다
   - 프로덕션은 Cloudflare Dashboard 환경변수 사용
   - .dev.vars는 절대 Git에 커밋하지 마세요!
   - 팀원과 공유할 때는 .dev.vars.example 사용

"@ -ForegroundColor Green

Write-Host "✨ 로컬 개발 환경 동기화 완료!" -ForegroundColor Yellow
