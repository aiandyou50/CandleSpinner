***REMOVED***📦 스마트 컨트랙트 PoC 백업

#***REMOVED***📅 백업 일시
2025-01-30

#***REMOVED***📋 백업 사유
게임 지갑 기반 인출 시스템으로 아키텍처 변경에 따라 스마트 컨트랙트 관련 파일들을 백업

#***REMOVED***📁 백업 내용

##***REMOVED***스마트 컨트랙트 소스
- `sources/CSPINWithdrawalVoucher.tact` - Voucher 방식 컨트랙트
- `sources/CSPINWithdrawalSecure.tact` - Secure 방식 컨트랙트
- `build.tact` - 빌드 설정

##***REMOVED***스크립트 (TypeScript)
- `scripts/deployVoucher.ts` - Voucher 배포
- `scripts/checkVoucherContract.ts` - 컨트랙트 상태 확인
- `scripts/pauseContract.ts` - 컨트랙트 일시정지
- `scripts/unpauseContract.ts` - 컨트랙트 재개
- `scripts/updateContractWallet.ts` - 지갑 주소 업데이트
- `scripts/withdrawJetton.ts` - Jetton 인출
- `scripts/withdrawTON.ts` - TON 인출
- `scripts/getJettonWalletAddress.ts` - Jetton Wallet 주소 조회
- `scripts/_check_contract_balance.ts` - 잔고 확인

##***REMOVED***래퍼 & 테스트
- `wrappers/CSPINWithdrawalVoucher_CSPINWithdrawalVoucher.ts` - TypeScript 래퍼
- `tests/LocalTestnet.spec.ts` - 로컬 테스트

##***REMOVED***백엔드 (구 방식)
- `backend-api/server.js` - Voucher 서버
- `backend-api/server-direct-transfer.js` - Direct Transfer v2
- `backend-api/server-direct-transfer-v3.js` - Direct Transfer v3 (실패)

##***REMOVED***프론트엔드 (구 방식)
- `frontend-poc/index.html` - Voucher UI
- `frontend-poc/direct-transfer.html` - Direct Transfer UI
- `frontend-poc/emergency-pause.html` - 컨트랙트 관리 UI
- `frontend-poc/output.html` - 테스트 출력

##***REMOVED***문서
- `docs/ADMIN_GUIDE.md`
- `docs/BOOTSTRAP.md`
- `docs/CSPIN_FUNDING_GUIDE.md`
- `docs/DEPLOYMENT_COMPLETE.md`
- `docs/DIRECT_TRANSFER_GUIDE.md`
- `docs/GAME_INTEGRATION_GUIDE.md`
- `docs/HANDOVER.md`
- `docs/LOCAL_TEST_GUIDE.md`
- `docs/POC_GUIDE.md`
- `docs/QUICKSTART.md`
- `docs/SCRIPTS.md`
- `docs/SECURITY_RECOMMENDATIONS.md`
- `docs/TONCENTER_API_KEY_GUIDE.md`
- `docs/UPDATE_CONTRACT_WALLET_GUIDE.md`
- `docs/VOUCHER_SETUP_GUIDE.md`
- `docs/CLOUDFLARE_PAGES_DEPLOYMENT.md`
- `docs/RPC_FREE_SOLUTION.md`
- `docs/Clear-MnemonicHistory.ps1사용법.md`

##***REMOVED***Workers (Cloudflare)
- `workers/api.ts`
- `workers/README.md`
- `workers/package.json`
- `workers/wrangler.toml`

##***REMOVED***빌드 & 임시 파일
- `build/` - 컴파일된 컨트랙트
- `temp/` - 임시 파일
- `tact.config.json` - Tact 설정
- `blueprint.yaml` - Blueprint 설정

#***REMOVED***🔄 복원 방법

필요시 이 폴더의 내용을 원래 위치로 복사:

```powershell
***REMOVED***예: 스마트 컨트랙트 복원
Copy-Item -Path "archive\smartcontract-poc-backup\sources\*" -Destination "sources\" -Recurse

***REMOVED***예: 스크립트 복원
Copy-Item -Path "archive\smartcontract-poc-backup\scripts\*" -Destination "scripts\" -Recurse
```

#***REMOVED***📝 참고사항

이 백업은 **스마트 컨트랙트 기반 PoC**의 완전한 아카이브입니다.

현재 프로젝트는 **게임 지갑 기반 직접 전송** 방식으로 운영되며, 스마트 컨트랙트를 사용하지 않습니다.

#***REMOVED***🔗 관련 문서

- [게임 지갑 가이드](../../docs/GAME_WALLET_GUIDE.md)
- [빠른 시작](../../docs/GAME_WALLET_QUICKSTART.md)
- [프로젝트 정리 계획](../../PROJECT_CLEANUP_PLAN.md)
