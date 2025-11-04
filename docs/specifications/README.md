# 슬롯머신 프로젝트 요약

**작성일**: 2025-11-04  
**상태**: 계획 수립 완료, 구현 대기

---

## 📋 완료된 작업

### 1. 요구사항 명세서 작성 ✅
- **위치**: `docs/specifications/슬롯머신-요구사항-명세서_v1.0.md`
- **내용**: 
  - 게임 규칙 (3-Reel, 7개 심볼, 독창적 당첨금 계산)
  - 잭팟 시스템 (3개 동일 심볼 → x100)
  - 더블업 미니게임 (50% 확률, 1회 제한)
  - UI/UX 디자인 명세 (보라색 테마)
  - Provably Fair 알고리즘
  - RTP 95% 토큰 경제
  - 반응형 디자인 (모바일/태블릿/데스크톱)

### 2. 구현 계획서 작성 ✅
- **위치**: `docs/specifications/슬롯머신-구현-계획서_v1.0.md`
- **내용**:
  - 프로젝트 개요 및 기술 스택 분석
  - 시스템 아키텍처 설계
  - 데이터 흐름 (슬롯 스핀, 더블업)
  - Phase별 구현 단계 (6단계)
  - 상세 코드 예시 (백엔드 + 프론트엔드)
  - 파일 구조
  - 개발 일정 (14일)

---

## 🎯 핵심 기능

### 게임 규칙

```
슬롯머신: 3-Reel, 7개 이모지 심볼
당첨금: 각 릴 개별 합산 (독창적 방식)
잭팟: 3개 동일 심볼 → (개별 합산) × 100

더블업: 빨강/파랑 선택, 50% 확률
- 성공: 당첨금 × 2
- 실패: 0 CSPIN
- 제한: 스핀 1회당 1번만
```

### 심볼 테이블

| 심볼 | 희귀도 | 배당률 | 확률 |
|------|--------|--------|------|
| ⭐ | Common | x0.5 | 35% |
| 🪐 | Common | x1 | 25% |
| ☄️ | Uncommon | x2 | 15% |
| 🚀 | Uncommon | x3 | 10% |
| 👽 | Rare | x5 | 7% |
| 💎 | Rare | x10 | 5% |
| 👑 | Legend | x20 | 3% |

---

## 🏗️ 아키텍처

### 기술 스택
- **프론트엔드**: React 18 + TypeScript + Tailwind CSS
- **백엔드**: Cloudflare Workers + KV Namespace
- **블록체인**: TON + TON Connect
- **애니메이션**: Framer Motion

### 파일 구조

```
functions/api/slot/
├── spin.ts              # 슬롯 스핀 API
├── doubleup.ts          # 더블업 API
├── provably-fair.ts     # Provably Fair 로직
└── payout-calculator.ts # 당첨금 계산

src/features/slot/
├── components/
│   ├── SlotMachineV2.tsx
│   ├── Reel.tsx
│   ├── BettingControl.tsx
│   ├── DoubleUpModal.tsx
│   └── JackpotVideo.tsx
├── hooks/
├── styles/
└── types/

public/
└── jackpot_video.mp4    # 5초 잭팟 비디오
```

---

## 📊 구현 단계

| Phase | 작업 | 기간 | 상태 |
|-------|------|------|------|
| Phase 1 | 백엔드 게임 엔진 | 3일 | 대기 |
| Phase 2 | 프론트엔드 UI | 4일 | 대기 |
| Phase 3 | 스타일링 & 애니메이션 | 2일 | 대기 |
| Phase 4 | 테스트 & 검증 | 3일 | 대기 |
| Phase 5 | 배포 & 문서화 | 2일 | 대기 |

**총 예상 기간**: 14일

---

## 🎨 디자인 시스템

### 색상 팔레트

```css
Primary: #4A00E0 (보라색)
Secondary: #8E2DE2 (연보라)
Accent: #FFD700 (금색, 당첨)
Background: #0F0F1B (어두운 배경)

희귀도:
- Common: #FFFFFF (흰색)
- Uncommon: #4A90E2 (파란색)
- Rare: #9B59B6 (보라색)
- Legend: #F1C40F (금색)
```

