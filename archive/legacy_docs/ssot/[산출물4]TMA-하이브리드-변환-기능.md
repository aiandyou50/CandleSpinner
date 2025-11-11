# [산출물 4] Telegram Mini App(TMA) 하이브리드 계획 (2025-11-02)

> **상태:** 구현 일시 중단. 현재 릴리스에서는 표준 웹(브라우저) 환경만 지원하며, TMA SDK 의존성은 코드베이스에 포함되어 있지 않다. 본 문서는 향후 통합을 위한 기준을 정리한다.

## 1. 목표

- Telegram In-App Browser(TonConnect 지원)를 활용해 CandleSpinner를 “웹 + Telegram” 이중 채널로 제공.  
- 동일한 React 코드베이스를 사용하되, TMA API를 감지하여 UI를 조정하는 하이브리드 전략 확립.  
- 인출 보안 모델(수동 큐, 0.2 TON 수수료)은 그대로 유지한다.

## 2. 요구사항 체크리스트

| 항목 | 현재 상태 | 메모 |
|------|-----------|------|
| TMA SDK 설치 (`@twa-dev/sdk`) | ❌ 미설치 | 재도입 시 npm 설치 + 번들 사이즈 영향 분석 필요 |
| Telegram WebApp 감지 | ⚠️ 미구현 | `window.Telegram?.WebApp` 감지 훅 작성 계획 |
| TonConnect 동작 | ✅ 가능 | TonConnect는 In-App Browser에서도 지원되므로 재사용 | 
| UI 맞춤 (MainButton, BackButton) | ❌ 미구현 | Drawer 대신 Telegram 네이티브 버튼 사용 검토 |
| Help / Support 링크 | ✅ | 외부 링크는 Telegram 내에서도 동작 |
| Analytics | ❌ 미구현 | Telegram initData 기반 사용자 통계 수집 고려 |

## 3. 제안 아키텍처 (미래안)

```
if (isTMA()) {
  WebApp.ready()
  WebApp.expand()
  useTelegramTheme()
  render(<TMAFrame />)
} else {
  render(<WebFrame />)
}
```

- **TMAFrame**: Telegram MainButton을 사용해 슬롯 실행/입금/인출 CTA 제공, BackButton을 Drawer 대체 용도로 활용.  
- **WebFrame**: 현재 구현과 동일(AppBar + Drawer + SlotMachineV2).

## 4. UX 고려사항

- Telegram 환경에서는 화면 높이가 제한되므로 SlotMachine 영역을 세로 스크롤로 분리.  
- 언어 선택 드롭다운은 Telegram 헤더와 겹치지 않도록 절대 위치 조정 필요.  
- 다이얼로그(HelpDialog)는 Telegram `showPopup` API 사용 검토.

## 5. 데이터 및 보안

- `WebApp.initData`를 Worker로 전달하여 Telegram 사용자 ID와 지갑 주소를 매핑하면 봇 남용 탐지에 도움이 된다.  
- 단, 현재 인출은 지갑 주소 기준으로 큐 관리 중이므로 Telegram ID 연동은 선택 사항.  
- initData 검증은 HMAC(SHA256) 기반 Telegram 공식 절차를 따른다.

## 6. 도입 로드맵 (제안)

1. **Phase A - 탐색:** `@twa-dev/sdk` 설치, 환경 감지 훅 작성, 개발 빌드에서만 TMA 레이아웃 노출.  
2. **Phase B - UI 통합:** MainButton/BackButton, 테마 컬러 적용, 언어 선택/도움말 UI 정비.  
3. **Phase C - 데이터 수집:** initData를 백엔드로 전달하여 사용자 통계 수집, 인출 큐와 연계.  
4. **Phase D - QA & 롤아웃:** Telegram 환경 전용 QA 후 프로덕션 점진 도입.

## 7. 보류 사유

- 당장 해결해야 할 우선순위(모바일 Drawer 개선, 문서 최신화, 인출 수수료 정책 정착)가 더 높음.  
- Telegram Mini App은 초기 접근성은 높지만 유지보수 범위가 커져 MVP 일정에 영향을 줄 수 있음.  
- Cloudflare Worker 보안 점검 및 KV 백업 개선이 선행되어야 함.

---

**결론:** TMA 지원은 장기적인 확장 목표로 유지하되, 현재 MVP는 웹 브라우저 기반으로 운영한다. 향후 작업 착수 시 본 문서를 기반으로 세부 구현 계획을 업데이트할 예정이다.
***REMOVED***[산출물 4] TMA 하이브리드 변환 기능 (v2.0 최종)

#***REMOVED***프로젝트명: CandleSpinner
#***REMOVED***버전: 2.0 (Phase 2 완료, TMA 통합 완성)
#***REMOVED***작성일: 2025년 10월 20일
#***REMOVED***최종 업데이트: 2025년 10월 21일
#***REMOVED***상태: ✅ 현재 코드 반영 (프로덕션 배포 중)

> **📌 참고**: 이 문서는 Telegram Mini App 통합의 구체적 구현을 설명합니다.  
> 최신 아키텍처는 `/docs/ssot/README.md` 섹션 3을 참고하세요.

#***REMOVED***1. TMA 개념 및 개요

##***REMOVED***1.1 TMA(Telegram Mini Apps)란?
Telegram Mini Apps(TMA)는 Telegram 생태계 내에서 실행되는 웹 애플리케이션으로, Telegram의 네이티브 UI/UX를 활용하여 사용자에게 향상된 모바일 경험을 제공합니다.

