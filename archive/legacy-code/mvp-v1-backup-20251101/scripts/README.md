***REMOVED***📜 Build Scripts (scripts/)

프로젝트 빌드, 배포, 유틸리티 스크립트 모음입니다.

---

#***REMOVED***📁 파일 목록

##***REMOVED***convert-address.mjs
**TON 주소 형식 변환 유틸리티**

주소의 Bounceable과 Non-bounceable 형식을 서로 변환합니다.

**사용법:**
```bash
node scripts/convert-address.mjs "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
```

**출력:**
```
Bounceable:     EQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
Non-bounceable: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
```

---

##***REMOVED***derive_jetton_wallet.mjs
**Jetton 지갑 주소 파생**

소유자 주소와 Jetton 토큰 주소에서 Jetton 지갑 주소를 계산합니다.

**사용법:**
```bash
node scripts/derive_jetton_wallet.mjs \
  --owner "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd" \
  --token "EQA..."
```

---

##***REMOVED***parse_boc.mjs
**BOC(Bag of Cells) 파싱**

TON 트랜잭션의 BOC 형식 데이터를 파싱하여 내용을 확인합니다.

**사용법:**
```bash
node scripts/parse_boc.mjs "te6cckECWAEAA/..."
```

---

##***REMOVED***create-w5-wallet.mjs
**W5 (WalletContractV5R1) 지갑 생성 유틸리티**

TON 블록체인의 최신 V5R1 버전 지갑을 생성합니다.
니모닉, 프라이빗 키, 또는 공개 키에서 지갑을 파생할 수 있습니다.

**사용법:**

1. 니모닉에서 생성
```bash
node scripts/create-w5-wallet.mjs --mnemonic "bamboo release expand income shiver gift bounce cargo course kiss goat cram pledge relax rib furnace squirrel sugar find daughter load proof please speed"
```

2. 프라이빗 키에서 생성
```bash
node scripts/create-w5-wallet.mjs --privatekey "***REDACTED-TON-PRIVATE-KEY***"
```

3. 공개 키에서 생성
```bash
node scripts/create-w5-wallet.mjs --publickey "f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b"
```

**출력 예시:**
```
✅ 지갑 생성 완료!

📍 지갑 주소:
   테스트넷:   0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
   메인넷:     UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
   User-friendly: UQC2DJ8...

📊 최종 정보:
   버전:      WalletContractV5R1
   Workchain: 0
```

---

##***REMOVED***npm run dev
로컬 개발 서버 시작
```bash
npm run dev
***REMOVED***http://localhost:5173
```

##***REMOVED***npm run build
프로덕션 빌드
```bash
npm run build
***REMOVED***dist/ 폴더에 번들 생성
```

##***REMOVED***npm run deploy
Cloudflare Pages에 배포
```bash
npm run deploy
***REMOVED***wrangler pages deploy dist
```

##***REMOVED***npm run preview
빌드된 결과물을 로컬에서 미리보기
```bash
npm run preview
```

---

#***REMOVED***🚀 사용 예시

##***REMOVED***1. 지갑 주소 변환
```bash
node scripts/convert-address.mjs "EQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
```

##***REMOVED***2. Jetton 지갑 주소 계산
```bash
node scripts/derive_jetton_wallet.mjs \
  --owner "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd" \
  --token "EQBvh95oHKvZ-rXk3qNL5ZiWPQPqGiVBJ5zcNPbS4A5fZWKQ"
```

---

**마지막 업데이트:** 2025-10-23

