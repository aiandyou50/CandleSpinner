# 📜 Build Scripts (scripts/)

프로젝트 빌드, 배포, 유틸리티 스크립트 모음입니다.

---

## 📁 파일 목록

### convert-address.mjs
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

### derive_jetton_wallet.mjs
**Jetton 지갑 주소 파생**

소유자 주소와 Jetton 토큰 주소에서 Jetton 지갑 주소를 계산합니다.

**사용법:**
```bash
node scripts/derive_jetton_wallet.mjs \
  --owner "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd" \
  --token "EQA..."
```

---

### parse_boc.mjs
**BOC(Bag of Cells) 파싱**

TON 트랜잭션의 BOC 형식 데이터를 파싱하여 내용을 확인합니다.

**사용법:**
```bash
node scripts/parse_boc.mjs "te6cckECWAEAA/..."
```

---

### test-v3-account.mjs
**V3 계정 테스트**

TON V3 지갑 계정 생성 및 테스트 (레거시)

---

## 🔧 빌드 스크립트 (package.json)

### npm run dev
로컬 개발 서버 시작
```bash
npm run dev
# http://localhost:5173
```

### npm run build
프로덕션 빌드
```bash
npm run build
# dist/ 폴더에 번들 생성
```

### npm run deploy
Cloudflare Pages에 배포
```bash
npm run deploy
# wrangler pages deploy dist
```

### npm run preview
빌드된 결과물을 로컬에서 미리보기
```bash
npm run preview
```

---

## 🚀 사용 예시

### 1. 지갑 주소 변환
```bash
node scripts/convert-address.mjs "EQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
```

### 2. Jetton 지갑 주소 계산
```bash
node scripts/derive_jetton_wallet.mjs \
  --owner "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd" \
  --token "EQBvh95oHKvZ-rXk3qNL5ZiWPQPqGiVBJ5zcNPbS4A5fZWKQ"
```

---

**마지막 업데이트:** 2025-10-23

