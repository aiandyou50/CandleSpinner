-----

***REMOVED***🔐 PowerShell 니모닉 코드 기록 삭제 스크립트

#***REMOVED***📜 파일명: `Clear-MnemonicHistory.ps1`

암호화폐 지갑의 니모닉 코드와 같은 민감한 정보가 PowerShell 명령 히스토리에 남아있는 것을 방지하고, 해당 기록을 안전하게 제거하기 위한 스크립트입니다.

-----

#***REMOVED***💡 개요 (SYNOPSIS)

이 스크립트는 PowerShell 환경에서 민감한 정보가 포함된 명령 기록을 **영구적으로 삭제**합니다. PowerShell이 명령 기록을 저장하는 두 가지 주요 위치인 **PSReadline 히스토리 파일**과 **현재 세션 메모리**의 기록을 모두 지웁니다.

#***REMOVED***📝 스크립트 내용

```powershell
***REMOVED***Clear-MnemonicHistory.ps1
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

***REMOVED***----------------------------------------------------
***REMOVED***1. PSReadline 히스토리 파일 삭제 (영구 기록 삭제)
***REMOVED***----------------------------------------------------

Write-Host "PSReadline 히스토리 파일 경로를 확인합니다..." -ForegroundColor Yellow

***REMOVED***히스토리 파일 경로를 가져옵니다.
$HistoryFilePath = (Get-PSReadlineOption).HistorySavePath

if (-not [string]::IsNullOrEmpty($HistoryFilePath)) {
    if (Test-Path $HistoryFilePath) {
        ***REMOVED***파일 내용을 삭제 (파일은 유지)
        Clear-Content $HistoryFilePath
        Write-Host "✅ PSReadline 히스토리 파일 내용이 삭제되었습니다: $HistoryFilePath" -ForegroundColor Green
    } else {
        Write-Host "⚠️ PSReadline 히스토리 파일이 존재하지 않습니다. $HistoryFilePath" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ PSReadline HistorySavePath를 찾을 수 없습니다." -ForegroundColor Red
}

***REMOVED***----------------------------------------------------
***REMOVED***2. 현재 PowerShell 세션 메모리 내 히스토리 삭제
***REMOVED***----------------------------------------------------

Write-Host "현재 세션 메모리 내 명령 기록을 삭제합니다..." -ForegroundColor Yellow

$SessionHistory = Get-History

if ($SessionHistory.Count -gt 0) {
    ***REMOVED***Clear-History 명령으로 현재 세션의 모든 기록을 삭제합니다.
    Clear-History
    Write-Host "✅ 현재 PowerShell 세션의 메모리 내 기록 $SessionHistory.Count 개가 삭제되었습니다." -ForegroundColor Green
} else {
    Write-Host "⚠️ 현재 세션 메모리 내에 삭제할 기록이 없습니다." -ForegroundColor Red
}

***REMOVED***----------------------------------------------------
***REMOVED***3. 사용자에게 최종 조치 요청
***REMOVED***----------------------------------------------------

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "       🚨 경고: 보안 조치 완료. 다음을 수행하십시오. 🚨" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "1. 이 PowerShell 창을 닫습니다." -ForegroundColor White
Write-Host "2. VS Code 또는 기타 IDE에 남아있는 터미널 창도 모두 닫습니다." -ForegroundColor White
Write-Host "3. PowerShell을 새로 시작하여 'Get-History' 또는 위/아래 화살표 키를 눌러 기록이 없는지 확인합니다." -ForegroundColor White

Write-Host "`n>> 지금 'Get-History'를 입력하여 현재 메모리 기록을 확인해 보세요." -ForegroundColor Yellow
```

-----

#***REMOVED***🛠 사용 방법 (USAGE)

##***REMOVED***1\. 스크립트 파일 저장

위 코드를 복사하여 파일 이름 \*\*`Clear-MnemonicHistory.ps1`\*\*로 저장합니다.

##***REMOVED***2\. PowerShell 실행

PowerShell 창을 열고 스크립트 파일이 저장된 경로로 이동합니다.

##***REMOVED***3\. 스크립트 실행

다음 명령어를 입력하여 스크립트를 실행합니다.

```powershell
.\Clear-MnemonicHistory.ps1
```

> ⚠️ **실행 오류 발생 시:**
>
> "스크립트를 실행할 수 없습니다." 오류가 발생하면, PowerShell의 **실행 정책(Execution Policy)** 때문일 수 있습니다. 관리자 권한으로 PowerShell을 실행하고 다음 명령을 입력하여 실행 정책을 변경합니다.
>
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope Process
> ```
>
> 스크립트 실행 후에는 이 정책을 다시 제한적인 설정으로 되돌릴 수 있습니다.

##***REMOVED***4\. 최종 확인 및 종료 (필수)

스크립트 실행 후, 출력 메시지에 따라 **현재 열려있는 모든 PowerShell 창**과 VS Code 등의 통합 개발 환경(IDE)에 있는 **터미널 창을 모두 닫습니다.**

새로운 PowerShell 창을 열어 $\text{↑}$ (위쪽 화살표) 키를 누르거나 `Get-History` 명령어를 입력하여 니모닉 코드가 포함된 명령 기록이 완전히 사라졌는지 확인합니다.

#***REMOVED***🛡️ 보안 참고 사항

  * 이 스크립트는 **PowerShell 자체의 기록**을 삭제합니다. 다른 응용 프로그램(예: VS Code의 출력 로그, 시스템 클립보드 기록)에 정보가 남아있을 가능성은 별도로 확인하고 제거해야 합니다.
  * 가장 안전한 방법은 민감한 정보를 **PowerShell을 포함한 어떤 디지털 환경에도 입력하지 않는 것**입니다. 니모닉 코드는 오프라인 환경에서 종이에 기록하여 보관하는 것이 표준 보안 수칙입니다.