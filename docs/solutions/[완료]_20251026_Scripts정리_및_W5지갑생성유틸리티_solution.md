# [완료] 스크립트 정리 및 W5 지갑 생성 유틸리티 추가 (2025-10-26)

**상태**: ✅ 완료  
**작업 항목**: 3개 모두 완료

---

## 📋 수행된 작업

### 1️⃣ scripts/test-v3-account.mjs 삭제 ✅
- 파일 삭제됨: `scripts/test-v3-account.mjs`
- README에서 해당 내용 제거
- 레거시 V3 지갑 코드 정리 완료

### 2️⃣ scripts/README.md 업데이트 ✅
- test-v3-account.mjs 관련 내용 제거
- V3 계정 테스트 섹션 삭제
- 문서 간결화

### 3️⃣ W5 버전 지갑 생성 스크립트 추가 ✅

**파일명**: `scripts/create-w5-wallet.mjs`

**주요 기능**:
- 니모닉 → W5 지갑 생성
- 프라이빗 키 → W5 지갑 생성  
- 공개 키 → W5 지갑 생성
- 테스트넷/메인넷 주소 생성

**사용 방법**:
```bash
# 니모닉에서 생성
node scripts/create-w5-wallet.mjs --mnemonic "word1 word2 ..."

# 프라이빗 키에서 생성
node scripts/create-w5-wallet.mjs --privatekey "14ebd4df..."

# 공개 키에서 생성
node scripts/create-w5-wallet.mjs --publickey "abc123..."
```

---

## 📂 최종 스크립트 구조

### scripts/ (루트 레벨)
```
✅ create-w5-wallet.mjs       (신규) W5 지갑 생성
✅ convert-address.mjs         주소 형식 변환
✅ derive_jetton_wallet.mjs    Jetton 지갑 주소 파생
✅ parse_boc.mjs              BOC 파싱
✅ validate-keys.mjs          키 검증
✅ find-correct-privkey.mjs   프라이빗 키 탐색
✅ analyze-address-mismatch.mjs 주소 불일치 분석
❌ test-v3-account.mjs        (삭제됨)
```

### contracts/scripts/ (배포용)
```
✅ deploy.ts                  최종 배포 스크립트
✅ blueprintDeploy.ts         Blueprint 배포
✅ checkEnv.ts                환경 변수 확인
✅ generatePrivateKey.ts      프라이빗 키 생성
```

---

## 🎯 W5 지갑 생성 스크립트 상세

### 입력 옵션

| 옵션 | 설명 | 예시 |
|------|------|------|
| `--mnemonic` | 24단어 니모닉 | `bamboo release expand...` |
| `--privatekey` | 프라이빗 키 (64바이트/128자 hex) | `14ebd4df...` |
| `--publickey` | 공개 키 (32바이트/64자 hex) | `f917eef0...` |

### 출력 정보

```
✅ 지갑 생성 완료!

📍 지갑 주소:
   테스트넷:   0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
   메인넷:     UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
   User-friendly: UQC2DJ8...

📊 최종 정보:
   버전:      WalletContractV5R1
   Workchain: 0
   공개 키:   f917eef0...
   상태: 준비 완료
```

### 에러 처리

| 에러 | 원인 | 해결책 |
|------|------|--------|
| "24단어여야 합니다" | 니모닉 단어 수 오류 | 정확히 24단어 입력 |
| "유효하지 않은 니모닉" | 니모닉 체크섬 오류 | 올바른 니모닉 확인 |
| "128자 hex여야 합니다" | 프라이빗 키 길이 오류 | 정확히 64바이트 입력 |
| "64자 hex여야 합니다" | 공개 키 길이 오류 | 정확히 32바이트 입력 |

---

## ✅ 검증 항목

- [x] test-v3-account.mjs 삭제
- [x] README.md에서 V3 내용 제거
- [x] create-w5-wallet.mjs 스크립트 생성
- [x] README.md에 W5 스크립트 문서화
- [x] 니모닉/프라이빗키/공개키 3가지 입력 방식 구현
- [x] 에러 처리 및 검증 완성

---

## 🚀 사용 예시

### 예시 1: 현재 지갑으로 W5 생성
```bash
cd /c/Users/x0051/Desktop/DEV/CandleSpinner
node scripts/create-w5-wallet.mjs --mnemonic "bamboo release expand income shiver gift bounce cargo course kiss goat cram pledge relax rib furnace squirrel sugar find daughter load proof please speed"
```

**출력**:
```
✅ 니모닉 검증 완료
   단어 수: 24

✅ 지갑 생성 완료!

📍 지갑 주소:
   테스트넷:   0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
   메인넷:     UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
```

### 예시 2: 프라이빗 키로 검증
```bash
node scripts/create-w5-wallet.mjs --privatekey "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b"
```

---

## 📝 다음 단계

### 배포 준비
```bash
cd contracts
npm run build                           # 컴파일
npm run check-env                       # 환경 변수 확인
npx blueprint run deploy --testnet      # 배포
```

### 지갑 검증
```bash
node scripts/create-w5-wallet.mjs --mnemonic "..."
```

---

**작성일시**: 2025-10-26 11:45:00  
**상태**: ✅ 완료  
**다음**: `npm run build && npx blueprint run deploy --testnet`
