# Cloudflare Pages 서버리스 배포 가이드

## ⚠️ 중요: Cloudflare Pages 제한사항

### 백엔드 API를 Cloudflare Pages로 배포 불가능 ❌

**이유:**
1. **Cloudflare Pages는 정적 사이트 호스팅 전용**
   - HTML, CSS, JS, 이미지 등만 서빙
   - Node.js 서버 실행 불가능

2. **Cloudflare Workers 필요**
   - 서버리스 함수 실행 가능
   - 하지만 `@ton/crypto` 라이브러리가 Edge Runtime에서 작동 안함
   - crypto 모듈이 Node.js 전용

3. **Edge Runtime 제약**
   - `mnemonicToPrivateKey()` 사용 불가
   - `sign()` 함수 사용 불가
   - Buffer, crypto 모듈 제한적

---

## ✅ 권장 해결책

### Option 1: Cloudflare Pages + Cloudflare Workers ⭐ (추천)

**구조:**
```
Cloudflare Pages (프론트엔드)
   ├─ index.html
   ├─ emergency-pause.html
   └─ test-server.html

Cloudflare Workers (백엔드 API)
   └─ /api/request-voucher
```

**문제**: `@ton/crypto`가 Workers에서 작동 안함

**대안**: Web Crypto API 사용 (복잡함)
- `crypto.subtle.importKey()` 사용
- `crypto.subtle.sign()` 사용
- TON 형식으로 변환 필요

### Option 2: Cloudflare Pages + 외부 백엔드 🚀 (가장 쉬움)

**구조:**
```
Cloudflare Pages (프론트엔드만)
   └─ index.html → https://api.yourgame.com/request-voucher

외부 백엔드 (Node.js 서버)
   ├─ Render.com (무료)
   ├─ Railway.app (무료)
   ├─ Fly.io (무료)
   └─ Heroku (유료)
```

**장점:**
- Node.js 환경에서 `@ton/crypto` 정상 작동
- 기존 backend-api 그대로 사용
- Cloudflare Pages는 프론트엔드만 호스팅

### Option 3: Vercel (올인원) 💡

**구조:**
```
Vercel (프론트엔드 + 백엔드)
   ├─ /frontend-poc (정적)
   └─ /api (서버리스 함수)
```

**장점:**
- Node.js 런타임 지원
- `@ton/crypto` 정상 작동
- 무료 플랜 충분

---

## 🎯 추천 배포 방식

### 1단계: 프론트엔드 (Cloudflare Pages)

**파일 구조:**
```
frontend-poc/
├── index.html
├── emergency-pause.html
└── test-server.html
```

**환경 변수:**
```bash
BACKEND_API_URL=https://your-backend.render.com
CONTRACT_ADDRESS=EQAOLUHmaA1J...
```

**배포:**
```bash
# Git push만 하면 자동 배포
git push origin main
```

### 2단계: 백엔드 (Render.com 무료)

**파일 구조:**
```
backend-api/
├── server.js
├── package.json
└── .env (환경 변수)
```

**환경 변수 (Render.com):**
```bash
GAME_WALLET_PRIVATE_KEY="tornado run casual carbon ..."
CONTRACT_ADDRESS="EQAOLUHmaA1J..."
MAX_SINGLE_WITHDRAW=1000000
PORT=3000
```

**배포:**
1. Render.com 가입
2. New Web Service 생성
3. GitHub 연동
4. 환경 변수 설정
5. 자동 배포

**무료 플랜:**
- ✅ 750시간/월 (충분)
- ✅ Auto-deploy
- ✅ HTTPS 자동
- ❌ 15분 idle → sleep (첫 요청 느림)

---

## 🔧 코드 수정 (외부 백엔드 사용)

### frontend-poc/index.html
```javascript
// 백엔드 API 주소 (환경별)
const BACKEND_URLS = {
    development: 'http://localhost:3000',
    production: 'https://your-backend.render.com'
};

const BACKEND_URL = BACKEND_URLS[
    window.location.hostname === 'localhost' ? 'development' : 'production'
];
```

### backend-api/server.js (이미 수정됨 ✅)
```javascript
// Cloudflare Pages 또는 .env 환경 변수
const OWNER_MNEMONIC = process.env.GAME_WALLET_PRIVATE_KEY || process.env.OWNER_MNEMONIC;
```

