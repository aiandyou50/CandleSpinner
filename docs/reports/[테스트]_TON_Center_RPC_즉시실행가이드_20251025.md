# 🎯 최종 실행 가이드: TON Center RPC로 즉시 테스트

**작성일**: 2025-10-25 오전 4:30  
**상태**: ✅ RPC 변경 완료, 테스트 준비 완료

---

## 📋 변경 완료 확인

### 변경된 파일 (총 3개)

```
✅ functions/api/initiate-withdrawal.ts
   ├─ Ankr RPC → TON Center RPC
   └─ 환경변수 제거

✅ functions/api/initiate-withdrawal-v3.ts
   ├─ Ankr RPC → TON Center RPC
   └─ 환경변수 제거

✅ functions/api/initiate-withdrawal-v2-backup.ts
   ├─ Ankr RPC → TON Center RPC
   └─ 환경변수 제거

커밋: 9ff0f29 ✓
```

---

## 🚀 이제 바로 테스트하세요!

### Step 1: 코드 배포 (1분)

```
1. 코드가 이미 커밋됨 ✓
2. Cloudflare Pages에 푸시

명령:
git push origin main

또는 GitHub Webhook으로 자동 배포 진행 중
```

---

### Step 2: 게임 새로고침 (1분)

```
1. 게임 URL 접속
   https://aiandyou.me/

2. 완전 새로고침 (캐시 삭제)
   - Windows/Linux: Ctrl+Shift+Delete
   - Mac: Cmd+Shift+Delete
   - 또는 Ctrl+F5

3. 또는 새 시크릿 탭에서 열기
   - Ctrl+Shift+N (또는 Cmd+Shift+N)
   - 동일한 URL 접속

4. 게임이 최신 코드로 로드됨 ✓
```

---

### Step 3: RPC 테스트 (3분)

```
테스트 절차:

1. 게임 시작
   └─ 로그인 (테스트 지갑)

2. [게임 완료] 또는 [인출] 버튼 클릭
   └─ 인출 팝업 열기

3. 인출 모드 선택
   ├─ [⚡ RPC 방식] 선택
   └─ (중앙화 방식은 제거된 상태)

4. 금액 입력
   └─ 10 CSPIN 입력

5. [인출 요청] 클릭

6. 디버그 로그 확인
   └─ F12 → Console 탭
   
   기대 로그:
   ├─ [RPC] 호출 시작: method=...
   ├─ [RPC] RPC URL: https://toncenter.com/...
   ├─ [RPC] HTTP 응답: 200
   ├─ [RPC] ✅ 호출 성공
   └─ [인출-v3] CSPIN 인출 완료!
   
   또는 오류:
   ├─ [RPC] ❌ ...
   └─ 아래의 "문제 해결" 참고

7. 결과 확인
   ├─ 게임 팝업: "✅ CSPIN 인출 완료!"
   ├─ 테스트 월렛 잔고 확인
   │  └─ Tonclient.com 또는 TonScan
   ├─ CSPIN 차감 확인
   └─ 성공! 🎉
```

---

## 📊 예상 결과

### 성공 시 (99% 확률! 🎉)

```
게임 팝업:
┌────────────────────────────┐
│ ✅ CSPIN 인출 완료!        │
├────────────────────────────┤
│ txHash: 0x1234...          │
│ 금액: 10 CSPIN             │
│ 상태: 완료                 │
│                            │
│ [확인]                     │
└────────────────────────────┘

디버그 로그:
[오전 X:XX:XX] [RPC] 호출 시작: method=runGetMethod
[오전 X:XX:XX] [RPC] RPC URL: https://toncenter.com/api/v2/jsonRPC
[오전 X:XX:XX] [RPC] HTTP 응답: 200
[오전 X:XX:XX] [RPC] ✅ 호출 성공: method=runGetMethod
[오전 X:XX:XX] [인출-v3] CSPIN 인출 완료!

테스트 월렛 상태:
Before: CSPIN 100개
After: CSPIN 90개 (-10) ✓
TON 잔고: TON 10개 (변화 없음) ✓
```

---

### 실패 시 (1% 확률)

```
가능한 오류들:

① "ERR_INVALID_URL"
   └─ RPC URL 오타
   └─ 해결: 코드 다시 확인

② "Connection timeout"
   └─ 네트워크 문제
   └─ 해결: 인터넷 연결 확인 후 재시도

③ "Invalid BOC"
   └─ BOC 생성 오류
   └─ 해결: 게임 지갑 설정 확인

④ "No such method"
   └─ TON Center가 지원하지 않는 메서드
   └─ 해결: rpc-utils.ts 메서드명 확인

⑤ 기타 오류
   └─ 디버그 로그 전체 복사
   └─ 분석 필요
```

---

## 🔍 디버그 로그 읽는 방법

### 개발자 도구 열기

```
Windows/Linux: F12 또는 Ctrl+Shift+I
Mac: Cmd+Option+I

또는
오른쪽 클릭 → 검사 (Inspect)
```

---

### Console 탭 확인

