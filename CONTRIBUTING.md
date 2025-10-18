# Contributing to CandleSpinner

이 문서는 CandleSpinner 프로젝트에 기여하기 위한 가이드라인을 제공합니다.

## 🚨 중요: PoC 디렉토리 보호 규칙

### 절대 규칙 (ABSOLUTE RULE)

**PoC 경로의 파일, 코드, 문서는 절대 훼손하면 안됩니다.**  
**PoC path files, code, and documents must NEVER be damaged.**

### 금지 사항

- ❌ `PoC/` 디렉토리 내의 파일 수정
- ❌ `PoC/` 디렉토리 내의 파일 삭제
- ❌ `PoC/` 디렉토리 내의 파일 이동
- ❌ `PoC/` 디렉토리 내의 파일 이름 변경

### 허용 사항

- ✅ PoC 파일을 읽고 참조
- ✅ PoC 파일을 다른 위치로 복사
- ✅ PoC 코드를 학습 및 연구
- ✅ PoC 문서를 참조하여 MVP 개발

### 보호 규칙 확인

변경사항을 커밋하기 전에 PoC 보호 규칙을 확인하세요:

```bash
npm run check-poc
```

자세한 내용은 [PoC/PROTECTION.md](PoC/PROTECTION.md)를 참조하세요.

## 📝 기여 방법

### 1. Fork & Clone

```bash
git clone https://github.com/your-username/CandleSpinner.git
cd CandleSpinner
npm install
```

### 2. 브랜치 생성

```bash
git checkout -b feature/your-feature-name
```

### 3. 코드 작성

- TypeScript 타입을 명확히 정의하세요
- 코드 스타일을 일관되게 유지하세요
- PoC 디렉토리는 절대 수정하지 마세요

### 4. 변경사항 확인

```bash
# 타입 체크
npm run typecheck

# PoC 보호 규칙 확인
npm run check-poc

# 빌드 테스트
npm run build
```

### 5. 커밋 & 푸시

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 6. Pull Request 생성

- 변경사항을 명확히 설명하세요
- 관련 이슈를 참조하세요
- PoC 파일을 수정하지 않았는지 확인하세요

## 📋 코드 스타일

- **들여쓰기**: 2 spaces
- **따옴표**: Single quotes for strings
- **세미콜론**: 사용
- **타입**: TypeScript 타입을 명시적으로 정의

## 🔍 코드 리뷰

- 모든 PR은 코드 리뷰를 거칩니다
- PoC 디렉토리 수정 시도는 자동으로 거부됩니다
- 건설적인 피드백을 환영합니다

## 📚 참고 자료

### PoC 개발 문서 (읽기 전용)

- [PoC 보호 규칙](PoC/PROTECTION.md)
- [PoC 복원 가이드](PoC/docs/PoC-restoration-guide.md)
- [문제 해결 가이드](PoC/docs/PoC/troubleshooting.md)
- [개발자 노트](PoC/docs/PoC/developer-notes.md)
- [지식 베이스](PoC/docs/PoC/knowledge-base.md)

### 프로젝트 문서

- [프로젝트 정의서]([산출물1]프로젝트-정의서(v1.1).md)
- [기술 스택 및 아키텍처]([산출물2]기술-스택-및-아키텍처-설계.md)
- [핵심 로직 의사코드]([산출물3]핵심-로직-의사코드-(MVP-확장-v2.0).md)

## 🐛 버그 리포트

버그를 발견하셨나요?

1. 이슈를 생성하세요
2. 버그를 재현하는 방법을 설명하세요
3. 예상 동작과 실제 동작을 명시하세요
4. 환경 정보를 포함하세요 (브라우저, OS 등)

## 💡 기능 제안

새로운 기능을 제안하시나요?

1. 이슈를 생성하세요
2. 기능의 목적과 이점을 설명하세요
3. 가능한 구현 방법을 제시하세요
4. 사용 사례를 제공하세요

## ⚖️ 라이선스

기여하신 코드는 프로젝트의 라이선스(ISC)를 따릅니다.

## 📞 질문?

궁금한 점이 있으시면 이슈를 생성하거나 프로젝트 관리자에게 문의하세요.

---

**감사합니다! 여러분의 기여가 CandleSpinner를 더 나은 프로젝트로 만듭니다. 🎉**
