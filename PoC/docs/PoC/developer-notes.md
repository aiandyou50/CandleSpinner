***REMOVED***CandleSpinner PoC 개발자 노트

#***REMOVED***프로젝트 개요
CandleSpinner는 TON 블록체인 기반의 Web3 슬롯머신 게임입니다. 이 문서는 PoC (Proof of Concept) 단계의 개발 과정을 기록한 것입니다.

#***REMOVED***기술 스택 결정

##***REMOVED***프론트엔드
- **React + TypeScript + Vite**: 빠른 개발과 타입 안전성 확보
- **TON Connect**: 지갑 연동 표준 라이브러리
- **ton-core**: TON 블록체인 기본 기능

##***REMOVED***백엔드
- **Cloudflare Pages Functions**: 서버리스 API
- **TON RPC**: 블록체인 데이터 조회

#***REMOVED***구현 과정 로그

##***REMOVED***Phase 1: 기본 설정 (2025-10-18 09:00)
- 프로젝트 초기화: `npm create vite@latest`
- TON Connect 매니페스트 설정
- 기본 컴포넌트 구조 설계

##***REMOVED***Phase 2: 지갑 연결 구현 (2025-10-18 09:30)
```typescript
// src/App.tsx
<TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
  <TonConnectButton />
  <PoCComponent />
</TonConnectUIProvider>
```

**결정 이유**: TON Connect 공식 예제 따라 구현. UI 제공 컴포넌트 사용으로 빠른 프로토타이핑.

##***REMOVED***Phase 3: 제톤 지갑 파생 (2025-10-18 10:00)
**초기 접근**: ton-core의 getJettonWalletAddress 사용 시도
```typescript
// 실패한 코드
const res = (ton as any).getJettonWalletAddress(CSPIN_TOKEN_ADDRESS, walletAddress);
```

**문제**: ton-core v0.50.0에 해당 함수 없음
**해결**: RPC 기반 파생 구현
```typescript
// 성공한 코드
const getJettonWalletAddressRpc = async (master, owner) => {
  // runGetMethod 호출
};
```

**교훈**: 라이브러리 버전 호환성 사전 확인 필요

##***REMOVED***Phase 4: 페이로드 빌드 (2025-10-18 10:30)
**초기 구현**:
```typescript
const cell = beginCell()
  .storeUint(0xF8A7EA5, 32)
  .storeUint(0, 64)
  .storeCoins(amount)
  .storeAddress(destination)
  .storeAddress(responseTo)
  .endCell();
```

**문제**: custom_payload와 forward_payload 누락
**해결**: TEP-74 표준 검토 후 추가
```typescript
const cell = beginCell()
  .storeUint(0xF8A7EA5, 32)
  .storeUint(0, 64)
  .storeCoins(amount)
  .storeAddress(destination)
  .storeAddress(responseTo)
  .storeBit(0) // custom_payload
  .storeCoins(BigInt(0)) // forward_ton_amount
  .storeBit(0) // forward_payload
  .endCell();
```

**교훈**: 블록체인 표준 문서 철저히 검토

##***REMOVED***Phase 5: 트랜잭션 전송 (2025-10-18 11:00)
**구현**:
```typescript
const tx = {
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [{
    address: to,
    amount: value,
    payload: payloadBase64
  }]
};
const result = await tonConnectUI.sendTransaction(tx);
```

**문제**: 검증 실패 반복
**해결**: 페이로드 구조 수정 (Phase 4)

##***REMOVED***Phase 6: UI/UX 개선 (2025-10-18 11:30)
- 복사 버튼 추가
- txJson 출력 상자 구현
- 디버그 팩 개선
- 불필요 기능 제거 (증거 기능)

##***REMOVED***Phase 7: 에러 처리 및 디버깅 (2025-10-18 12:00)
- 사용자 친화적 에러 메시지
- 디버그 정보 자동 수집
- 콘솔 로그 추가

#***REMOVED***기술적 결정 및 근거

##***REMOVED***1. React Hooks 사용
**결정**: useTonConnect, useRpc 커스텀 훅 생성
**근거**: 코드 재사용성 및 관심사 분리
**대안 고려**: Context API, Redux

##***REMOVED***2. TypeScript 엄격 모드
**결정**: strict: true 설정
**근거**: 런타임 에러 방지
**영향**: 초기 개발 속도 저하, 장기적 안정성 향상

