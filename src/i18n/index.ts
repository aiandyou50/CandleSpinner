// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources (key languages: ko, en, ja, zh-CN, zh-TW, ru, ar)
const resources = {
  en: {
    translation: {
      title: "🚀 Candle Spinner - Space Slot Machine",
      currentCredit: "Current Credit:",
      walletConnected: "Wallet Connected:",
      walletNotConnected: "Wallet Not Connected",
      depositAmount: "Deposit Amount (CSPIN):",
      depositButton: "💰 Deposit CSPIN",
      withdrawButton: "💸 Withdraw CSPIN",
      betAmount: "Bet Amount:",
      spinButton: "🎰 SPIN!",
      redGamble: "🔴 Red Gamble",
      blueGamble: "🔵 Blue Gamble",
      collectWinnings: "💰 Collect Winnings",
      gameLoaded: "Game loaded!",
      connectWalletFirst: "Please connect your wallet first"
    }
  },
  ko: {
    translation: {
      title: "🚀 캔들 스피너 - 우주 슬롯머신",
      currentCredit: "현재 크레딧:",
      walletConnected: "지갑 연결됨:",
      walletNotConnected: "지갑 미연결",
      depositAmount: "입금 금액 (CSPIN):",
      depositButton: "💰 CSPIN 입금",
      withdrawButton: "💸 CSPIN 인출",
      betAmount: "베팅 금액:",
      spinButton: "🎰 스핀!",
      redGamble: "🔴 빨강 도박",
      blueGamble: "🔵 파랑 도박",
      collectWinnings: "💰 상금 수령",
      gameLoaded: "게임이 로드되었습니다!",
      connectWalletFirst: "지갑을 먼저 연결해주세요"
    }
  },
  ja: {
    translation: {
      title: "🚀 キャンドルスピナー - 宇宙スロットマシン",
      currentCredit: "現在のクレジット:",
      walletConnected: "ウォレット接続済み:",
      walletNotConnected: "ウォレット未接続",
      depositAmount: "入金額 (CSPIN):",
      depositButton: "💰 CSPIN入金",
      withdrawButton: "💸 CSPIN出金",
      betAmount: "ベット額:",
      spinButton: "🎰 スピン!",
      redGamble: "🔴 赤ギャンブル",
      blueGamble: "🔵 青ギャンブル",
      collectWinnings: "💰 賞金受取",
      gameLoaded: "ゲームがロードされました！",
      connectWalletFirst: "まずウォレットを接続してください"
    }
  },
  'zh-CN': {
    translation: {
      title: "🚀 蜡烛旋转器 - 太空老虎机",
      currentCredit: "当前积分:",
      walletConnected: "钱包已连接:",
      walletNotConnected: "钱包未连接",
      depositAmount: "存款金额 (CSPIN):",
      depositButton: "💰 存入CSPIN",
      withdrawButton: "💸 提取CSPIN",
      betAmount: "投注金额:",
      spinButton: "🎰 旋转!",
      redGamble: "🔴 红色赌博",
      blueGamble: "🔵 蓝色赌博",
      collectWinnings: "💰 领取奖金",
      gameLoaded: "游戏已加载！",
      connectWalletFirst: "请先连接钱包"
    }
  },
  'zh-TW': {
    translation: {
      title: "🚀 蠟燭旋轉器 - 太空老虎機",
      currentCredit: "當前積分:",
      walletConnected: "錢包已連接:",
      walletNotConnected: "錢包未連接",
      depositAmount: "存款金額 (CSPIN):",
      depositButton: "💰 存入CSPIN",
      withdrawButton: "💸 提取CSPIN",
      betAmount: "投注金額:",
      spinButton: "🎰 旋轉!",
      redGamble: "🔴 紅色賭博",
      blueGamble: "🔵 藍色賭博",
      collectWinnings: "💰 領取獎金",
      gameLoaded: "遊戲已載入！",
      connectWalletFirst: "請先連接錢包"
    }
  },
  ru: {
    translation: {
      title: "🚀 Candle Spinner - Космический игровой автомат",
      currentCredit: "Текущий кредит:",
      walletConnected: "Кошелек подключен:",
      walletNotConnected: "Кошелек не подключен",
      depositAmount: "Сумма депозита (CSPIN):",
      depositButton: "💰 Депозит CSPIN",
      withdrawButton: "💸 Вывести CSPIN",
      betAmount: "Сумма ставки:",
      spinButton: "🎰 КРУТИТЬ!",
      redGamble: "🔴 Красная ставка",
      blueGamble: "🔵 Синяя ставка",
      collectWinnings: "💰 Забрать выигрыш",
      gameLoaded: "Игра загружена!",
      connectWalletFirst: "Сначала подключите кошелек"
    }
  },
  ar: {
    translation: {
      title: "🚀 كاندل سبينر - ماكينة القمار الفضائية",
      currentCredit: "الرصيد الحالي:",
      walletConnected: "المحفظة متصلة:",
      walletNotConnected: "المحفظة غير متصلة",
      depositAmount: "مبلغ الإيداع (CSPIN):",
      depositButton: "💰 إيداع CSPIN",
      withdrawButton: "💸 سحب CSPIN",
      betAmount: "مبلغ الرهان:",
      spinButton: "🎰 دوران!",
      redGamble: "🔴 مقامرة حمراء",
      blueGamble: "🔵 مقامرة زرقاء",
      collectWinnings: "💰 جمع المكاسب",
      gameLoaded: "تم تحميل اللعبة!",
      connectWalletFirst: "يرجى توصيل المحفظة أولاً"
    }
  }
};

// Detect browser language
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('zh')) {
    if (browserLang.includes('CN') || browserLang.includes('Hans')) return 'zh-CN';
    if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('Hant')) return 'zh-TW';
    return 'zh-CN';
  }
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('ar')) return 'ar';
  
  return 'en'; // Default
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getBrowserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
