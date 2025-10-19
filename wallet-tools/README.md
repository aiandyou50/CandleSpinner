# Wallet Tools

이 폴더에는 TON 블록체인 월렛 생성, 니모닉 변환, 키 파생 등과 관련된 유틸리티 스크립트들이 포함되어 있습니다.

## 파일 설명

### mnemonic-to-key.mjs
니모닉 문구를 TON 호환 프라이빗 키로 변환하는 스크립트입니다.

**사용법:**
```bash
node mnemonic-to-key.mjs
```
스크립트를 실행하면 니모닉을 입력하라는 프롬프트가 나타납니다. 24단어 니모닉을 공백으로 구분하여 입력하세요.

**출력:**
- 프라이빗 키 (16진수)
- 퍼블릭 키 (16진수)
- 월렛 주소

### secure-mnemonic-to-key.mjs
보안 강화된 니모닉 변환 스크립트입니다. 추가적인 검증과 안전한 키 파생을 수행합니다.

**사용법:**
```bash
node secure-mnemonic-to-key.mjs
```

### test-mnemonic.mjs
니모닉의 유효성을 테스트하고 키 파생 과정을 검증하는 스크립트입니다.

**사용법:**
```bash
node test-mnemonic.mjs
```

### generate-wallet.mjs
새로운 TON 월렛을 생성하는 스크립트입니다. 랜덤 니모닉을 생성하고 키를 파생합니다.

**사용법:**
```bash
node generate-wallet.mjs
```

**출력:**
- 24단어 니모닉
- 프라이빗 키
- 퍼블릭 키
- 월렛 주소

### test-v3-wallet.mjs
TON Wallet V3 컨트랙트 생성 및 테스트를 위한 스크립트입니다.

**사용법:**
```bash
node test-v3-wallet.mjs
```

### test-v5-wallet.mjs
TON Wallet V5 컨트랙트 생성 및 테스트를 위한 스크립트입니다.

**사용법:**
```bash
node test-v5-wallet.mjs
```

## 주의사항

- 프라이빗 키는 절대 공개하지 마세요
- 니모닉은 안전한 곳에 백업하세요
- 테스트넷에서 먼저 테스트한 후 메인넷에 적용하세요
- 이 스크립트들은 개발 및 테스트 목적으로만 사용하세요

## 의존성

이 스크립트들을 실행하려면 다음 패키지들이 설치되어 있어야 합니다:
- @ton/core
- @ton/crypto
- @ton/ton

프로젝트 루트에서 `npm install`을 실행하여 의존성을 설치하세요.