##***REMOVED***3. 서버리스 아키텍처
**결정**: Cloudflare Pages Functions
**근거**: 무료 티어, 글로벌 CDN, 쉬운 배포
**대안 고려**: Vercel, Netlify Functions

##***REMOVED***4. 한국어 UI
**결정**: 모든 UI 텍스트 한국어로 번역
**근거**: 타겟 사용자(한국인) 편의성
**구현**: 수동 번역 및 검토

#***REMOVED***버그 해결 로그

##***REMOVED***Bug #1: 제톤 지갑 파생 실패
- **증상**: deriveStatus: "ton-core에서 헬퍼를 찾을 수 없습니다"
- **원인**: ton-core 라이브러리 API 변경
- **해결**: RPC 직접 호출 구현
- **시간**: 30분

##***REMOVED***Bug #2: 페이로드 검증 실패
- **증상**: "Transaction verification failed"
- **원인**: custom_payload 필드 누락
- **해결**: storeBit(0) 추가
- **시간**: 1시간

##***REMOVED***Bug #3: 지속적 검증 실패
- **증상**: 동일 오류 반복
- **원인**: forward_payload 필드 누락
- **해결**: storeBit(0) 추가
- **시간**: 30분

##***REMOVED***Bug #4: UI 줄바꿈 문제
- **증상**: \n 문자 표시
- **원인**: HTML pre 태그 처리
- **해결**: 개별 pre 태그 사용
- **시간**: 15분

#***REMOVED***성능 최적화

##***REMOVED***1. 빌드 최적화
- Vite 사용으로 빠른 개발 서버
- Tree shaking으로 번들 크기 최소화
- 현재 번들 크기: ~860KB (gzipped: 262KB)

##***REMOVED***2. 런타임 최적화
- 불필요한 리렌더링 방지 (React.memo)
- 지연 로딩 구현 가능성 검토

#***REMOVED***보안 고려사항

##***REMOVED***1. API 키 관리
- 환경 변수 사용 (.env 파일)
- 클라이언트 사이드 노출 최소화

##***REMOVED***2. 사용자 데이터 처리
- 지갑 주소 외 민감 정보 저장 금지
- HTTPS 강제

##***REMOVED***3. 트랜잭션 검증
- 클라이언트 사이드 검증 구현
- 서버 사이드 검증 고려

#***REMOVED***테스트 전략

##***REMOVED***단위 테스트
- 페이로드 빌드 함수 테스트
- 유틸리티 함수 테스트
- 현재: 수동 테스트 위주

##***REMOVED***통합 테스트
- 지갑 연결 플로우
- 트랜잭션 전송 시나리오
- 현재: 개발자 수동 테스트

##***REMOVED***E2E 테스트
- Playwright 또는 Cypress 고려
- 현재: 구현되지 않음

#***REMOVED***배포 및 운영

##***REMOVED***CI/CD
- GitHub Actions 사용
- 자동 빌드 및 배포
- 현재: 수동 배포

##***REMOVED***모니터링
- 에러 로깅 (console.log)
- 사용자 피드백 수집
- 현재: 기본적

#***REMOVED***향후 개선 계획

##***REMOVED***Phase 2: 게임 로직 구현
- 슬롯머신 알고리즘
- 당첨 확률 계산
- 크레딧 시스템

##***REMOVED***Phase 3: UI/UX 향상
- PixiJS 그래픽 엔진 통합
- 반응형 디자인
- 다국어 지원

##***REMOVED***Phase 4: 백엔드 개발
- Cloudflare Workers 게임 로직
- 데이터베이스 설계
- API 보안

#***REMOVED***교훈 및 베스트 프랙티스

1. **표준 문서 우선**: 블록체인 개발 시 공식 표준 철저히 검토
2. **점진적 개발**: 복잡한 기능은 작은 단위로 나누어 구현
3. **철저한 테스트**: 각 기능 구현 후 즉시 테스트
4. **문서화**: 개발 과정 기록으로 지식 공유
5. **커뮤니티 활용**: 오픈소스와 커뮤니티 적극 참여

#***REMOVED***참고 자료
- [TON Documentation](https://docs.ton.org/)
- [TON Connect](https://docs.ton.org/develop/dapps/ton-connect)
- [TEP-74 Jetton Standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)
- [ton-core GitHub](https://github.com/ton-org/ton-core)

#***REMOVED***버전 히스토리
- v0.1.0 (2025-10-18): PoC 완료, CSPIN 전송 기능 구현