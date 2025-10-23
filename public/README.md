# 📦 Static Assets (public/)

웹사이트가 제공하는 정적 자산 폴더입니다.

---

## 📁 파일 목록

### tonconnect-manifest.json
**TonConnect 지갑 연동 설정 매니페스트**

Telegram 지갑(TonConnect)에서 이 웹앱을 인식하기 위한 설정 파일입니다.

**구조:**
```json
{
  "url": "https://aiandyou.me",
  "name": "CandleSpinner",
  "iconUrl": "https://aiandyou.me/icon.png"
}
```

**역할:**
- TonConnect SDK가 웹앱을 식별
- Telegram Wallet에서 보여줄 앱 정보 제공
- 지갑 연동 시 사용자 인증

**배포:**
- 루트 경로: `https://aiandyou.me/.well-known/tonconnect-manifest.json`
- 또는: `https://aiandyou.me/tonconnect-manifest.json`

---

## 🔧 Vite 설정

`vite.config.ts`에서 `public/` 폴더가 정적 자산으로 설정됨:

```typescript
export default {
  publicDir: 'public',  // public/ 폴더를 정적 자산으로 사용
};
```

---

## 📝 정적 자산 추가 시

새로운 정적 파일을 추가할 때:

1. `public/` 폴더에 파일 배치
2. 자동으로 `dist/` 에 복사됨
3. `/파일명` 으로 접근 가능

**예시:**
```
public/
├── tonconnect-manifest.json  → https://aiandyou.me/tonconnect-manifest.json
├── icon.png                   → https://aiandyou.me/icon.png
└── robots.txt                 → https://aiandyou.me/robots.txt
```

---

**마지막 업데이트:** 2025-10-23

