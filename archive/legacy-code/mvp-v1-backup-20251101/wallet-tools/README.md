***REMOVED***🔧 Wallet Tools

TON 블록체인 월렛 생성, 니모닉 변환, 키 파생 등과 관련된 유틸리티 스크립트 모음입니다.

**⚠️ 보안 경고:** 이 스크립트들로 생성한 **개인키는 절대 Git에 커밋하면 안 됩니다.**

---

#***REMOVED***� 파일 목록

##***REMOVED***✅ mnemonic-to-key.mjs
**Telegram TON Wallet (V5R1) 호환** - 24단어 니모닉을 개인키로 변환

**사용법:**
```bash
node wallet-tools/mnemonic-to-key.mjs "your 24-word mnemonic here"
```

**출력:**
```
privateKey: 4e6568d1...ef7978fc (128자 16진수)
publicKey:  3a59677f...530... (64자 16진수)
walletAddress (V5R1): UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
```

**👉 Cloudflare 환경변수 설정:**
1. https://dash.cloudflare.com → Pages → candlespinner
2. Settings → Environment variables → Production
3. 변수명: `GAME_WALLET_PRIVATE_KEY`
4. 값: 위의 `privateKey` 입력

---

##***REMOVED***✅ generate-wallet.mjs
**새로운 TON V5R1 지갑 생성** - 랜덤 니모닉 & 키 자동 생성

**사용법:**
```bash
node wallet-tools/generate-wallet.mjs
```

**출력:**
```
mnemonic: [BIP39 24-word mnemonic]
privateKey: [128-char hex] (예시: 4e6568d1...ef7978fc)
publicKey: [64-char hex]
walletAddress: UQBFPDdSlPgqPrn2Xwh...
```

---

##***REMOVED***✅ secure-mnemonic-to-key.mjs
**보안 강화 버전** - 추가 검증 & 안전한 키 파생

**사용법:**
```bash
node wallet-tools/secure-mnemonic-to-key.mjs
```

---

##***REMOVED***test-mnemonic.mjs
니모닉의 유효성 테스트 및 키 파생 과정 검증

```bash
node wallet-tools/test-mnemonic.mjs
```

---

##***REMOVED***test-v3-wallet.mjs
TON Wallet V3 컨트랙트 테스트 (레거시 - 사용 금지)

---

##***REMOVED***test-v5-wallet.mjs
TON Wallet V5 컨트랙트 테스트

```bash
node wallet-tools/test-v5-wallet.mjs
```

---

#***REMOVED***� 보안 가이드

##***REMOVED***❌ 절대 금지
```bash
***REMOVED***금지: 터미널에 니모닉 노출
node wallet-tools/mnemonic-to-key.mjs "tornado run casual carbon..."  ***REMOVED***X

***REMOVED***금지: 파일에 개인키 저장
echo "privateKey=4e6568d1..." > .env  ***REMOVED***X (Git에 커밋 위험)
```

##***REMOVED***✅ 올바른 절차
```bash
***REMOVED***1. 니모닉만 터미널에 입력 (타입/붙여넣기 후 즉시 히스토리 삭제)
node wallet-tools/mnemonic-to-key.mjs

***REMOVED***2. 출력된 privateKey만 복사
***REMOVED***(출력: privateKey: 4e6568d1...)

***REMOVED***3. Cloudflare 대시보드에 즉시 입력
***REMOVED***https://dash.cloudflare.com/Pages/candlespinner/Settings/Environment-variables

***REMOVED***4. 로컬 히스토리 정리
Clear-History  ***REMOVED***PowerShell
***REMOVED***또는
history -c  ***REMOVED***Bash
```

---

#***REMOVED***� 지원 지갑 버전

| 버전 | 상태 | 사용 사례 |
|------|------|---------|
| **V5R1** | ✅ 사용 | Telegram TON Wallet (현재) |
| V4 | ❌ 레거시 | 이전 TonKeeper |
| V3 | ❌ 레거시 | 초기 TON Wallet |

**현재 프로젝트에서 사용 중인 버전: V5R1**

---

#***REMOVED***� 의존성

```
@ton/core    - TON 블록체인 코어 라이브러리
@ton/crypto  - 암호화 기능
@ton/ton     - TON 클라이언트
```

**설치:**
```bash
npm install  ***REMOVED***프로젝트 루트에서
```

---

#***REMOVED***🚀 예제

##***REMOVED***1️⃣ 기존 니모닉에서 개인키 얻기
```bash
node wallet-tools/mnemonic-to-key.mjs "[your-24-word-mnemonic]"
***REMOVED***출력된 privateKey를 Cloudflare에 설정
```

##***REMOVED***2️⃣ 새 지갑 생성
```bash
node wallet-tools/generate-wallet.mjs
***REMOVED***니모닉 안전 백업 → privateKey 추출 → Cloudflare 설정
```

##***REMOVED***3️⃣ 지갑 주소 검증
```bash
node wallet-tools/test-v5-wallet.mjs
***REMOVED***V5R1 호환 확인
```

---

#***REMOVED***⚠️ 자주 묻는 질문

##***REMOVED***Q: 생성된 주소가 원래 지갑과 다릙니다
**A:** 지갑 버전 확인
- Telegram Wallet → V5R1 사용
- 다른 지갑 → V3 또는 V4 확인

##***REMOVED***Q: 프라이빗 키 길이 오류
**A:** 개인키는 128자 (16진수 64바이트)여야 합니다. 니모닉 확인 필요.

##***REMOVED***Q: 터미널 히스토리가 보안 위험?
**A:** 즉시 정리하세요:
```powershell
Clear-History
Remove-Item (Get-PSReadlineOption).HistorySavePath -Force
```

---

#***REMOVED***📚 참고 자료

- 📖 [보안 정책 가이드](../workflows/[보안-정책]_보안-워크플로우-강제.md)
- 📖 [SECURITY.md](../solutions/[보안가이드]_20251023_개인키-환경변수-관리.md)
- 🔗 [TON 문서](https://docs.ton.org)
- 🔗 [Telegram TON Wallet](https://wallet.ton.org)

---

**마지막 업데이트:** 2025-10-23  
**V5R1 호환성:** ✅ 검증됨
