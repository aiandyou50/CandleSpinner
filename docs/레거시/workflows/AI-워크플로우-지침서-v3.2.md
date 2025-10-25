# 🤖 AI 워크플로우 지침서 v3.2 (Priority 기반)

**버전**: v3.2 (2025-10-24)  
**상태**: ✅ Phase 2 구현 중  
**목표**: 3가지 우선순위 기반 (A/B/C) 워크플로우로 AI 처리량 3배 증가

---

## 📚 이전 버전

- **v3.1**: Lite 워크플로우 (2025-10-23)
- **v3.0**: 6단계 Full 워크플로우 (2025-10-21)

**이전 버전 보관**: `docs/레거시/workflows/`

---

## 🎯 v3.2의 핵심 개선

### 문제점 (v3.1)
- ❌ 6단계 Full 워크플로우 → AI 감당 불가능
- ❌ 우선순위 없음 → 모든 작업이 동일 비용
- ❌ 문서 드리프트 → Step 4 60% 건너뜀
- ❌ 50+ 문서 관리 → 혼란스러움

### 해결책 (v3.2)
- ✅ 3가지 Priority 기반 (A/B/C)
- ✅ 각 Priority별 차별화된 Step
- ✅ 자동 Priority 판단 (AI)
- ✅ 문서 레거시화 (자동 정리)

---

## 📊 Priority 기반 워크플로우

### Priority A: 아키텍처/API 변경 (Full 워크플로우)

**적용 대상:**
```
✅ API 엔드포인트 추가/변경
✅ 새 RPC 통합 (예: Ankr JSON-RPC)
✅ Breaking change
✅ Phase 진행 상황 변경
✅ 핵심 아키텍처 파일 수정
```

**실행 단계 (6단계 전부):**
```
Step 1: 문서 확인 (SSOT 참고)
  └─ docs/ssot/README.md 섹션 6-7 검토

Step 2: 명령 아카이빙
  └─ instructions/[요청명]_[타임].md 생성

Step 3: 코드 + 문서 동시 수정
  └─ 코드 구현 + docs/ssot/ 동시 업데이트

Step 4: 버전 업데이트
  └─ CHANGELOG.md 상세 기록 (5줄+)
  └─ package.json 버전 변경

Step 5: 해결 기록
  └─ solutions/[요청명]_[타임]_solution.md 생성

Step 6: 칸반 업데이트
  └─ kanban.md [In Progress] → [Done]
```

**시간**: 2-4시간  
**빈도**: 1-2주마다  
**예시**: v2.1 RPC 아키텍처 추가

---

### Priority B: 기능 추가/버그 수정 (Mid 워크플로우)

**적용 대상:**
```
✅ 새 기능 추가 (기존 API 범위 내)
✅ 버그 수정
✅ 성능 최적화
✅ 코드 리팩토링 (기능 동일)
✅ 라이브러리 업그레이드
```

**실행 단계 (1,2,5 생략):**
```
Step 1: [SKIP] 문서 확인
  └─ 이미 문서화된 범위이므로 생략

Step 2: [SKIP] 명령 아카이빙
  └─ 임시 요청이므로 생략

Step 3: 코드 수정 (필수)
  └─ 버그/기능 구현
  └─ 테스트 완료

Step 4: CHANGELOG 간단 기록 (1-2줄)
  └─ "[fix] 버그 설명" 형식
  └─ PATCH 버전 업데이트 (+0.0.1)

Step 5: [SKIP] 해결 기록
  └─ 중요도 낮으므로 생략

Step 6: 칸반 업데이트
  └─ kanban.md [In Progress] → [Done]
```

**시간**: 30분 - 1시간  
**빈도**: 수시  
**예시**: 로그인 버그 수정

---

### Priority C: 문서 수정/리팩토링 (Light 워크플로우)

