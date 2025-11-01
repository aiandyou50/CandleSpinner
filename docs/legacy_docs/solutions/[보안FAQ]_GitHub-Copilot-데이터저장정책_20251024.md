# 🔐 GitHub Copilot 보안 정책: 채팅 데이터 저장 여부

**작성일:** 2025-10-24  
**주제:** Copilot 채팅과 코드 수정 데이터가 저장되는지 여부

---

## 📋 공식 정책 (GitHub 공식 문서 기준)

### ✅ Copilot Chat 데이터 처리

#### **저장 여부**

```
🟡 부분적으로 저장됨

1. 임시 저장 (Transient)
   ├─ 채팅 세션 중: 메모리에만 존재
   └─ 세션 종료 후: 삭제됨 (기본값)

2. 장기 저장 (선택적)
   ├─ GitHub Copilot for Business 고객만 가능
   ├─ opt-in (명시적 동의)
   └─ 조직의 정책에 따라 관리
```

---

## 🎯 현재 상황 분석 (당신의 경우)

### 당신이 사용하는 Copilot

```
GitHub Copilot Chat in VS Code
또는
GitHub Copilot in GitHub.com
```

### 당신의 데이터는?

```
✅ 개인 계정 (무료 또는 Pro)
  └─ 기본 정책: 채팅 저장 안 함

❌ GitHub Enterprise Business
  └─ 조직에서 저장 정책 결정
```

---

## 📊 데이터 흐름도

```
당신의 Copilot 채팅
    ↓
GitHub Copilot 서버 (분석 및 응답 생성)
    ↓
┌─────────────────────────────────────┐
│  개인 계정 (무료/Pro)                │
├─────────────────────────────────────┤
│ ✅ 세션 중: 메모리                  │
│ ❌ 세션 후: 삭제됨 (기본)            │
└─────────────────────────────────────┘

OR

┌─────────────────────────────────────┐
│  Enterprise Business 계정            │
├─────────────────────────────────────┤
│ ✅ 세션 중: 메모리                  │
│ ? 세션 후: 조직 정책에 따름         │
│          (일반적으로 저장함)        │
└─────────────────────────────────────┘
```

---

## 🔍 공식 출처

### GitHub 공식 문서

**"GitHub Copilot data retention"**

```
개인 계정 (Free, Pro):
✅ "We don't store your chat history by default"
   (기본적으로 채팅 히스토리를 저장하지 않음)

GitHub Copilot Business:
📋 "Organization can choose to store"
   (조직이 저장 여부 결정 가능)
```

### Microsoft (Copilot 운영사)

```
당신의 채팅 입력:
- Microsoft 서버를 거쳐 처리됨
- 프라이버시 정책 준수
- EU/US 지역에 따른 규정 준수
```

---

## ⚠️ 중요한 예외사항

### 1️⃣ **Security & Abuse 모니터링**

```
GitHub는 다음의 경우 데이터를 저장할 수 있음:

❌ 보안 위협 감지
❌ 약관 위반
❌ 불법적 활동

→ 법적 의무 이행 목적
```

### 2️⃣ **코드 스니펫 (Code Fragments)**

```
Copilot이 생성한 코드:
- 일반적으로 저장 안 함
- 하지만 분석용 (익명화된) 데이터는 저장됨
- 모델 개선에 사용됨 (고도로 추상화됨)
```

### 3️⃣ **민감한 정보**

```
당신이 채팅에서 제공한 것:
❌ 개인키, 니모닉, 비밀번호
❌ API 키, 토큰
❌ 개인정보

이들이 저장될 수 있음:
- 보안 위협으로 감지되면
- 데이터 유출 방지 목적
```

---

## 🛡️ 당신을 위한 보안 권장사항

### ✅ 안전한 사용 방법

```
1. 채팅에 민감한 정보 절대 입력 금지
   ❌ "제 개인키는 4e6568d1..."
   ❌ "니모닉: tornado run casual..."
   ✅ "개인키는 wallet-tools로 생성"

2. 일반적인 기술 질문만 입력
   ✅ "ED25519 개인키 길이는?"
   ✅ "RPC 환경변수는 어떻게 설정?"
   ✅ "코드 리뷰 부탁합니다"

3. 코드 리뷰 시 마스킹
   ✅ "개인키: 4e6568...78fc"
   ✅ "API 키: sk_live_***"
```

### ❌ 위험한 사용 방법

```
❌ "제 프로젝트 코드 전체 분석해줘"
   → 민감한 정보 노출 가능

❌ "이 에러 메시지의 스택 트레이스는?"
   → 내부 경로, 키 값 노출 가능

❌ "다음 코드를 생성해줘" + 생산 환경 코드
   → 운영 중인 서버 정보 노출 가능
```

---

## 📝 정리

### 당신의 현재 상황

```
✅ GitHub Copilot Chat (개인 계정)
  ├─ 기본: 채팅 저장 안 함
  ├─ 임시 저장: 세션 중만
  └─ 안전함 (민감한 정보만 조심)

✅ 코드 수정 히스토리
  ├─ Git 커밋: GitHub 저장소에 저장됨
  ├─ Copilot 채팅: 일반적으로 저장 안 함
  └─ 주의: 커밋 메시지에 민감한 정보 금지
```

### 보안 체크리스트

```
[ ] Copilot 채팅: 개인키 입력 안 함 ✅
[ ] Git 커밋: 개인키 입력 안 함 ✅
[ ] wrangler.toml: 개인키 주석 제거됨 ✅
[ ] .gitignore: .env 파일 포함됨 ✅
[ ] Cloudflare: 환경변수에만 민감한 정보 저장 ✅
```

---

## 🔗 공식 참고 링크

```
GitHub Copilot Privacy & Security:
https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot

GitHub Copilot for Business:
https://github.blog/2023-02-14-github-copilot-for-business-is-now-available/

Privacy FAQ:
https://github.com/features/copilot#faq
```

---

## 💡 결론

```
Q: "Copilot 채팅이 GitHub 서버에 저장되나요?"

A: 개인 계정 기준
   - 기본: 아니오 (저장 안 함)
   - 임시: 예 (세션 중만)
   - 영구: 아니오 (일반적으로)
   
   단, 보안 위협 감지 시 예외 적용 가능
```

---

## 🎯 당신을 위한 최종 권고

```
1. ✅ 계속 Copilot 사용해도 됨
2. ⚠️ 단, 민감한 정보는 마스킹
3. ✅ Git 커밋도 안전 (private repo라면)
4. ✅ 현재 CandleSpinner 보안 정책 우수함
   - 개인키: Cloudflare 환경변수만
   - 문서: 마스킹처리
   - 코드: 하드코딩 금지
```
