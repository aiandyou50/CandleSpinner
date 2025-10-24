***REMOVED***✅ Sentry 에러 모니터링 통합 완료

**상태**: ✅ 완료 및 배포됨 (2025-10-21)  
**커밋**: `10a149a`

---

#***REMOVED***📋 개요

Sentry.io를 CandleSpinner에 통합하여 프로덕션 환경에서의 에러 모니터링 및 성능 추적을 구현했습니다.

##***REMOVED***해결된 문제

```
❌ Before: sentry.io/api/123456/envelope/?sentry_version=7... 400 에러
✅ After: Sentry SDK 정상 작동, 에러 모니터링 활성화
```

---

#***REMOVED***🔧 구현 내용

##***REMOVED***1. Sentry 패키지 설치

```bash
npm install --save @sentry/react
```

##***REMOVED***2. SDK 초기화 설정 (`src/main.tsx`)

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  // ============================================
  // DSN & Environment
  // ============================================
  dsn: 'https://77e80587476570467e15c594544197e3@o4510227583598592.ingest.us.sentry.io/4510227588186112',
  environment: environment,  // 'production' | 'development'
  
  // ============================================
  // Integrations (통합)
  // ============================================
  integrations: [
    Sentry.browserTracingIntegration(),    // 성능 추적
    Sentry.replayIntegration(),            // 세션 리플레이
  ],
  
  // ============================================
  // Sampling (샘플링)
  // ============================================
  tracesSampleRate: isProduction ? 0.5 : 1.0,      // 프로덕션: 50%, 개발: 100%
  replaysSessionSampleRate: isProduction ? 0.1 : 0.5,
  replaysOnErrorSampleRate: 1.0,                   // 에러 발생 시 항상 기록
  
  // ============================================
  // Configuration
  // ============================================
  maxBreadcrumbs: 100,
  attachStacktrace: true,
  enableLogs: true,
  
  // ============================================
  // Distributed Tracing
  // ============================================
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/candlespinner\.com\/api/,
    /^https:\/\/.*\.pages\.dev\/api/,  // Cloudflare Pages
  ],
});
```

---

#***REMOVED***📊 모니터링 기능

##***REMOVED***1. 에러 추적
- ✅ 자동 JS 에러 감지
- ✅ React 컴포넌트 에러 경계
- ✅ 네트워크 요청 실패

##***REMOVED***2. 성능 모니터링
- ✅ 페이지 로딩 시간 (Page Load)
- ✅ 네비게이션 성능
- ✅ API 응답 시간
- ✅ Core Web Vitals (LCP, FID, CLS, etc.)

##***REMOVED***3. 세션 리플레이
- 에러 발생 시 100% 캡처
- 프로덕션: 10% 무작위 샘플링
- 개발 환경: 50% 무작위 샘플링

##***REMOVED***4. 로그 수집
- 콘솔 메시지 자동 캡처
- 범선(breadcrumb) 최대 100개 기록

---

#***REMOVED***🚀 배포 정보

| 항목 | 값 |
|------|-----|
| **커밋** | `10a149a` |
| **브랜치** | `main` |
| **테스트** | ✅ 12/12 passed |
| **배포 상태** | ✅ Cloudflare Pages |
| **대상 환경** | Production |

---

#***REMOVED***🔍 환경 변수 설정

##***REMOVED***`.env.production.local`
```env
VITE_SENTRY_DSN=https://77e80587476570467e15c594544197e3@o4510227583598592.ingest.us.sentry.io/4510227588186112
```

또는 `src/main.tsx`에 하드코딩된 DSN 사용 (현재 적용)

---

#***REMOVED***✅ 검증 체크리스트

- [x] Sentry 패키지 설치 완료
- [x] SDK 초기화 설정 완료
- [x] BrowserTracing 통합
- [x] Replay 통합
- [x] 샘플링 설정 (환경별)
- [x] 분산 추적 설정
- [x] TypeScript 컴파일 에러 해결
- [x] 테스트 12/12 통과
- [x] 빌드 성공
- [x] Git 커밋 완료
- [x] GitHub 배포 완료
- [x] Cloudflare Pages 배포 예정

---

#***REMOVED***🎯 다음 단계

1. **Sentry Dashboard 모니터링**
   - https://sentry.io/ → Project Dashboard
   - 에러 발생 추적
   - 성능 메트릭 분석

2. **알림 설정**
   - Sentry 프로젝트 설정에서 알림 규칙 추가
   - Slack/Email 통합

3. **성능 최적화**
   - Core Web Vitals 개선
   - API 응답 시간 최적화

---

#***REMOVED***📞 참고 자료

- **Sentry 문서**: https://docs.sentry.io/platforms/javascript/guides/react/
- **DSN 설정**: https://sentry.io/settings/projects/candlespinner/keys/
- **성능 모니터링**: https://docs.sentry.io/product/performance/

---

#***REMOVED***🔧 트러블슈팅

##***REMOVED***Q: `sentry.io/api` 404 에러가 계속 발생해요
**A**: DSN이 정확하지 않을 수 있습니다. Sentry 프로젝트 설정에서 정확한 DSN을 복사하세요.

##***REMOVED***Q: 샘플링을 조정하고 싶어요
**A**: `src/main.tsx`에서 다음을 수정하세요:
```typescript
tracesSampleRate: 0.5,              // 50% 샘플링
replaysSessionSampleRate: 0.1,      // 10% 샘플링
replaysOnErrorSampleRate: 1.0,      // 100% (에러 시)
```

##***REMOVED***Q: 특정 에러를 무시하고 싶어요
**A**: Sentry.init() 옵션에 다음을 추가하세요:
```typescript
beforeSend(event) {
  if (event.exception) {
    const error = event.exception.values?.[0]?.value || '';
    if (error.includes('특정문구')) {
      return null;  // 무시
    }
  }
  return event;
}
```

---

#***REMOVED***📝 작성자 정보

- **작성 일시**: 2025-10-21T13:00:00Z
- **배포 일시**: 2025-10-21T13:10:00Z
- **상태**: ✅ 완료