**적용 대상:**
```
✅ 문서 오타 수정
✅ 코드 주석 개선
✅ 변수명 리팩토링
✅ 포맷팅 정리
✅ 불필요한 파일 삭제
```

**실행 단계 (6만):**
```
Step 1-5: [모두 SKIP]
  └─ 빠른 처리를 위해 모두 생략

Step 6: 칸반 업데이트 (필수만)
  └─ kanban.md [In Progress] → [Done]
```

**시간**: 5-15분  
**빈도**: 수시  
**예시**: README 오타 수정

---

## 🤖 AI의 자동 Priority 판단

**파일 변경 감지 → Priority 자동 결정:**

```javascript
const AUTO_PRIORITY_RULES = {
  'functions/api/rpc-utils.ts': 'A',           // Critical
  'functions/api/initiate-withdrawal.ts': 'A', // Critical
  'docs/ssot/*.md': 'A',                       // SSOT
  'functions/api/*.ts': 'B',                   // Normal API
  'src/**/*.tsx': 'B',                         // Component
  'docs/**/*.md': 'C',                         // Documentation
  '*': 'C'                                     // Default
};
```

**판단 플로우:**
1. 파일 패턴 매칭 → 기본 Priority 결정
2. 변경 유형 분석 → 필요시 상향 (예: B → A)
3. 변경 라인 수 확인 → 대규모 변경이면 상향

---

## 📋 세션 시작 체크리스트

```markdown
## 🚀 세션 시작 (5분)

### Phase 1: 상태 파악
- [ ] kanban.md 확인 (진행 중인 작업?)
- [ ] CHANGELOG.md 확인 (최신 버전?)
- [ ] docs/ssot/README.md 헤더 확인 (최신 아키텍처?)

### Phase 2: 신규 요청 분류 (1분)
사용자 요청을 받으면:
```
사용자 요청
  │
  ├─ "API 추가" / "RPC 통합" / "아키텍처 변경"
  │  → Priority A (Full 워크플로우)
  │
  ├─ "버그 고쳐" / "기능 추가" / "성능 개선"
  │  → Priority B (Mid 워크플로우)
  │
  └─ "오타 수정" / "리팩토링" / "주석 수정"
     → Priority C (Light 워크플로우)
```

### Phase 3: 해당 워크플로우 선택
- Priority A → 이 문서의 "Priority A" 섹션 참조
- Priority B → 이 문서의 "Priority B" 섹션 참조
- Priority C → 이 문서의 "Priority C" 섹션 참조
```

---

## ⚡ Quick Reference

| Priority | 대상 | Step 실행 | 시간 | 빈도 |
|----------|------|----------|------|------|
| **A** | 아키텍처 | 1-6 | 2-4h | 1-2주 |
| **B** | 기능/버그 | 3,4,6 | 30-60m | 수시 |
| **C** | 문서 | 6 | 5-15m | 수시 |

---

## 📞 자주 묻는 질문

### Q1: Priority를 잘못 판단하면?
**A:** 괜찮습니다. 대부분 맞을 것이고, 틀려도 사용자가 지적하면 수정하면 됩니다.

### Q2: 기존 6단계 Full 워크플로우는?
**A:** 레거시에 보관됨. `docs/레거시/workflows/` 참조 (Reference용)

### Q3: CHANGELOG.md는 어떻게?
**A:**
- **Priority A**: 5줄 이상 상세히
- **Priority B**: 1-2줄 간단히
- **Priority C**: 기록 안 함

---

## 🎓 참고 문서

- **상세 제안**: `docs/workflows/[워크플로우-v3.2]AI-에이전트-Priority기반-개선안_20251024_000000.md`
- **문제 분석**: `docs/solutions/[분석]_문서화-인플레이션-문제-및-워크플로우-개선안_20251024_000000.md`
- **레거시 문서**: `docs/레거시/workflows/` (참고용)

---

**마지막 업데이트**: 2025-10-24  
**상태**: ✅ Phase 2 구현 (Priority 판단 시작)