##***REMOVED***1.2 하이브리드 접근 방식
CandleSpinner는 **하이브리드 아키텍처**를 채택하여 다음과 같은 환경에서 최적화된 경험을 제공합니다:

- **일반 웹 브라우저**: TonConnect 프로토콜을 통한 표준 지갑 연결
- **Telegram Web App**: TMA SDK를 활용한 네이티브 Telegram 경험

---

#***REMOVED***2. 기술 구현 세부사항

##***REMOVED***2.1 TMA SDK 통합
```typescript
// @twa-dev/sdk 사용
import WebApp from '@twa-dev/sdk';

// TMA 초기화
WebApp.ready();
WebApp.expand();
WebApp.setHeaderColor('#1a1a2e');
WebApp.setBackgroundColor('#16213e');
```

##***REMOVED***2.2 환경 감지 및 조건부 렌더링
```typescript
// Telegram Web App 환경 감지
const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;

// 조건부 컴포넌트 렌더링
{isTMA ? <TMADeposit /> : <StandardDeposit />}
```

##***REMOVED***2.3 TMA 전용 컴포넌트: TMADeposit

###***REMOVED***2.3.1 컴포넌트 구조
```tsx
interface TMADepositProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

export const TMADeposit: React.FC<TMADepositProps> = ({
  onDepositSuccess,
  onBack
}) => {
  // TMA 전용 로직 구현
}
```

###***REMOVED***2.3.2 TMA UI 컨트롤
- **MainButton**: 입금 액션 버튼 (텔레그램 하단에 고정)
- **BackButton**: 뒤로가기 버튼 (텔레그램 헤더 좌측)
- **색상 테마**: Telegram 다크 테마에 맞춤

###***REMOVED***2.3.3 사용자 데이터 접근
```typescript
// Telegram 사용자 정보
const user = WebApp.initDataUnsafe?.user;
const telegramId = user?.id;
const username = user?.username;
```

##***REMOVED***2.4 하이브리드 라우팅 로직
```typescript
// App.tsx에서 환경에 따른 라우팅
function App() {
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;

  return (
    <TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
      {isTMA ? (
        <TMAInterface />
      ) : (
        <WebInterface />
      )}
    </TonConnectUIProvider>
  );
}
```

---

#***REMOVED***3. 사용자 경험 플로우

##***REMOVED***3.1 일반 웹 브라우저 플로우
1. 사용자가 candle-spinner.com 접속
2. TonConnect 버튼으로 지갑 연결
3. 게임 플레이 및 CSPIN 입금/인출

##***REMOVED***3.2 Telegram Web App 플로우
1. 사용자가 Telegram 봇 채팅에서 Mini App 실행
2. TMA 환경에서 자동으로 Telegram 계정 인식
3. MainButton을 통한 직관적인 입금 경험
4. BackButton으로 네이티브 네비게이션

##***REMOVED***3.3 크로스 플랫폼 일관성
- 동일한 게임 로직 및 UI 디자인
- 플랫폼별 최적화된 인터랙션
- 통합된 TON 블록체인 연동

---

#***REMOVED***4. 보안 및 검증

##***REMOVED***4.1 TMA 데이터 검증
```typescript
// initData 검증 (서버사이드)
const isValid = WebApp.initDataUnsafe?.user?.id;
if (!isValid) {
  WebApp.showAlert('텔레그램 사용자 정보를 가져올 수 없습니다.');
}
```

##***REMOVED***4.2 하이브리드 환경에서의 보안 고려사항
- Telegram Web App에서는 추가적인 사용자 검증 생략 가능
- 일반 웹에서는 TonConnect를 통한 지갑 서명 검증
- 양쪽 모두 동일한 CSPIN 토큰 컨트랙트 사용

---

#***REMOVED***5. 배포 및 설정

##***REMOVED***5.1 Telegram 봇 설정
```javascript
// setup-bot.js
const bot = new TelegramBot(token, { polling: true });
bot.setWebAppButton('🎰 게임 시작', webAppUrl);
```

##***REMOVED***5.2 Cloudflare Pages 배포
- 동일한 코드베이스에서 다중 플랫폼 지원
- 환경 변수로 플랫폼별 설정 분리
- 자동 빌드 및 글로벌 CDN 배포

---

#***REMOVED***6. 확장 가능성 및 미래 계획

##***REMOVED***6.1 추가 TMA 기능
- 결제 알림 (WebApp.showAlert)
- 파일 공유 (WebApp.showPopup)
- 연락처 접근 (WebApp.requestContact)

##***REMOVED***6.2 멀티 플랫폼 전략
- Telegram 채널/그룹 통합
- 봇 커맨드를 통한 빠른 접근
- 푸시 알림을 통한 사용자 재참여 유도

---

#***REMOVED***7. 결론

TMA 하이브리드 변환을 통해 CandleSpinner는 다음과 같은 이점을 얻습니다:

- **향상된 사용자 경험**: Telegram 사용자에게 네이티브 앱과 같은 경험 제공
- **접근성 향상**: 봇 채팅에서 바로 게임 실행 가능
- **크로스 플랫폼 호환성**: 웹과 Telegram 모두에서 동일한 기능 제공
- **TON 생태계 통합**: Telegram Wallet 사용자 대상 최적화

이 구현은 Web3 게임의 새로운 사용자 확보 채널로서의 Telegram 플랫폼의 잠재력을 최대한 활용합니다.