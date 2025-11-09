/**
 * 간소화된 다국어 번역 시스템
 * 영어와 한국어만 완전 번역, 나머지는 영어 폴백
 */

import type { SupportedLanguage } from './language';

// 번역 타입 정의
export interface Translations {
  app: {
    title: string;
    subtitle: string;
    footer: string;
  };
  header: {
    credit: string;
    loading: string;
  };
  game: {
    title: string;
    subtitle: string;
    newVersion: string;
    oldVersion: string;
  };
  wallet: {
    connectPrompt: string;
  };
  deposit: {
    title: string;
    amount: string;
    success: string;
    error: string;
    processing: string;
  };
  withdraw: {
    title: string;
    description: string;
    available: string;
    success: string;
    error: string;
    processing: string;
  };
  buttons: {
    deposit: string;
    withdraw: string;
    spin: string;
    spinning: string;
    max: string;
    decline: string;
    refresh: string;
    process: string;
    back: string;
  };
  betting: {
    amount: string;
    betRange: string;
  };
  errors: {
    insufficientBalance: string;
    generic: string;
  };
  results: {
    jackpot: string;
    win: string;
    congratulations: string;
    betterLuck: string;
  };
  doubleup: {
    title: string;
    description: string;
    currentWin: string;
    red: string;
    blue: string;
    success: string;
    failure: string;
  };
  admin: {
    title: string;
    pending: string;
    noWithdrawals: string;
    walletAddress: string;
    amount: string;
    requestedAt: string;
    accessDenied: string;
    connectAdmin: string;
  };
}

// 영어 (기본값)
const en: Translations = {
  app: {
    title: 'Candle Spinner',
    subtitle: 'TON Blockchain Slot Game',
    footer: 'Provably Fair Game',
  },
  header: {
    credit: 'Balance',
    loading: 'Loading...',
  },
  game: {
    title: 'Slot Machine',
    subtitle: 'Provably Fair Game',
    newVersion: 'Slot Machine V2',
    oldVersion: 'Slot Machine V1',
  },
  wallet: {
    connectPrompt: 'Connect your wallet to start playing',
  },
  deposit: {
    title: 'CSPIN Deposit',
    amount: 'Deposit Amount (CSPIN)',
    success: 'Deposit successful!',
    error: 'Deposit failed',
    processing: 'Processing...',
  },
  withdraw: {
    title: 'CSPIN Withdrawal',
    description: 'Admin approval required after withdrawal request',
    available: 'Available',
    success: 'Withdrawal request completed!',
    error: 'Withdrawal request failed',
    processing: 'Processing...',
  },
  buttons: {
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    spin: 'Spin!',
    spinning: 'Spinning...',
    max: 'MAX',
    decline: 'Skip',
    refresh: 'Refresh',
    process: 'Process',
    back: 'Back to Home',
  },
  betting: {
    amount: 'Bet Amount',
    betRange: 'Minimum bet is 10 CSPIN',
  },
  errors: {
    insufficientBalance: 'Insufficient balance!',
    generic: 'Game failed',
  },
  results: {
    jackpot: 'JACKPOT!',
    win: 'Win!',
    congratulations: 'Congratulations!',
    betterLuck: 'Better luck next time!',
  },
  doubleup: {
    title: 'Double Up Challenge!',
    description: 'Choose a color',
    currentWin: 'Current Win',
    red: 'Red',
    blue: 'Blue',
    success: 'Success!',
    failure: 'Failed',
  },
  admin: {
    title: 'Admin - Withdrawal Management',
    pending: 'Pending Withdrawals',
    noWithdrawals: 'No pending withdrawals',
    walletAddress: 'Wallet Address',
    amount: 'Amount',
    requestedAt: 'Requested At',
    accessDenied: 'Access Denied - Admin wallet required',
    connectAdmin: 'Connect admin wallet to manage withdrawals',
  },
};

// 한국어
const ko: Translations = {
  app: {
    title: 'Candle Spinner',
    subtitle: 'TON 블록체인 기반 슬롯머신 게임',
    footer: 'Provably Fair 공정한 게임',
  },
  header: {
    credit: '보유 크레딧',
    loading: '로딩 중...',
  },
  game: {
    title: '슬롯머신',
    subtitle: 'Provably Fair 공정한 게임',
    newVersion: '슬롯머신 V2',
    oldVersion: '슬롯머신 V1',
  },
  wallet: {
    connectPrompt: '지갑을 연결하여 게임을 시작하세요',
  },
  deposit: {
    title: 'CSPIN 입금',
    amount: '입금 금액 (CSPIN)',
    success: '입금 성공!',
    error: '입금 처리 실패',
    processing: '처리 중...',
  },
  withdraw: {
    title: 'CSPIN 인출',
    description: '인출 요청 후 관리자 승인이 필요합니다',
    available: '사용 가능',
    success: '인출 요청이 완료되었습니다!',
    error: '인출 요청 실패',
    processing: '처리 중...',
  },
  buttons: {
    deposit: '입금하기',
    withdraw: '인출하기',
    spin: '스핀!',
    spinning: '회전 중...',
    max: 'MAX',
    decline: '건너뛰기',
    refresh: '새로고침',
    process: '처리하기',
    back: '홈으로 돌아가기',
  },
  betting: {
    amount: '베팅 금액',
    betRange: '최소 베팅액은 10 CSPIN입니다',
  },
  errors: {
    insufficientBalance: '크레딧이 부족합니다!',
    generic: '게임 실행 실패',
  },
  results: {
    jackpot: 'JACKPOT!',
    win: '당첨!',
    congratulations: '축하합니다!',
    betterLuck: '다음 기회에!',
  },
  doubleup: {
    title: '더블업 도전!',
    description: '색상을 선택하세요',
    currentWin: '현재 상금',
    red: '빨강',
    blue: '파랑',
    success: '성공!',
    failure: '실패',
  },
  admin: {
    title: '관리자 - 인출 관리',
    pending: '대기 중인 인출',
    noWithdrawals: '대기 중인 인출이 없습니다',
    walletAddress: '지갑 주소',
    amount: '금액',
    requestedAt: '요청 시각',
    accessDenied: '접근 거부 - 관리자 지갑 필요',
    connectAdmin: '인출을 관리하려면 관리자 지갑을 연결하세요',
  },
};

// 번역 맵
const translations: Record<SupportedLanguage, Translations> = {
  en,
  ko,
  'zh-CN': en, // 중국어 간체는 영어로 폴백
  'zh-TW': en, // 중국어 번체는 영어로 폴백
  ja: en, // 일본어는 영어로 폴백
  vi: en, // 베트남어는 영어로 폴백
  ru: en, // 러시아어는 영어로 폴백
  es: en, // 스페인어는 영어로 폴백
  hi: en, // 힌디어는 영어로 폴백
};

/**
 * 현재 언어의 번역 텍스트 가져오기
 */
export function getTranslations(language: SupportedLanguage): Translations {
  return translations[language] || translations.en;
}

/**
 * 간단한 번역 함수
 */
export function t(key: string, language: SupportedLanguage): string {
  const trans = getTranslations(language);
  const keys = key.split('.');
  let result: any = trans;
  
  for (const k of keys) {
    result = result?.[k];
    if (result === undefined) {
      console.warn(`[Translation] Missing key: ${key} for language: ${language}`);
      return key;
    }
  }
  
  return result as string;
}
