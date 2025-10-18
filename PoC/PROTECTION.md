# ⚠️ PoC 디렉토리 보호 규칙 (PoC Directory Protection Rules)

## 절대 규칙 (ABSOLUTE RULE)

**이 PoC 경로의 파일, 코드, 문서는 절대 훼손하면 안됩니다.**
**PoC path files, code, and documents must NEVER be damaged or modified.**

### 🚫 금지 사항 (Prohibited Actions)

1. **수정 금지 (No Modifications)**: PoC 디렉토리 내의 모든 파일을 수정하지 마세요.
2. **삭제 금지 (No Deletions)**: PoC 디렉토리 내의 파일이나 폴더를 삭제하지 마세요.
3. **이동 금지 (No Moving)**: PoC 디렉토리의 파일을 다른 위치로 이동하지 마세요.
4. **이름 변경 금지 (No Renaming)**: PoC 디렉토리 내의 파일이나 폴더 이름을 변경하지 마세요.

### ✅ 허용 사항 (Allowed Actions)

1. **읽기 전용 (Read-Only)**: PoC 디렉토리의 파일을 읽고 참조하는 것은 허용됩니다.
2. **복사 (Copy)**: PoC 디렉토리의 파일을 다른 위치로 **복사**하여 사용하는 것은 허용됩니다.
3. **학습 (Learning)**: PoC 코드를 학습 목적으로 읽고 이해하는 것은 권장됩니다.
4. **참조 (Reference)**: MVP 개발 시 PoC 코드를 참조하는 것은 권장됩니다.

## 📁 보호 대상 (Protected Contents)

### 코드 파일 (Code Files)
- `PoC/src/**/*.tsx` - React 컴포넌트
- `PoC/src/**/*.ts` - TypeScript 파일
- `PoC/functions/**/*.js` - Cloudflare Functions

### 문서 파일 (Documentation Files)
- `PoC/docs/**/*.md` - 모든 문서
- `PoC/docs/PoC/README.md` - PoC 개발 가이드
- `PoC/docs/PoC/troubleshooting.md` - 문제 해결 가이드
- `PoC/docs/PoC/post-mortem-cspin-transfer.md` - 사후 분석
- `PoC/docs/PoC/developer-notes.md` - 개발자 노트
- `PoC/docs/PoC/knowledge-base.md` - 지식 베이스
- `PoC/docs/PoC-restoration-guide.md` - 복원 가이드

### 백업 파일 (Backup Files)
- `PoC/PoC보존-압축파일(2025.10.18.).zip` - 압축 백업 파일

## 🎯 목적 (Purpose)

이 PoC 디렉토리는 다음의 목적으로 보존됩니다:

1. **참조 자료 (Reference Material)**: MVP 개발 시 참조할 수 있는 작동하는 코드 예제
2. **학습 자료 (Learning Material)**: TON Connect, Jetton 전송 등의 구현 방법 학습
3. **복원 가능성 (Restoration Capability)**: 필요 시 PoC 코드를 복원할 수 있는 백업
4. **개발 역사 (Development History)**: 프로젝트 개발 과정의 기록

## 🔄 PoC 코드 사용 방법 (How to Use PoC Code)

PoC 코드를 사용하려면, **반드시 복사본을 만들어서 사용**하세요:

### 방법 1: 파일 복사 (File Copy)
```bash
# PoC 파일을 프로젝트의 다른 위치로 복사
cp PoC/src/PoCComponent.tsx src/MyComponent.tsx
```

### 방법 2: 전체 복원 (Full Restoration)
복원이 필요한 경우 `PoC/docs/PoC-restoration-guide.md`를 참조하세요.

### 방법 3: 참조 및 재작성 (Reference and Rewrite)
PoC 코드를 읽고 이해한 후, 새로운 파일에 다시 작성하세요.

## ⚡ 보호 메커니즘 (Protection Mechanisms)

이 프로젝트에는 다음의 보호 메커니즘이 구현되어 있습니다:

1. **Git Hooks**: pre-commit 훅이 PoC 디렉토리의 변경사항을 감지하고 경고합니다.
2. **.gitattributes**: PoC 파일에 특별한 속성이 설정되어 있습니다.
3. **Documentation**: 이 문서가 보호 규칙을 명시합니다.
4. **README Warnings**: 프로젝트 README에 경고 메시지가 포함되어 있습니다.

## 📞 문의 (Contact)

PoC 디렉토리를 수정해야 하는 **정당한 이유**가 있다면:

1. 이슈를 생성하여 변경 사유를 설명하세요.
2. 프로젝트 관리자의 승인을 받으세요.
3. 변경 전에 반드시 백업을 생성하세요.
4. 변경 사항을 문서화하세요.

## 📜 라이선스 및 책임 (License and Liability)

- 이 PoC 코드는 학습 및 참조 목적으로만 제공됩니다.
- PoC 코드의 무단 수정으로 인한 문제는 수정자의 책임입니다.
- 프로젝트의 라이선스 조항을 준수해야 합니다.

---

**⚠️ 주의: 이 규칙을 위반하면 프로젝트의 복원 가능성과 개발 연속성이 손상될 수 있습니다.**

**⚠️ WARNING: Violating these rules may damage the project's restoration capability and development continuity.**
