# CandleSpinner 🚀

TON 블록체인 기반의 탈중앙화 서버리스 Web3 슬롯머신 게임입니다.

## 🎮 Features

### Core Gameplay
- **3-Reel Slot Machine**: 우주 테마의 이모지 심볼 (⭐🪐☄️🚀👽💎👑)
- **Jackpot System**: 3개 동일 심볼 시 100배 보너스
- **Double-Up Mini-Game**: 50/50 확률의 Red/Blue 게임
- **Provably Fair**: 클라이언트+서버 시드 기반 공정 검증

### Blockchain Integration
- **TON Connect**: 텔레그램 지갑 연동
- **CSPIN Token**: 게임 내 토큰 (Jetton 표준)
- **On-chain Deposits**: 실제 블록체인 입금
- **Off-chain Gaming**: 빠른 게임 플레이 (Cloudflare KV)

### Multi-language Support
7개 언어 지원 (자동 감지):
- 🇰🇷 한국어 (ko)
- 🇺🇸 English (en)
- 🇯🇵 日本語 (ja)
- 🇨🇳 简体中文 (zh-CN)
- 🇹🇼 繁體中文 (zh-TW)
- 🇷🇺 Русский (ru)
- 🇸🇦 العربية (ar)

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **TON Connect** (@tonconnect/ui-react)
- **PixiJS** (reel animations)
- **Tailwind CSS** (styling)
- **Zustand** (state management)
- **i18next** (internationalization)

### Backend
- **Cloudflare Workers** (serverless API)
- **Cloudflare KV** (user credit storage)
- **Cloudflare Pages** (static hosting)

### Blockchain
- **TON Blockchain**
- **ton-core** (transaction building)
- **CSPIN Jetton Token** (game currency)

## 📦 Project Structure

```
CandleSpinner/
├── src/
│   ├── components/
│   │   ├── Game.tsx           # Main game component
│   │   ├── ReelPixi.tsx       # PixiJS reel animation
│   │   └── JackpotVideo.tsx   # Jackpot video modal
│   ├── hooks/
│   │   └── useJettonWallet.ts # Jetton wallet derivation
│   ├── i18n/
│   │   └── index.ts           # Multi-language config
│   └── constants.ts           # Game constants
├── functions/api/
│   ├── spin.ts                # Main game API
│   ├── credit-deposit.ts      # Deposit handler
│   ├── double-up.ts           # Mini-game API
│   ├── collect-winnings.ts    # Winnings collection
│   ├── initiate-withdrawal.ts # Withdrawal request
│   └── rpc.js                 # RPC proxy
├── public/
│   └── video.mp4              # Jackpot video
└── wrangler.toml              # Cloudflare config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/aiandyou50/CandleSpinner.git
cd CandleSpinner

# Install dependencies
npm install

# Run development server
npm run dev
```

### Build

```bash
# Type check
npm run typecheck

# Build for production
npm run build
```

### Deployment to Cloudflare Pages

1. **Push to GitHub** (automatic deployment enabled)
2. **Manual deployment**:
   ```bash
   npx wrangler pages deploy dist
   ```

### Environment Variables

Configure in Cloudflare Pages dashboard:

```env
# Optional: Backend RPC URL
BACKEND_RPC_URL=https://toncenter.com/api/v2/jsonRPC

# Optional: API key protection
FUNCTION_API_KEY=your-secret-key

# Optional: CORS allowed origins
ALLOWED_ORIGIN=https://yourdomain.com,*.example.com
```

## 🎯 Game Flow

1. **Connect Wallet**: Click TON Connect button (top-right)
2. **Deposit CSPIN**: Enter amount and click "Deposit CSPIN"
3. **Set Bet**: Use +/- buttons to adjust bet amount
4. **Spin**: Click "🎰 SPIN!" to play
5. **Win**: On winning, choose:
   - **Gamble**: Red/Blue for 2x (or lose all)
   - **Collect**: Take winnings to credit
6. **Withdraw**: Click "Withdraw CSPIN" to cash out

## 🔒 Security

- ✅ CodeQL security scan passed (0 vulnerabilities)
- ✅ TEP-74 compliant jetton transfers
- ✅ Provably Fair algorithm
- ✅ Client-side transaction signing only
- ✅ No private keys in code

## 📚 Documentation

### PoC Development
프로젝트 개발 과정과 문제 해결 방법:

- [문제 해결 가이드](PoC/docs/PoC/troubleshooting.md)
- [사후 분석 보고서](PoC/docs/PoC/post-mortem-cspin-transfer.md)
- [개발자 노트](PoC/docs/PoC/developer-notes.md)
- [지식 베이스](PoC/docs/PoC/knowledge-base.md)

### Project Documentation
- [프로젝트 정의서](산출물1]프로젝트-정의서(v1.1).md)
- [기술 스택 및 아키텍처]([산출물2]기술-스택-및-아키텍처-설계.md)
- [핵심 로직 의사코드]([산출물3]핵심-로직-의사코드-(MVP-확장-v2.0).md)
- [PoC 의사코드]([산출물3]PoC핵심-로직-의사코드.md)

## 🧪 Testing

### Local Testing
```bash
# Start dev server
npm run dev

# Open browser at http://localhost:5173
```

### Test Checklist
- ✅ Wallet connection/disconnection
- ✅ Jetton wallet derivation
- ✅ CSPIN deposit (testnet)
- ✅ Spin functionality
- ✅ Winning calculations
- ✅ Jackpot detection
- ✅ Double-up mini-game
- ✅ Collect winnings
- ✅ Withdrawal request
- ✅ Multi-language switching
- ✅ Jackpot video playback

## 🎨 Symbol Probabilities & Payouts

| Symbol | Name | Rarity | Payout | Probability |
|--------|------|--------|--------|-------------|
| ⭐ | Star | Common | x0.5 | 35% |
| 🪐 | Planet | Common | x1 | 25% |
| ☄️ | Comet | Uncommon | x2 | 15% |
| 🚀 | Rocket | Uncommon | x3 | 10% |
| 👽 | Alien | Rare | x5 | 7% |
| 💎 | Diamond | Rare | x10 | 5% |
| 👑 | Crown | Legend | x20 | 3% |

**RTP: 95%** | **House Edge: 5%**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- TON Foundation for blockchain infrastructure
- Cloudflare for serverless platform
- PixiJS team for graphics engine
- React community for amazing tools

---

**Note**: This is a proof-of-concept MVP. Use testnet for testing. Not financial advice.
