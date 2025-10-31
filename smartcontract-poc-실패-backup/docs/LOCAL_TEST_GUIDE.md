# 🧪 로컬 테스트 서버 실행 가이드

## 📋 전체 흐름

```
1. 백엔드 서버 실행 (포트 3000)
   ↓
2. 프론트엔드 서버 실행 (포트 8080)
   ↓
3. 브라우저에서 테스트
```

## 🚀 실행 방법

### Step 1: 백엔드 서버 실행

**터미널 1 (PowerShell)**
```powershell
# backend-api 폴더로 이동
cd C:\Users\x0051\Desktop\DEV\contracts\backend-api

# 의존성 설치 (최초 1회만)
npm install

# .env 파일 생성 (최초 1회만)
# 메모장으로 .env 파일 생성하고 아래 내용 입력:
# OWNER_MNEMONIC=tornado run casual carbon ...
# PORT=3000

# 서버 시작
npm start
```

**성공 메시지**:
```
🚀 Signed Voucher API 서버 시작
📍 포트: 3000
📍 컨트랙트: EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
💡 운영 비용: $0/월 (RPC 호출 없음)
```

### Step 2: 프론트엔드 서버 실행

**터미널 2 (PowerShell) - 새 터미널 열기**
```powershell
# frontend-poc 폴더로 이동
cd C:\Users\x0051\Desktop\DEV\contracts\frontend-poc

# Python HTTP 서버 실행 (Python 3)
python -m http.server 8080

# 또는 Node.js가 있다면
npx http-server -p 8080
```

**성공 메시지**:
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

### Step 3: 브라우저에서 테스트

1. **메인 페이지 열기**:
   - 브라우저에서 `http://localhost:8080/test-server.html` 접속
   - 백엔드 상태가 "온라인 ✅"인지 확인

2. **사용자 인출 테스트**:
   - "🎯 인출 테스트 시작" 클릭
   - 지갑 연결 → 금액 입력 → 인출

3. **긴급 정지 테스트** (Owner 전용):
   - "⚠️ 긴급 정지 제어판" 클릭
   - Owner 지갑 연결 → Pause/Unpause

## 🐛 문제 해결

### 백엔드 서버가 시작되지 않음

**오류**: `Cannot find module '@ton/crypto'`
```powershell
cd backend-api
npm install
```

**오류**: `PORT 3000 already in use`
```powershell
# 포트 변경
# .env 파일에서 PORT=3001로 변경
# index.html의 BACKEND_URLS도 3001로 변경
```

### 프론트엔드 서버가 시작되지 않음

**Python이 없는 경우**:
```powershell
# Node.js 사용
npm install -g http-server
npx http-server -p 8080
```

**포트 충돌**:
```powershell
# 다른 포트 사용
python -m http.server 8081
# 브라우저에서 http://localhost:8081 접속
```

### CORS 오류

**증상**: 백엔드 요청이 차단됨

**해결**:
1. 백엔드 `server.js`에 이미 CORS 설정되어 있음 (`app.use(cors())`)
2. 브라우저 콘솔에서 오류 확인
3. 백엔드가 `http://localhost:3000`에서 실행 중인지 확인

### Owner 인증 실패

**증상**: emergency-pause.html에서 "❌ Owner 아님" 표시

**해결**:
1. 로그에서 주소 비교 확인
2. TonWeb 라이브러리가 로드되었는지 확인 (페이지 새로고침)
3. 올바른 Owner 지갑으로 연결했는지 확인

## 📁 파일 구조

```
contracts/
├── backend-api/
│   ├── server.js          ← 백엔드 API (포트 3000)
│   ├── package.json
│   └── .env              ← OWNER_MNEMONIC 저장
│
└── frontend-poc/
    ├── test-server.html   ← 메인 테스트 페이지 (NEW!)
    ├── index.html         ← 사용자 인출 UI
    └── emergency-pause.html ← Owner 긴급 정지 UI
```

## 🔄 터미널 관리 팁

### VS Code 통합 터미널 사용

1. **터미널 1 (백엔드)**:
   - `Ctrl + Shift + `` (백틱) - 새 터미널
   - `cd backend-api`
   - `npm start`

2. **터미널 2 (프론트엔드)**:
   - `Ctrl + Shift + 5` (터미널 분할)
   - 또는 `+` 버튼으로 새 터미널 추가
   - `cd frontend-poc`
   - `python -m http.server 8080`

3. **터미널 전환**:
   - 터미널 목록에서 클릭하여 전환

## ✅ 체크리스트

테스트 전 확인사항:

- [ ] 백엔드 서버 실행 중 (`http://localhost:3000/health` 접속 확인)
- [ ] 프론트엔드 서버 실행 중 (`http://localhost:8080` 접속 확인)
- [ ] `.env` 파일에 OWNER_MNEMONIC 설정됨
- [ ] 컨트랙트에 CSPIN 충전됨 (EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa)
- [ ] 컨트랙트가 Unpause 상태 (emergency-pause.html에서 확인)

## 🎯 테스트 시나리오

### 1. 사용자 인출 테스트
1. `http://localhost:8080/test-server.html` 접속
2. 백엔드 상태 "온라인 ✅" 확인
3. "🎯 인출 테스트 시작" 클릭
4. 지갑 연결
5. 금액 입력 (예: 10 CSPIN)
6. "💎 CSPIN 인출하기" 클릭
7. 트랜잭션 승인
8. 로그에서 "✅ 트랜잭션 전송 성공!" 확인
9. Tonscan에서 트랜잭션 확인

### 2. Owner 긴급 정지 테스트
1. `http://localhost:8080/emergency-pause.html` 접속
2. Owner 지갑 연결
3. "✅ Owner 인증됨" 확인
4. "⏸️ 긴급 정지" 클릭 → 테스트
5. "▶️ 재개" 클릭 → 정상화

## 💡 프로덕션 배포 시

프로덕션 환경에서는:
1. 백엔드: Heroku, AWS, Azure 등에 배포
2. 프론트엔드: Vercel, Netlify, GitHub Pages 등에 배포
3. HTTPS 필수
4. 환경변수 관리 (Secrets Manager)
5. 도메인 연결