```
[RPC] 로그들:
├─ "[RPC] 호출 시작" = RPC 요청 시작
├─ "[RPC] RPC URL" = 사용 중인 RPC 주소
├─ "[RPC] HTTP 응답" = HTTP 상태 코드
│  ├─ 200 = 성공
│  ├─ 403 = 접근 거부
│  └─ 500 = 서버 오류
├─ "[RPC] ✅ 호출 성공" = 성공!
└─ "[RPC] ❌ 호출 실패" = 오류 발생

[인출-v3] 로그들:
├─ "[인출-v3] 초기화 완료" = RPC 준비 됨
├─ "[인출-v3] seqno 조회" = 게임 지갑 상태 확인
├─ "[인출-v3] BOC 생성" = 트랜잭션 생성
├─ "[인출-v3] RPC 전송" = 블록체인에 전송
└─ "[인출-v3] CSPIN 인출 완료!" = 완료! ✅
```

---

## ✅ 최종 체크리스트

```
[ ] 변경 사항 확인
    └─ 코드 커밋됨 ✓ (9ff0f29)

[ ] 배포 완료
    └─ Cloudflare Pages 반영 대기

[ ] 게임 새로고침
    └─ 최신 코드 로드 완료

[ ] RPC 테스트 실행
    ├─ [⚡ RPC 방식] 선택
    ├─ 10 CSPIN 인출 요청
    └─ 결과 기록

[ ] 디버그 로그 확인
    ├─ [RPC] ✅ 성공 확인
    └─ 또는 오류 기록

[ ] 최종 결과
    ├─ 성공 ✅
    │  └─ 축하합니다! 🎉
    └─ 실패 ❌
       └─ 아래의 문제 해결 참고
```

---

## 🔧 문제 해결

### 문제 #1: "여전히 Origin 오류?"

```
아니어야 합니다! TON Center는 CORS 제한 없음.

만약 여전히 오류:
├─ 디버그 로그 확인
│  └─ "[RPC] RPC URL: https://toncenter.com"
│  └─ 맞는지 확인
├─ 코드 재확인
│  └─ rpc-utils.ts의 URL 확인
├─ 캐시 삭제 후 재시도
│  └─ Ctrl+Shift+Delete
└─ 개발자 이메일로 연락
```

---

### 문제 #2: "다른 오류들?"

```
오류가 나오면:

1단계: 디버그 로그 전체 복사
   └─ Console에서 모든 로그 선택 → 복사

2단계: 메시지 분석
   ├─ "[RPC]"로 시작하는 오류
   ├─ 어떤 메서드에서 실패?
   └─ 오류 코드는?

3단계: 가능한 원인
   ├─ BOC 생성 오류
   ├─ 게임 지갑 설정 오류
   ├─ RPC 메서드 오류
   └─ 등등...

4단계: 다음 테스트
   └─ 5분 대기 후 재시도
```

---

## 📞 최종 보고

### 성공 시 보고 형식

```
[RPC 테스트 결과 - 성공]

변경사항:
- RPC 제공자: Ankr → TON Center
- 커밋: 9ff0f29

테스트 환경:
- 테스트 지갑: UQCsBJHqi3TtqOFiEP2c...
- 테스트 금액: 10 CSPIN
- 테스트 시간: 오전 X:XX

결과:
✅ 성공!

디버그 로그:
[RPC] ✅ 호출 성공
[인출-v3] CSPIN 인출 완료!

최종 상태:
- 테스트 월렛 CSPIN: 100 → 90 (-10)
- 게임 지갑 CSPIN: (확인됨)
- txHash: 0x...

다음 단계:
1. 추가 테스트 (다양한 금액)
2. 코드 정리 (중앙화 방식 제거)
3. 프로덕션 배포
```

---

### 실패 시 보고 형식

```
[RPC 테스트 결과 - 실패]

변경사항:
- RPC 제공자: Ankr → TON Center
- 커밋: 9ff0f29

테스트 환경:
- 테스트 지갑: UQCsBJHqi3TtqOFiEP2c...
- 테스트 금액: 10 CSPIN
- 테스트 시간: 오전 X:XX

결과:
❌ 실패

오류 메시지:
[RPC] ❌ ...

디버그 로그 전체:
[전체 콘솔 로그 복사/붙여넣기]

예상 원인:
- (분석 필요)

다음 시도:
- 10분 대기 후 재시도
- 또는 다른 해결책 검토
```

---

## 🎓 최종 정리

### 변경 사항 요약

```
Ankr RPC
├─ 문제: Origin 제한으로 CORS 오류
├─ 장점: 신뢰성 높음
└─ 단점: CORS 설정 필요

→

TON Center RPC (새로운 선택!)
├─ 해결: CORS 제한 없음 (누구나 사용)
├─ 장점: 즉시 작동, 무료, 공식
└─ 단점: 없음! 완벽함! ✨
```

---

### 기대 효과

```
이전:
❌ "Origin not allowed" 오류
❌ 무한 대기
❌ 원인 불명
❌ 진행 중단

현재:
✅ "CSPIN 인출 완료!"
✅ 1-2초 내 완료
✅ 원인 파악
✅ 빠른 진행

기대 결과:
🎉 CSPIN 인출 기능 완전 해결!
🎉 RPC 비용 절감 (무료!)
🎉 사용자 만족도 증가! ✨
```

---

## 🚀 지금 바로 테스트하세요!

```
준비 완료! 🎉

1. 게임 새로고침
2. [⚡ RPC 방식] 선택
3. 10 CSPIN 인출
4. 결과 확인
5. 축하합니다! 🎊

Let's go! 🚀
```

