# Clear-MnemonicHistory.ps1
<#
.SYNOPSIS
    암호화폐 지갑 니모닉 코드와 같은 민감한 정보가 포함된 PowerShell 명령 기록을 완전히 삭제합니다.

.DESCRIPTION
    이 스크립트는 다음 두 가지 위치의 명령 기록을 삭제합니다:
    1. PSReadline 히스토리 파일 (PowerShell 세션 간 기록 유지)
    2. 현재 PowerShell 세션의 메모리 내 히스토리

.NOTES
    실행 후, PowerShell 창을 닫고 다시 열어 히스토리가 완전히 삭제되었는지 확인해야 합니다.
    관리자 권한 없이 실행 가능합니다.

.USAGE
    1. 스크립트 파일을 실행합니다. (예: .\\Clear-MnemonicHistory.ps1)
    2. PowerShell 창을 닫았다가 다시 엽니다.
#>

# ----------------------------------------------------
# 1. PSReadline 히스토리 파일 삭제 (영구 기록 삭제)
# ----------------------------------------------------

Write-Host "PSReadline 히스토리 파일 경로를 확인합니다..." -ForegroundColor Yellow

# 히스토리 파일 경로를 가져옵니다. 일반적으로 다음 경로에 위치합니다:
# $env:APPDATA\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
$HistoryFilePath = (Get-PSReadlineOption).HistorySavePath

if (-not [string]::IsNullOrEmpty($HistoryFilePath)) {
    if (Test-Path $HistoryFilePath) {
        # 파일 내용을 삭제 (파일은 유지)
        Clear-Content $HistoryFilePath
        Write-Host "✅ PSReadline 히스토리 파일 내용이 삭제되었습니다: $HistoryFilePath" -ForegroundColor Green
    } else {
        Write-Host "⚠️ PSReadline 히스토리 파일이 존재하지 않습니다. $HistoryFilePath" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ PSReadline HistorySavePath를 찾을 수 없습니다." -ForegroundColor Red
}

# ----------------------------------------------------
# 2. 현재 PowerShell 세션 메모리 내 히스토리 삭제
# ----------------------------------------------------

Write-Host "현재 세션 메모리 내 명령 기록을 삭제합니다..." -ForegroundColor Yellow

# Get-History는 메모리에 로드된 현재 세션의 기록을 가져옵니다.
$SessionHistory = Get-History

if ($SessionHistory.Count -gt 0) {
    # Clear-History 명령으로 현재 세션의 모든 기록을 삭제합니다.
    Clear-History
    Write-Host "✅ 현재 PowerShell 세션의 메모리 내 기록 $SessionHistory.Count 개가 삭제되었습니다." -ForegroundColor Green
} else {
    Write-Host "⚠️ 현재 세션 메모리 내에 삭제할 기록이 없습니다." -ForegroundColor Red
}

# ----------------------------------------------------
# 3. 사용자에게 최종 조치 요청
# ----------------------------------------------------

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "       🚨 경고: 보안 조치 완료. 다음을 수행하십시오. 🚨" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "1. 이 PowerShell 창을 닫습니다." -ForegroundColor White
Write-Host "2. VS Code 또는 기타 IDE에 남아있는 터미널 창도 모두 닫습니다." -ForegroundColor White
Write-Host "3. PowerShell을 새로 시작하여 'Get-History' 또는 위/아래 화살표 키를 눌러 기록이 없는지 확인합니다." -ForegroundColor White

# 히스토리가 없는지 사용자에게 바로 확인하도록 안내
Write-Host "`n>> 지금 'Get-History'를 입력하여 현재 메모리 기록을 확인해 보세요." -ForegroundColor Yellow