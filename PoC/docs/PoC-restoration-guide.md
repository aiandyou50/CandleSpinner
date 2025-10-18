# PoC 복원 가이드
## CandleSpinner PoC 코드 복원 방법

이 문서는 PoC(Proof of Concept) 코드를 안전하게 복원하는 방법을 설명합니다.

### 📋 목차
1. [개요](#개요)
2. [복원 방법](#복원-방법)
3. [안전 장치](#안전-장치)
4. [문제 해결](#문제-해결)

### 개요

PoC 코드는 `PoC/` 폴더에 보존되어 있으며, MVP 개발을 위해 루트 `src/` 폴더를 정리했습니다.
PoC 코드를 다시 사용하려면 이 가이드를 따라 복원하세요.

### 복원 방법

#### 방법 1: 터미널 명령어로 복원 (권장)
```bash
# 1. 프로젝트 루트로 이동
cd "c:\Users\x0051\Desktop\DEV\새 폴더\CandleSpinner"

# 2. src 폴더 복원
cp -r PoC/src/* src/

# 3. functions 폴더 생성 및 복원
mkdir -p functions
cp -r PoC/functions/* functions/

# 4. docs 폴더 생성 및 복원
mkdir -p docs
cp -r PoC/docs/* docs/

# 5. 의존성 설치 및 실행
npm install
npm run dev
```

#### 방법 2: 수동 파일 복사
1. 파일 탐색기로 `PoC/` 폴더 열기
2. `PoC/src/` 폴더의 모든 파일을 프로젝트 `src/` 폴더로 복사
3. `PoC/functions/` 폴더의 모든 파일을 프로젝트 `functions/` 폴더로 복사
4. `PoC/docs/` 폴더의 모든 파일을 프로젝트 `docs/` 폴더로 복사
5. 터미널에서 `npm install && npm run dev` 실행

#### 방법 3: 백업 ZIP 파일 사용 (가장 안전)
1. `PoC/PoC보존-압축파일(2025.10.18.).zip` 압축 해제
2. 압축 해제된 폴더의 내용을 프로젝트 루트로 복사
3. 터미널에서 `npm install && npm run dev` 실행

### 안전 장치

#### 1. 코드 주석 (App.tsx)
`src/App.tsx` 파일에 복원 방법이 주석으로 기록되어 있습니다.

#### 2. 이 문서 (docs/PoC-restoration-guide.md)
현재 보고 있는 이 문서가 두 번째 안전 장치입니다.

#### 3. 백업 ZIP 파일
`PoC/PoC보존-압축파일(2025.10.18.).zip` 파일이 최종 안전 장치입니다.

### 문제 해결

#### 복원 후 오류가 발생하는 경우
```bash
# 1. 캐시 정리
npm run clean  # 또는 수동으로 node_modules 삭제 후 재설치

# 2. TypeScript 캐시 재시작 (VS Code 명령어)
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# 3. 전체 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 빌드가 실패하는 경우
```bash
# TypeScript 설정 확인
npx tsc --noEmit

# Vite 캐시 정리
npx vite --clear
```

### 📞 지원

문제가 발생하면 다음 파일들을 참고하세요:
- `PoC/docs/troubleshooting.md` - 문제 해결 가이드
- `PoC/docs/post-mortem-cspin-transfer.md` - 개발 과정 기록
- `PoC/docs/developer-notes.md` - 구현 노트

---

**주의**: MVP 개발 중인 코드를 덮어쓰지 않도록 반드시 백업하세요!