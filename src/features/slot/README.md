# 슬롯머신 V2 - 시작 가이드

## 🎰 로컬 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 접속
http://localhost:3000/slot-v2
```

## 🎮 게임 플레이 방법

### 1. 지갑 연결
- 우측 상단 "Connect Wallet" 버튼 클릭
- TON 지갑 선택 (Tonkeeper, Tonhub 등)
- 지갑 주소 연결 승인

### 2. 크레딧 충전
- "입금" 카드에서 충전할 TON 금액 입력
- "입금하기" 버튼 클릭
- 지갑에서 트랜잭션 승인
- 크레딧이 자동으로 충전됩니다

### 3. 슬롯머신 플레이
- 베팅액 선택 (10~1000 CSPIN)
  - 슬라이더로 조절
  - 퀵 버튼 사용 (100/500/1000/MAX)
- "🎰 스핀!" 버튼 클릭
- 릴 애니메이션 감상
- 결과 확인

### 4. 당첨 시
- 당첨금 표시 (황금 애니메이션)
- 릴별 당첨금 확인
- 3초 후 더블업 팝업 자동 표시

### 5. 더블업 (선택사항)
- ❤️ 빨강 또는 💙 파랑 선택
- 50% 확률로 2배 획득
- 실패 시 당첨금 소멸
- "건너뛰기"로 더블업 거부 가능

### 6. 잭팟!
- 3개 릴 중앙 심볼이 모두 동일하면 발동
- 당첨금 × 100배!
- 전체 화면 비디오 재생
- 더블업 불가 (자동으로 크레딧 지급)

## 🎯 심볼 정보

| 심볼 | 이름 | 희귀도 | 확률 | 배당률 |
|------|------|--------|------|--------|
| ⭐ | 별 | Common | 35% | 1.5x |
| 🪐 | 행성 | Common | 25% | 2x |
| ☄️ | 혜성 | Uncommon | 15% | 3.5x |
| 🚀 | 로켓 | Uncommon | 10% | 5x |
| 👽 | 외계인 | Rare | 7% | 7x |
| 💎 | 다이아몬드 | Rare | 5% | 10x |
| 👑 | 왕관 | Legend | 3% | 15x |

## 💡 당첨금 계산 방식

### 기본 계산 (각 릴 독립)
각 릴의 중앙 심볼에 대해:
```
릴 당첨금 = 베팅액 × 해당 심볼 배당률
총 당첨금 = 릴1 + 릴2 + 릴3
```

**예시**: 100 CSPIN 베팅, 결과 [🚀, 🚀, 💎]
- 릴1: 100 × 5 = 500
- 릴2: 100 × 5 = 500
- 릴3: 100 × 10 = 1,000
- **총 당첨금: 2,000 CSPIN**

### 잭팟 (3개 동일)
3개 릴 중앙이 모두 같은 심볼:
```
잭팟 = 기본 당첨금 × 100
```

**예시**: 100 CSPIN 베팅, 결과 [💎, 💎, 💎]
- 기본: (100 × 10) × 3 = 3,000
- **잭팟: 3,000 × 100 = 300,000 CSPIN!**

## 🔒 Provably Fair (공정성 증명)

### 검증 가능한 공정성
1. **서버 시드**: 게임 시작 전 생성 및 해시
2. **클라이언트 시드**: 플레이어가 제공 (UUID)
3. **HMAC-SHA256**: 두 시드를 조합하여 결과 생성
4. **검증**: 게임 후 서버 시드 공개 → 플레이어가 직접 검증

### 검증 방법
각 게임 결과에는 다음 정보가 포함됩니다:
- `serverSeedHash`: 게임 전 해시값
- `clientSeed`: 플레이어 시드
- `gameId`: 고유 게임 ID

결과를 검증하려면:
```javascript
// 1. serverSeed 요청 (게임 후)
const serverSeed = await fetch(`/api/slot/verify/${gameId}`);

// 2. 해시 검증
const hash = crypto.createHmac('sha256', serverSeed)
  .update(clientSeed)
  .digest('hex');

// 3. 비교
console.log(hash === serverSeedHash); // true면 공정함
```

## 📊 통계 정보

### RTP (Return to Player)
- **이론적 RTP**: 94.69%
- **실제 RTP**: 게임 데이터 기반 계산
- 확인: `/api/slot/rtp-stats` 엔드포인트

### 게임 기록
- 최근 100게임 기록 저장
- 30일 후 자동 삭제
- 확인: `/api/slot/history?walletAddress=...`

## 🛠️ 개발자 정보

### API 엔드포인트

#### 1. 스핀
```http
POST /api/slot/spin
Content-Type: application/json

{
  "walletAddress": "EQA...",
  "betAmount": 100,
  "clientSeed": "uuid-v4"
}
```

#### 2. 더블업
```http
POST /api/slot/doubleup
Content-Type: application/json

{
  "walletAddress": "EQA...",
  "choice": "red",
  "currentWin": 500,
  "gameId": "game-id"
}
```

#### 3. RTP 통계
```http
GET /api/slot/rtp-stats
```

#### 4. 게임 기록
```http
GET /api/slot/history?walletAddress=EQA...
```

### 컴포넌트 구조
```
src/features/slot/
├── components/
│   ├── SlotMachineV2.tsx    # 메인 컴포넌트
│   ├── Reel.tsx              # 릴 컴포넌트
│   ├── BettingControl.tsx    # 베팅 UI
│   ├── DoubleUpModal.tsx     # 더블업 팝업
│   └── JackpotVideo.tsx      # 잭팟 비디오
├── types/
│   └── index.ts              # 타입 정의
├── api/
│   └── slot.ts               # API 클라이언트
└── styles/
    └── slot-machine.css      # 스타일시트
```

## 🎨 테마 커스터마이징

### 색상 변경 (tailwind.config.js)
```javascript
theme: {
  extend: {
    colors: {
      purple: {
        gradient: {
          from: '#8E2DE2',  // 보라색 시작
          to: '#4A00E0',    // 보라색 끝
        },
      },
    },
  },
}
```

### 애니메이션 조정 (slot-machine.css)
```css
/* 스핀 속도 */
.reel-inner {
  transition: transform 2s ease-out; /* 2초 → 원하는 시간 */
}

/* 발광 효과 */
@keyframes glow-legend {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.9)); }
  50% { filter: drop-shadow(0 0 40px rgba(168, 85, 247, 1)); }
}
```

## 📝 주의사항

### 베팅 제한
- 최소 베팅: 10 CSPIN
- 최대 베팅: 보유 크레딧 전부
- 베팅 단위: 10 CSPIN

### 더블업 제한
- 게임당 1회만 가능
- 잭팟 시 불가
- 타임아웃: 60초

### 크레딧 관리
- 실시간 동기화
- 원자적 트랜잭션
- 음수 방지 로직

## 🐛 트러블슈팅

### 크레딧이 업데이트되지 않음
```bash
# 브라우저 콘솔에서 확인
await fetch('/api/credit?walletAddress=YOUR_ADDRESS')
```

### 스핀이 작동하지 않음
1. 지갑 연결 확인
2. 크레딧 잔액 확인
3. 브라우저 콘솔 에러 확인
4. 네트워크 탭에서 API 호출 확인

### 애니메이션이 느림
- GPU 가속 확인
- 개발자 도구 Performance 탭 확인
- Framer Motion 설정 조정

## 📞 문의

- GitHub Issues: [CandleSpinner/issues]
- Discord: [커뮤니티 링크]
- Email: support@candlespinner.com

---

**즐거운 게임 되세요! 🎰✨**