### 타이포그래피

```
Headline: Poppins (제목)
Body: Open Sans (본문)
Display: Orbitron (당첨금, 디지털 느낌)
```

---

## 🔐 Provably Fair 알고리즘

### 검증 과정

```
1. 서버 시드 생성 → SHA-256 해시 사전 공개
2. 클라이언트 시드 입력 (사용자 또는 자동)
3. 논스 증가 (각 게임마다)
4. HMAC-SHA256(서버시드, 클라이언트시드:논스) 계산
5. 해시 → 3개 릴 심볼 결정
6. 게임 종료 후 서버 시드 공개 → 사용자 직접 검증
```

### 당첨금 계산

```typescript
// 각 릴 개별 계산
릴1: 베팅액 × 심볼1 배당률 = 당첨금1
릴2: 베팅액 × 심볼2 배당률 = 당첨금2
릴3: 베팅액 × 심볼3 배당률 = 당첨금3

총 당첨금 = 당첨금1 + 당첨금2 + 당첨금3

// 잭팟 (3개 동일 심볼)
if (심볼1 === 심볼2 === 심볼3) {
  잭팟 상금 = 총 당첨금 × 100
}
```

---

## 📈 토큰 경제 (RTP 95%)

### 이론상 RTP 계산

```
각 심볼의 기대값 = 확률 × 배당률

⭐: 0.35 × 0.5 = 0.175
🪐: 0.25 × 1 = 0.25
☄️: 0.15 × 2 = 0.30
🚀: 0.10 × 3 = 0.30
👽: 0.07 × 5 = 0.35
💎: 0.05 × 10 = 0.50
👑: 0.03 × 20 = 0.60

1개 릴 기대값: 2.525
3개 릴 총 기대값: 7.575

RTP = 7.575 / 8 = 94.69% ≈ 95%
```

---

## ✅ 검증 계획

### 기능 검증
- [ ] 심볼 확률 검증 (10,000회 시뮬레이션)
- [ ] 잭팟 조건 트리거 확인
- [ ] 더블업 1회 제한 검증

### 성능 검증
- [ ] 부하 테스트 (1,000 동시 접속)
- [ ] 스핀 응답 시간 (1초 이내)
- [ ] 잭팟 비디오 로딩 (2초 이내)

### 공정성 검증
- [ ] Provably Fair 검증 프로세스
- [ ] RTP 95% 유지 (100,000회 시뮬레이션)

---

## 🚀 다음 단계

### 즉시 시작 가능한 작업

1. **백엔드 Provably Fair 구현**
   - `functions/api/slot/provably-fair.ts`
   - `functions/api/slot/payout-calculator.ts`
   - `functions/api/slot/spin.ts`

2. **프론트엔드 기본 UI**
   - `src/features/slot/components/SlotMachineV2.tsx`
   - `src/features/slot/components/Reel.tsx`
   - `src/features/slot/components/BettingControl.tsx`

### 필요한 리소스

- [ ] `jackpot_video.mp4` 파일 (5초, 1920x1080, H.264)
- [ ] Framer Motion 라이브러리 설치
- [ ] 사운드 효과 파일 (선택사항)

### 확인 사항

1. 잭팟 비디오는 제공되나요? 제작이 필요한가요?
2. 사운드 효과를 추가하시겠습니까?
3. 게임 기록 보관 기간은? (현재 제안: 30일)
4. RTP 통계를 실시간으로 공개하시겠습니까?

---

## 📝 문서 링크

- **요구사항 명세서**: `docs/specifications/슬롯머신-요구사항-명세서_v1.0.md`
- **구현 계획서**: `docs/specifications/슬롯머신-구현-계획서_v1.0.md`
- **프로젝트 요약**: `docs/specifications/README.md` (본 문서)

---

**계획 수립 완료!** 🎉

이제 백엔드 Provably Fair 로직부터 구현을 시작할 수 있습니다.
