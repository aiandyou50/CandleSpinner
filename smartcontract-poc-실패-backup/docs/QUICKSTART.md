# 🚀 빠른 실행 가이드

## ✅ 두 가지 문제 해결 완료!

### 1. emergency-pause.html Owner 인증 버그 수정 ✅
- **문제**: raw address (0:453c...) vs bounceable address (UQBFPDd...) 매칭 실패
- **해결**: TonWeb 라이브러리로 주소 변환 후 비교
- **결과**: Owner 지갑 연결 시 정상 인증됨

### 2. 로컬 테스트 서버 환경 구축 완료 ✅
- **백엔드**: 포트 3000에서 실행 중 ✅
- **프론트엔드**: 포트 8080에서 실행 예정
- **자동화**: 원클릭 실행 스크립트 제공

---

## 🎯 가장 간단한 실행 방법

### 방법 1: 자동 스크립트 (권장)

**PowerShell에서**:
```powershell
.\start-test-server.ps1
```

**명령 프롬프트(CMD)에서**:
```cmd
start-test-server.bat
```

**실행 결과**:
- 백엔드 서버 자동 시작 (포트 3000)
- 프론트엔드 서버 자동 시작 (포트 8080)
- 브라우저 자동 열림 → `http://localhost:8080/test-server.html`

---

## 🔧 수동 실행 방법

### 터미널 1: 백엔드 서버
```powershell
cd backend-api
node server.js
```

**성공 메시지**:
```
✅ Owner 키 로드 완료
📍 Public Key: 5889c3f6dada809b36e2fa53a6be362f...

🚀 Signed Voucher API 서버 시작
📍 포트: 3000
📍 컨트랙트: EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
💡 운영 비용: $0/월 (RPC 호출 없음)
```

### 터미널 2: 프론트엔드 서버
```powershell
cd frontend-poc
python -m http.server 8080
```

**성공 메시지**:
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

### 브라우저 접속
```
http://localhost:8080/test-server.html
```

---

## 📁 테스트 페이지 3가지

### 1. 🏠 메인 테스트 페이지 (신규!)
- **URL**: `http://localhost:8080/test-server.html`
- **기능**:
  - 백엔드 서버 상태 실시간 확인
  - 사용자 인출 테스트 링크
  - Owner 긴급 정지 링크
  - 컨트랙트 정보

### 2. 👤 사용자 인출 테스트
- **URL**: `http://localhost:8080/index.html`
- **기능**:
  - TonConnect 지갑 연결
  - CSPIN 인출 요청
  - 백엔드에서 바우처 발급
  - ClaimWithVoucher 트랜잭션

### 3. 🛡️ Owner 긴급 정지 (관리자 전용)
- **URL**: `http://localhost:8080/emergency-pause.html`
- **기능**:
  - Owner 지갑 인증 (수정됨 ✅)
  - 컨트랙트 Pause/Unpause
  - 컨트랙트 상태 확인

---

## ⚡ 현재 서버 상태

### 백엔드 서버 ✅ 실행 중
- **포트**: 3000
- **상태**: 정상 실행 중
- **엔드포인트**: `http://localhost:3000/api/request-voucher`
- **헬스체크**: `http://localhost:3000/health`

### 프론트엔드 서버 ⏳ 실행 필요
- **포트**: 8080
- **명령**: `cd frontend-poc; python -m http.server 8080`
- **또는**: `.\start-test-server.ps1` 실행

---

## 🐛 문제 해결

### Python이 없는 경우
```powershell
# Node.js 사용
cd frontend-poc
npx http-server -p 8080
```

### 포트 충돌 (이미 사용 중)
```powershell
# 백엔드 포트 변경
# backend-api/.env에서 PORT=3001로 변경
# index.html의 BACKEND_URLS도 수정

# 프론트엔드 포트 변경
python -m http.server 8081
# 브라우저에서 localhost:8081 접속
```

### CORS 오류
- 백엔드에 이미 CORS 설정되어 있음
- 백엔드가 `localhost:3000`에서 실행 중인지 확인
- 브라우저 콘솔에서 정확한 오류 확인

---

## 📋 테스트 전 체크리스트

- [x] 백엔드 서버 실행 중 ✅
- [ ] 프론트엔드 서버 실행
- [ ] 브라우저에서 `localhost:8080/test-server.html` 접속
- [ ] 백엔드 상태 "온라인 ✅" 확인
- [ ] 컨트랙트에 CSPIN 충전됨
- [ ] 컨트랙트 Unpause 상태 확인

---

## 🎯 다음 단계

1. **프론트엔드 서버 시작**:
   ```powershell
   cd frontend-poc
   python -m http.server 8080
   ```

2. **브라우저 접속**:
   ```
   http://localhost:8080/test-server.html
   ```

3. **테스트 실행**:
   - 사용자 인출 테스트 (10 CSPIN)
   - Owner 긴급 정지 테스트

---

## 💡 팁

- **VS Code 통합 터미널**: `Ctrl + Shift + `` (백틱)으로 새 터미널 열기
- **터미널 분할**: `Ctrl + Shift + 5`
- **백그라운드 실행**: 각 서버는 별도 터미널에서 실행
- **서버 종료**: 각 터미널에서 `Ctrl + C`

---

## 📞 지원

문제가 발생하면:
1. `LOCAL_TEST_GUIDE.md` 참조
2. 터미널 오류 메시지 확인
3. 브라우저 콘솔 (F12) 확인
