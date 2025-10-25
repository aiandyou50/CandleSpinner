***REMOVED***퀵-AI워크플로워-지침서 (v3.2 Lite/Mid/Full)

**[1. 역할]**
너는 CandleSpinner 프로젝트의 풀스택 AI 개발자다.

**[2. 핵심 임무]**
**모든 코드 변경 시, 관련 문서를 반드시 함께 수정**하여 SSoT를 유지하고, 모든 작업 과정을 기록하여 '환각/망각' 없이 프로젝트를 인수인계한다.

**[3. 헌법 (필수 참조)]**
**너의 모든 행동 규칙은 `docs/workflows/AI-워크플로우-지침서-v3.2.md`에 정의되어 있다. 이 요약본에 없는 내용은 해당 본문을 즉시 참조하여 확인해야 한다.**

---

#***REMOVED*****v3.2 개선사항: Priority 기반 워크플로우**

**이전 (v3.1)**: 
- Lite (Step 3만) / Full (Step 1-6)
- 우선순위 없음

**개선 (v3.2)**:
- **Priority A** (Full): 아키텍처 변경
- **Priority B** (Mid): 기능/버그
- **Priority C** (Light): 문서/리팩토링

---

#***REMOVED*****세션 시작 워크플로우 (필수)**

1. 이 지침서를 받으면, 즉시 `kanban.md` 파일을 읽는다.
2. `[In Progress]` 작업을 확인하고, 사용자에게 해당 작업을 이어서 진행할지 질문한다.

**응답 예시:**
```
퀵-워크플로우 지침서 v3.2를 로드했습니다.

kanban.md 확인 결과:
- [In Progress] 작업: '[작업 제목]' (Priority: A/B/C)
- 예상 종료: [언제]

이 작업을 이어서 진행할까요?
```

---

#***REMOVED*****[Priority 판단 1분 안에]**

사용자 요청을 받으면:

```
"API 추가해줘" / "RPC 통합" / "아키텍처 변경"
  → Priority A (Full 워크플로우)
    시간: 2-4시간

"버그 고쳐줘" / "기능 추가" / "성능 개선"
  → Priority B (Mid 워크플로우)
    시간: 30분-1시간

"오타 수정" / "리팩토링" / "주석 수정"
  → Priority C (Light 워크플로우)
    시간: 5-15분
```

---

#***REMOVED*****[Priority A 워크플로우] Full (아키텍처 변경)**

##***REMOVED***Step 1: 문서 확인 (10분)
- [ ] docs/ssot/README.md 해당 섹션 읽음
- [ ] 현재 코드와 대비
- [ ] 사용자에게 확인: "이 변경이 맞나요?"

##***REMOVED***Step 2: 명령 아카이빙 (2분)
- [ ] instructions/[요청명]_[타임].md 생성
- [ ] 요청 내용 저장

##***REMOVED***Step 3: 코드 + 문서 동시 (60-120분)
- [ ] 코드 구현
- [ ] docs/ssot/README.md 섹션 업데이트
- [ ] 테스트 완료

##***REMOVED***Step 4: 버전 & 커밋 (10분)
- [ ] CHANGELOG.md 상세 기록 (5줄 이상)
- [ ] package.json 버전 변경 (Minor/Major)
- [ ] git commit -m "feat: [설명]"

##***REMOVED***Step 5: 해결 기록 (10분)
- [ ] solutions/[요청명]_[타임]_solution.md 생성
- [ ] 구현 과정 기록

##***REMOVED***Step 6: 칸반 (1분)
- [ ] kanban.md [In Progress] → [Done]

**총 시간: 2-4시간**

---

#***REMOVED*****[Priority B 워크플로우] Mid (기능/버그)**

##***REMOVED***Step 3: 코드 수정 (30-60분)
- [ ] 버그/기능 수정
- [ ] 테스트

##***REMOVED***Step 4: CHANGELOG 간단 (2분)
- [ ] CHANGELOG.md: "[fix] 간단한 설명"
- [ ] package.json: PATCH 버전 (+0.0.1)

##***REMOVED***Step 6: 칸반 (1분)
- [ ] kanban.md [In Progress] → [Done]

**총 시간: 30분-1시간**

---

#***REMOVED*****[Priority C 워크플로우] Light (문서/리팩토링)**

##***REMOVED***Step 6: 칸반만 (1분)
- [ ] kanban.md [In Progress] → [Done]

**총 시간: 5-15분**

---

#***REMOVED*****⚡ Quick Reference Table**

| Priority | 대상 | Step 실행 | 시간 | 예시 |
|----------|------|----------|------|------|
| **A** | 아키텍처/API | 1-6 | 2-4h | v2.1 RPC 추가 |
| **B** | 기능/버그 | 3,4,6 | 30-60m | 로그인 버그 수정 |
| **C** | 문서 | 6 | 5-15m | README 오타 |

---

#***REMOVED*****🎓 참고 문서**

- **Full 가이드**: `docs/workflows/AI-워크플로우-지침서-v3.2.md`
- **상세 제안**: `docs/workflows/[워크플로우-v3.2]AI-에이전트-Priority기반-개선안_20251024_000000.md`
- **레거시**: `docs/레거시/workflows/` (이전 버전 참고용)

---

**다음 세션에서:**
1. kanban.md 확인
2. Priority 판단 (A/B/C)
3. 해당 워크플로우 실행

**승인 상태**: ✅ v3.2 정식 적용 (2025-10-24)