---

## 📦 Render.com 배포 (무료 백엔드)

### 1. Render.com 가입
https://render.com

### 2. New Web Service 생성
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment: `Node`

### 3. 환경 변수 설정
```
GAME_WALLET_PRIVATE_KEY=your_24_words_mnemonic
CONTRACT_ADDRESS=EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
MAX_SINGLE_WITHDRAW=1000000
```

### 4. 배포
- Git push → 자동 배포
- URL: `https://your-app-name.onrender.com`

### 5. 프론트엔드에서 사용
```javascript
const BACKEND_URL = 'https://your-app-name.onrender.com';
```

---

## 🚀 Vercel 배포 (올인원, 추천)

### 1. 프로젝트 구조 변경
```
/
├── frontend-poc/ (정적 파일)
│   ├── index.html
│   └── ...
├── api/ (서버리스 함수)
│   └── request-voucher.js
└── vercel.json
```

### 2. api/request-voucher.js 생성
```javascript
import { mnemonicToPrivateKey, sign } from '@ton/crypto';
import { Address, beginCell } from '@ton/ton';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, amount, recipientAddress } = req.body;
    
    // 니모닉 로드
    const mnemonic = process.env.GAME_WALLET_PRIVATE_KEY;
    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
    
    // 서명 생성
    const nonce = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const messageToSign = beginCell()
        .storeUint(0x7a0c23c0, 32)
        .storeCoins(amount * 1_000_000_000)
        .storeAddress(Address.parse(recipientAddress))
        .storeUint(nonce, 64)
        .endCell();
    
    const signature = sign(messageToSign.hash(), keyPair.secretKey);
    
    return res.json({
        success: true,
        voucher: {
            amount: amount * 1_000_000_000,
            recipient: recipientAddress,
            nonce,
            signature: signature.toString('hex'),
            contractAddress: process.env.CONTRACT_ADDRESS
        }
    });
}
```

### 3. vercel.json
```json
{
  "buildCommand": "npm install",
  "outputDirectory": "frontend-poc",
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

### 4. 환경 변수
```
GAME_WALLET_PRIVATE_KEY=your_24_words
CONTRACT_ADDRESS=EQAOLUHmaA1J...
```

### 5. 배포
```bash
vercel --prod
```

---

## 📊 비교표

| 서비스 | 프론트엔드 | 백엔드 | 무료 플랜 | 난이도 |
|--------|-----------|--------|----------|--------|
| **Cloudflare Pages** | ✅ | ❌ | ✅ | ★☆☆ |
| **Cloudflare Pages + Render** | ✅ | ✅ | ✅ | ★★☆ |
| **Vercel** | ✅ | ✅ | ✅ | ★☆☆ |
| **Railway** | ✅ | ✅ | ✅ | ★★☆ |

---

## 🎯 최종 추천

### 방법 1: Cloudflare Pages + Render.com ⭐
- **프론트엔드**: Cloudflare Pages (빠름)
- **백엔드**: Render.com (무료)
- **장점**: 각자 전문 분야, 무료
- **단점**: 2개 서비스 관리

### 방법 2: Vercel 올인원 💡
- **프론트엔드 + 백엔드**: Vercel
- **장점**: 단일 서비스, 간단함
- **단점**: Cloudflare보다 CDN 느림

---

## 🔒 보안 주의사항

### 환경 변수 절대 Git 커밋 금지 ❌
```gitignore
.env
.env.local
.env.production
```

### Cloudflare Pages 환경 변수 설정
```
Settings → Environment Variables → Add variable
GAME_WALLET_PRIVATE_KEY=your_mnemonic
```

### Render.com 환경 변수 설정
```
Environment → Add Environment Variable
GAME_WALLET_PRIVATE_KEY=your_mnemonic
```

---

## 📞 다음 단계

1. **배포 방식 선택**
   - Cloudflare Pages + Render.com (추천)
   - 또는 Vercel 올인원

2. **백엔드 배포**
   - Render.com 또는 Vercel

3. **프론트엔드 수정**
   - BACKEND_URL 환경 변수로 변경

4. **테스트**
   - 로컬 → 스테이징 → 프로덕션

선택하시면 상세 가이드 드리겠습니다!
