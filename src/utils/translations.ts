/**
 * 완전한 다국어 번역 시스템 (9개 언어 지원)
 * EN, KO, ZH-CN, ZH-TW, VI, JA, RU, ES, HI
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
    debugLog: string;
  };
  betting: {
    amount: string;
    betRange: string;
  };
  errors: {
    insufficientBalance: string;
    generic: string;
    invalidAmount: string;
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
  footer: {
    copyright: string;
    allRights: string;
  };
  help: {
    nav: {
      slot: string;
      help: string;
    };
    title: string;
    intro: string;
    wallet: {
      title: string;
      description: string;
      steps: string[];
      linkText: string;
    };
    token: {
      title: string;
      description: string;
      linkText: string;
    };
    rules: {
      title: string;
      items: string[];
    };
    doubleup: {
      title: string;
      items: string[];
    };
    gameplay: {
      title: string;
      steps: string[];
    };
    extra: {
      title: string;
      items: string[];
    };
  };
}

// English
const en: Translations = {
  app: {
    title: 'CandleSpinner',
    subtitle: 'TON Blockchain Slot Game',
    footer: 'Provably Fair Game',
  },
  header: {
    credit: 'CSPIN Credits',
    loading: 'Loading...',
  },
  game: {
    title: 'Slot Machine',
    subtitle: 'Provably Fair Game',
  },
  wallet: {
    connectPrompt: 'Connect your wallet to start playing',
  },
  deposit: {
    title: 'Deposit CSPIN Tokens',
    amount: 'Deposit Amount (CSPIN)',
    success: 'Deposit successful!',
    error: 'Deposit failed',
    processing: 'Processing...',
  },
  withdraw: {
    title: 'Withdraw CSPIN Tokens',
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
    debugLog: 'View Debug Log',
  },
  betting: {
    amount: 'Bet Amount',
    betRange: 'Minimum bet is 10 CSPIN',
  },
  errors: {
    insufficientBalance: 'Insufficient balance!',
    generic: 'Game failed',
    invalidAmount: 'Invalid amount',
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
  footer: {
    copyright: 'Copyright',
    allRights: 'All rights reserved',
  },
  help: {
    nav: {
      slot: 'Slot Machine',
      help: 'Help Center',
    },
    title: 'CandleSpinner Quick Start',
    intro: 'Follow this playbook to prepare your wallet and learn how the slot machine works before you start spinning.',
    wallet: {
      title: 'Create a TON Wallet',
      description: 'Install the official Telegram TON Wallet bot so you can safely store CSPIN tokens and approve in-game transactions.',
      steps: [
        'Open the official TON Wallet bot in Telegram and tap Start.',
        'Create a new wallet, write down the recovery phrase, and keep it offline in a secure place.',
        'Set a strong passcode and enable notifications so you never miss a signing request.',
      ],
      linkText: 'Open Telegram TON Wallet',
    },
    token: {
      title: 'Buy CSPIN Tokens',
      description: 'Need CSPIN? Join the official community to ask purchase questions, find OTC deals, or stay informed about liquidity updates.',
      linkText: 'Open CSPIN Telegram Group',
    },
    rules: {
      title: 'Slot Machine Rules',
      items: [
        'Three reels spin with seven emoji symbols. Only the center line counts.',
        'Match two identical symbols to earn a smaller prize. Match three for a massive jackpot.',
        'Jackpot spins multiply the matched prize by 100 before adding it to your credits.',
      ],
    },
    doubleup: {
      title: 'Double-Up Rules',
      items: [
        'Double-Up appears only when your spin wins CSPIN.',
        'Choose red or blue. Each color has a 50% success rate.',
        'Win to double the latest payout instantly. Lose to give the prize back.',
      ],
    },
    gameplay: {
      title: 'How to Play',
      steps: [
        'Connect your TON wallet using the button in the top bar.',
        'Deposit CSPIN tokens so they convert into in-game credits.',
        'Pick a bet size that fits your plan and press Spin.',
        'Check the result. If you win, decide whether to attempt the Double-Up challenge.',
        'Visit the Withdraw panel whenever you want to cash CSPIN back to your wallet.',
      ],
    },
    extra: {
      title: 'Helpful Tips',
      items: [
        'Keep a small amount of TON handy to pay network fees.',
        'Open the debug log button if any deposit or withdrawal fails.',
        'Credits are stored on the server, so redeployments no longer reset balances.',
        'Play responsibly and set a personal limit before each session.',
      ],
    },
  },
};

// Korean (한국어)
const ko: Translations = {
  app: {
    title: 'CandleSpinner',
    subtitle: 'TON 블록체인 슬롯 게임',
    footer: 'Provably Fair 공정한 게임',
  },
  header: {
    credit: 'CSPIN 크레딧',
    loading: '로딩 중...',
  },
  game: {
    title: '슬롯머신',
    subtitle: 'Provably Fair 공정한 게임',
  },
  wallet: {
    connectPrompt: '지갑을 연결하여 게임을 시작하세요',
  },
  deposit: {
    title: 'CSPIN 토큰 입금',
    amount: '입금 금액 (CSPIN)',
    success: '입금 성공!',
    error: '입금 실패',
    processing: '처리 중...',
  },
  withdraw: {
    title: 'CSPIN 토큰 인출',
    description: '인출 요청 후 관리자 승인이 필요합니다',
    available: '사용 가능',
    success: '인출 요청 완료!',
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
    debugLog: '디버그 로그 보기',
  },
  betting: {
    amount: '베팅 금액',
    betRange: '최소 베팅액은 10 CSPIN입니다',
  },
  errors: {
    insufficientBalance: '잔액 부족!',
    generic: '게임 실행 실패',
    invalidAmount: '잘못된 금액입니다',
  },
  results: {
    jackpot: '대박!',
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
    connectAdmin: '인출 관리를 위해 관리자 지갑을 연결하세요',
  },
  footer: {
    copyright: '저작권',
    allRights: '모든 권리 보유',
  },
  help: {
    nav: {
      slot: '슬롯머신',
      help: '도움말 센터',
    },
    title: 'CandleSpinner 빠른 시작',
    intro: '아래 순서를 따르면 TON 지갑 준비부터 게임 플레이까지 한 번에 익힐 수 있습니다.',
    wallet: {
      title: 'TON 지갑 만들기',
      description: '텔레그램 공식 TON Wallet 봇을 설치해 CSPIN 토큰을 안전하게 보관하고 결제 요청을 승인하세요.',
      steps: [
        '텔레그램에서 TON Wallet 공식 봇을 열고 시작 버튼을 누릅니다.',
        '새 지갑을 생성하고 복구 구문(시드 문구)을 메모한 뒤 오프라인으로 안전하게 보관합니다.',
        '강력한 잠금 비밀번호를 설정하고 알림을 켜 두어 서명 요청을 놓치지 않도록 합니다.',
      ],
      linkText: '텔레그램 TON Wallet 열기',
    },
    token: {
      title: 'CSPIN 토큰 구매 문의',
      description: 'CSPIN이 필요하다면 공식 커뮤니티에서 구매 방법을 문의하거나 홀더들과 직접 거래 정보를 확인하세요.',
      linkText: 'CSPIN 공식 텔레그램 그룹 바로가기',
    },
    rules: {
      title: '슬롯머신 규칙',
      items: [
        '세 개의 릴이 일곱 가지 이모지 심볼로 회전하며 중앙 라인만 평가합니다.',
        '같은 심볼이 두 개 이상 맞으면 상금이 지급되고, 세 개가 모두 같으면 잭팟이 발동합니다.',
        '잭팟이 나오면 해당 심볼의 상금이 100배 적용되어 크레딧에 적립됩니다.',
      ],
    },
    doubleup: {
      title: '더블업 규칙',
      items: [
        '슬롯 스핀에서 CSPIN을 획득한 경우에만 더블업 기회가 열립니다.',
        '빨강 또는 파랑 중 하나를 선택하면 50% 확률로 성공 여부가 결정됩니다.',
        '성공 시 마지막 상금이 두 배가 되고, 실패 시 해당 상금을 모두 반환합니다.',
      ],
    },
    gameplay: {
      title: '플레이 방법',
      steps: [
        '상단 버튼으로 TON 지갑을 연결합니다.',
        'CSPIN 토큰을 입금해 게임 내 크레딧으로 전환합니다.',
        '원하는 베팅 금액을 선택한 뒤 스핀 버튼을 누릅니다.',
        '결과를 확인하고 당첨 시 더블업 도전을 할지 결정합니다.',
        '언제든지 인출 메뉴에서 CSPIN을 다시 지갑으로 출금할 수 있습니다.',
      ],
    },
    extra: {
      title: '추가 팁',
      items: [
        '네트워크 수수료를 위해 TON 잔액을 조금 남겨 두세요.',
        '입금 또는 인출이 실패하면 디버그 로그 보기를 열어 상세 메시지를 확인하세요.',
        '크레딧은 서버에 저장되므로 재배포 후에도 잔액이 초기화되지 않습니다.',
        '책임감 있게 플레이하며 세션마다 예산 한도를 정해 두면 좋아요.',
      ],
    },
  },
};

// Simplified Chinese (简体中文)
const zhCN: Translations = {
  app: {
    title: 'CandleSpinner',
    subtitle: 'TON区块链老虎机游戏',
    footer: '公平可验证游戏',
  },
  header: {
    credit: 'CSPIN积分',
    loading: '加载中...',
  },
  game: {
    title: '老虎机',
    subtitle: '公平可验证游戏',
  },
  wallet: {
    connectPrompt: '连接钱包开始游戏',
  },
  deposit: {
    title: '充值CSPIN代币',
    amount: '充值金额 (CSPIN)',
    success: '充值成功！',
    error: '充值失败',
    processing: '处理中...',
  },
  withdraw: {
    title: '提取CSPIN代币',
    description: '提现请求需要管理员批准',
    available: '可用',
    success: '提现请求已完成！',
    error: '提现请求失败',
    processing: '处理中...',
  },
  buttons: {
    deposit: '充值',
    withdraw: '提现',
    spin: '旋转！',
    spinning: '旋转中...',
    max: '最大',
    decline: '跳过',
    refresh: '刷新',
    process: '处理',
    back: '返回首页',
    debugLog: '查看调试日志',
  },
  betting: {
    amount: '投注金额',
    betRange: '最小投注额为10 CSPIN',
  },
  errors: {
    insufficientBalance: '余额不足！',
    generic: '游戏失败',
    invalidAmount: '金额无效',
  },
  results: {
    jackpot: '大奖！',
    win: '获胜！',
    congratulations: '恭喜！',
    betterLuck: '下次好运！',
  },
  doubleup: {
    title: '双倍挑战！',
    description: '选择颜色',
    currentWin: '当前奖金',
    red: '红色',
    blue: '蓝色',
    success: '成功！',
    failure: '失败',
  },
  admin: {
    title: '管理员 - 提现管理',
    pending: '待处理提现',
    noWithdrawals: '无待处理提现',
    walletAddress: '钱包地址',
    amount: '金额',
    requestedAt: '请求时间',
    accessDenied: '访问被拒绝 - 需要管理员钱包',
    connectAdmin: '连接管理员钱包以管理提现',
  },
  footer: {
    copyright: '版权所有',
    allRights: '保留所有权利',
  },
  help: {
    nav: {
      slot: '老虎机',
      help: '帮助中心',
    },
    title: 'CandleSpinner 快速上手',
    intro: '按照以下步骤，第一次使用的玩家也能迅速完成钱包准备并了解游戏规则。',
    wallet: {
      title: '创建 TON 钱包',
      description: '安装 Telegram 官方 TON Wallet 机器人，用于安全保管 CSPIN 代币并签署游戏请求。',
      steps: [
        '在 Telegram 中打开 TON Wallet 官方机器人并点击开始。',
        '创建新钱包，抄写助记词并离线妥善保存。',
        '设置强密码并开启通知，避免错过签名请求。',
      ],
      linkText: '打开 Telegram TON Wallet',
    },
    token: {
      title: '购买 CSPIN 代币',
      description: '如果需要购买 CSPIN，可加入官方社群咨询、寻找场外交易或获取流动性更新。',
      linkText: '打开 CSPIN 官方 Telegram 群组',
    },
    rules: {
      title: '老虎机规则',
      items: [
        '三条转轴使用七种表情符号，只有中间横线计算结果。',
        '两枚相同符号即可获得小额奖励，三枚相同触发巨额奖池。',
        '出现三连相同符号时，奖金会被乘以 100 并计入您的余额。',
      ],
    },
    doubleup: {
      title: '双倍挑战规则',
      items: [
        '只有当本轮旋转赢得 CSPIN 时才会出现双倍挑战。',
        '选择红色或蓝色，两种颜色成功率均为 50%。',
        '成功即可把刚刚的奖金翻倍，失败则返还该笔奖金。',
      ],
    },
    gameplay: {
      title: '如何游玩',
      steps: [
        '通过顶部按钮连接您的 TON 钱包。',
        '存入 CSPIN 代币并转换为游戏积分。',
        '选择合适的下注金额并点击旋转。',
        '查看结果，中奖时决定是否挑战双倍模式。',
        '准备提现时进入提款面板，把 CSPIN 取回钱包。',
      ],
    },
    extra: {
      title: '实用提示',
      items: [
        '钱包中保留少量 TON 以支付网络手续费。',
        '如遇交易失败，点击“查看调试日志”获取详细信息。',
        '积分存储在服务器上，重新部署后也不会清零。',
        '理性娱乐，提前设定个人预算。',
      ],
    },
  },
};

// Traditional Chinese (繁體中文)
const zhTW: Translations = {
  app: {
    title: 'CandleSpinner',
    subtitle: 'TON區塊鏈老虎機遊戲',
    footer: '公平可驗證遊戲',
  },
  header: {
    credit: 'CSPIN積分',
    loading: '載入中...',
  },
  game: {
    title: '老虎機',
    subtitle: '公平可驗證遊戲',
  },
  wallet: {
    connectPrompt: '連接錢包開始遊戲',
  },
  deposit: {
    title: '充值CSPIN代幣',
    amount: '充值金額 (CSPIN)',
    success: '充值成功！',
    error: '充值失敗',
    processing: '處理中...',
  },
  withdraw: {
    title: '提取CSPIN代幣',
    description: '提現請求需要管理員批准',
    available: '可用',
    success: '提現請求已完成！',
    error: '提現請求失敗',
    processing: '處理中...',
  },
  buttons: {
    deposit: '充值',
    withdraw: '提現',
    spin: '旋轉！',
    spinning: '旋轉中...',
    max: '最大',
    decline: '跳過',
    refresh: '刷新',
    process: '處理',
    back: '返回首頁',
    debugLog: '查看除錯日誌',
  },
  betting: {
    amount: '投注金額',
    betRange: '最小投注額為10 CSPIN',
  },
  errors: {
    insufficientBalance: '餘額不足！',
    generic: '遊戲失敗',
    invalidAmount: '金額無效',
  },
  results: {
    jackpot: '大獎！',
    win: '獲勝！',
    congratulations: '恭喜！',
    betterLuck: '下次好運！',
  },
  doubleup: {
    title: '雙倍挑戰！',
    description: '選擇顏色',
    currentWin: '當前獎金',
    red: '紅色',
    blue: '藍色',
    success: '成功！',
    failure: '失敗',
  },
  admin: {
    title: '管理員 - 提現管理',
    pending: '待處理提現',
    noWithdrawals: '無待處理提現',
    walletAddress: '錢包地址',
    amount: '金額',
    requestedAt: '請求時間',
    accessDenied: '訪問被拒絕 - 需要管理員錢包',
    connectAdmin: '連接管理員錢包以管理提現',
  },
  footer: {
    copyright: '版權所有',
    allRights: '保留所有權利',
  },
  help: {
    nav: {
      slot: '老虎機',
      help: '說明中心',
    },
    title: 'CandleSpinner 快速指南',
    intro: '依照下列步驟即可完成錢包設定並熟悉遊戲規則，新手也能立即上手。',
    wallet: {
      title: '建立 TON 錢包',
      description: '安裝 Telegram 官方 TON Wallet 機器人，安全保管 CSPIN 代幣並處理簽名請求。',
      steps: [
        '在 Telegram 中開啟 TON Wallet 官方機器人並點選開始。',
        '建立新錢包，抄寫助記詞並離線保存，確保不被他人看到。',
        '設定強密碼並開啟通知，避免錯過交易簽名。',
      ],
      linkText: '前往 Telegram TON Wallet',
    },
    token: {
      title: '購買 CSPIN 代幣',
      description: '若需要購買 CSPIN，歡迎加入官方社群詢問、尋找場外交易或取得流動性資訊。',
      linkText: '前往 CSPIN 官方 Telegram 群組',
    },
    rules: {
      title: '老虎機規則',
      items: [
        '三條轉軸使用七種表情符號，僅計算中線結果。',
        '兩個相同符號即可獲得獎勵，三個全中則啟動百倍獎池。',
        '觸發百倍獎池時，該筆獎金會乘以 100 後加入您的點數。',
      ],
    },
    doubleup: {
      title: '加倍遊戲規則',
      items: [
        '只有在本輪旋轉贏得 CSPIN 時，才會出現加倍挑戰。',
        '從紅色或藍色擇一，成功率各為 50%。',
        '成功即可把剛獲得的獎金翻倍，失敗則會退回該筆獎金。',
      ],
    },
    gameplay: {
      title: '遊戲方式',
      steps: [
        '使用上方按鈕連結您的 TON 錢包。',
        '存入 CSPIN 代幣並轉換為遊戲點數。',
        '選擇下注金額後按下旋轉。',
        '檢視結果，若中獎再決定是否進行加倍挑戰。',
        '想要兌現時，至提領面板把 CSPIN 提回錢包。',
      ],
    },
    extra: {
      title: '實用小提示',
      items: [
        '保留少量 TON 以支付鏈上手續費。',
        '若交易失敗，點擊「檢視除錯紀錄」了解詳細原因。',
        '點數儲存在伺服器上，重新部署後也不會被清零。',
        '請量力而為，事先設定個人投注上限。',
      ],
    },
  },
};

// Vietnamese (Tiếng Việt)
const vi: Translations = {
  app: {
    title: 'CandleSpinner',
    subtitle: 'Trò chơi Slot trên TON Blockchain',
    footer: 'Trò chơi công bằng có thể kiểm chứng',
  },
  header: {
    credit: 'Điểm CSPIN',
    loading: 'Đang tải...',
  },
  game: {
    title: 'Máy đánh bạc',
    subtitle: 'Trò chơi công bằng có thể kiểm chứng',
  },
  wallet: {
    connectPrompt: 'Kết nối ví để bắt đầu chơi',
  },
  deposit: {
    title: 'Nạp token CSPIN',
    amount: 'Số tiền nạp (CSPIN)',
    success: 'Nạp tiền thành công!',
    error: 'Nạp tiền thất bại',
    processing: 'Đang xử lý...',
  },
  withdraw: {
    title: 'Rút token CSPIN',
    description: 'Yêu cầu rút tiền cần được quản trị viên phê duyệt',
    available: 'Khả dụng',
    success: 'Yêu cầu rút tiền đã hoàn tất!',
    error: 'Yêu cầu rút tiền thất bại',
    processing: 'Đang xử lý...',
  },
  buttons: {
    deposit: 'Nạp tiền',
    withdraw: 'Rút tiền',
    spin: 'Quay!',
    spinning: 'Đang quay...',
    max: 'TỐI ĐA',
    decline: 'Bỏ qua',
    refresh: 'Làm mới',
    process: 'Xử lý',
    back: 'Quay lại Trang chủ',
    debugLog: 'Xem Nhật ký Gỡ lỗi',
  },
  betting: {
    amount: 'Số tiền cược',
    betRange: 'Cược tối thiểu là 10 CSPIN',
  },
  errors: {
    insufficientBalance: 'Số dư không đủ!',
    generic: 'Trò chơi thất bại',
    invalidAmount: 'Số tiền không hợp lệ',
  },
  results: {
    jackpot: 'ĐẠI THƯỞNG!',
    win: 'Thắng!',
    congratulations: 'Chúc mừng!',
    betterLuck: 'Chúc may mắn lần sau!',
  },
  doubleup: {
    title: 'Thử thách gấp đôi!',
    description: 'Chọn màu',
    currentWin: 'Tiền thắng hiện tại',
    red: 'Đỏ',
    blue: 'Xanh',
    success: 'Thành công!',
    failure: 'Thất bại',
  },
  admin: {
    title: 'Quản trị - Quản lý rút tiền',
    pending: 'Yêu cầu rút tiền đang chờ',
    noWithdrawals: 'Không có yêu cầu rút tiền đang chờ',
    walletAddress: 'Địa chỉ ví',
    amount: 'Số tiền',
    requestedAt: 'Thời gian yêu cầu',
    accessDenied: 'Truy cập bị từ chối - Cần ví quản trị viên',
    connectAdmin: 'Kết nối ví quản trị viên để quản lý rút tiền',
  },
  footer: {
    copyright: 'Bản quyền',
    allRights: 'Đã đăng ký bản quyền',
  },
  help: {
    nav: {
      slot: 'Máy đánh bạc',
      help: 'Trung tâm trợ giúp',
    },
    title: 'Hướng dẫn nhanh CandleSpinner',
    intro: 'Làm theo hướng dẫn này để chuẩn bị ví TON và hiểu rõ cách máy đánh bạc vận hành trước khi quay.',
    wallet: {
      title: 'Tạo ví TON',
      description: 'Cài đặt bot TON Wallet chính thức trên Telegram để lưu trữ token CSPIN an toàn và phê duyệt giao dịch trong game.',
      steps: [
        'Mở bot TON Wallet chính thức trên Telegram và nhấn Bắt đầu.',
        'Tạo ví mới, ghi lại cụm khôi phục và cất giữ ngoại tuyến ở nơi an toàn.',
        'Đặt mã khóa mạnh và bật thông báo để không bỏ lỡ yêu cầu ký.',
      ],
      linkText: 'Mở bot TON Wallet trên Telegram',
    },
    token: {
      title: 'Mua token CSPIN',
      description: 'Cần mua CSPIN? Hãy tham gia cộng đồng chính thức để đặt câu hỏi, tìm giao dịch OTC hoặc cập nhật thanh khoản.',
      linkText: 'Tham gia nhóm Telegram CSPIN',
    },
    rules: {
      title: 'Luật máy đánh bạc',
      items: [
        'Ba cuộn quay với bảy biểu tượng emoji, chỉ tính đường giữa.',
        'Khớp hai biểu tượng giống nhau để nhận thưởng, khớp cả ba để nổ hũ lớn.',
        'Khi nổ hũ, tiền thưởng được nhân 100 trước khi cộng vào điểm tín dụng.',
      ],
    },
    doubleup: {
      title: 'Luật nhân đôi',
      items: [
        'Tùy chọn Nhân đôi chỉ xuất hiện khi lượt quay thắng CSPIN.',
        'Chọn Đỏ hoặc Xanh, mỗi màu có 50% tỷ lệ thành công.',
        'Thắng sẽ nhân đôi khoản thưởng vừa nhận, thua sẽ trả lại khoản đó.',
      ],
    },
    gameplay: {
      title: 'Cách chơi',
      steps: [
        'Kết nối ví TON bằng nút ở thanh trên.',
        'Nạp token CSPIN để chuyển thành điểm tín dụng trong trò chơi.',
        'Chọn mức cược phù hợp rồi nhấn Quay.',
        'Xem kết quả và quyết định có thử Nhân đôi khi thắng hay không.',
        'Mở mục Rút tiền để chuyển CSPIN về ví bất cứ lúc nào.',
      ],
    },
    extra: {
      title: 'Mẹo hữu ích',
      items: [
        'Luôn giữ lại một ít TON để trả phí mạng.',
        'Dùng nút Nhật ký gỡ lỗi nếu thao tác nạp hoặc rút thất bại.',
        'Điểm tín dụng được lưu trên máy chủ nên không bị đặt lại sau khi triển khai lại.',
        'Chơi có trách nhiệm và đặt hạn mức cho mỗi phiên.',
      ],
    },
  },
};

// Japanese (日本語)
const ja: Translations = {
  app: {
    title: 'CandleSpinner',
    subtitle: 'TONブロックチェーンスロットゲーム',
    footer: '証明可能な公正なゲーム',
  },
  header: {
    credit: 'CSPINクレジット',
    loading: '読み込み中...',
  },
  game: {
    title: 'スロットマシン',
    subtitle: '証明可能な公正なゲーム',
  },
  wallet: {
    connectPrompt: 'ウォレットを接続してプレイを開始',
  },
  deposit: {
    title: 'CSPINトークン入金',
    amount: '入金額 (CSPIN)',
    success: '入金成功！',
    error: '入金失敗',
    processing: '処理中...',
  },
  withdraw: {
    title: 'CSPINトークン出金',
    description: '出金リクエスト後、管理者の承認が必要です',
    available: '利用可能',
    success: '出金リクエスト完了！',
    error: '出金リクエスト失敗',
    processing: '処理中...',
  },
  buttons: {
    deposit: '入金',
    withdraw: '出金',
    spin: 'スピン！',
    spinning: '回転中...',
    max: '最大',
    decline: 'スキップ',
    refresh: '更新',
    process: '処理',
    back: 'ホームに戻る',
    debugLog: 'デバッグログを表示',
  },
  betting: {
    amount: 'ベット額',
    betRange: '最小ベット額は10 CSPIN',
  },
  errors: {
    insufficientBalance: '残高不足！',
    generic: 'ゲーム失敗',
    invalidAmount: '無効な金額です',
  },
  results: {
    jackpot: 'ジャックポット！',
    win: '勝利！',
    congratulations: 'おめでとうございます！',
    betterLuck: '次回頑張りましょう！',
  },
  doubleup: {
    title: 'ダブルアップチャレンジ！',
    description: '色を選択',
    currentWin: '現在の賞金',
    red: '赤',
    blue: '青',
    success: '成功！',
    failure: '失敗',
  },
  admin: {
    title: '管理者 - 出金管理',
    pending: '保留中の出金',
    noWithdrawals: '保留中の出金はありません',
    walletAddress: 'ウォレットアドレス',
    amount: '金額',
    requestedAt: 'リクエスト時刻',
    accessDenied: 'アクセス拒否 - 管理者ウォレットが必要',
    connectAdmin: '出金を管理するには管理者ウォレットを接続',
  },
  footer: {
    copyright: '著作権',
    allRights: '全著作権所有',
  },
  help: {
    nav: {
      slot: 'スロットマシン',
      help: 'ヘルプセンター',
    },
    title: 'CandleSpinner クイックスタート',
    intro: 'プレイを始める前に、以下の手順でTONウォレットを整え、ゲームの流れを押さえておきましょう。',
    wallet: {
      title: 'TONウォレットを作成',
      description: 'Telegram公式のTON Walletボットを導入してCSPINトークンを安全に保管し、ゲーム内トランザクションを承認します。',
      steps: [
        'Telegramで公式TON Walletボットを開き、Startをタップします。',
        '新しいウォレットを作成し、リカバリーフレーズを書き留めてオフラインで安全に保管します。',
        '強力なパスコードを設定し、署名リクエストを逃さないよう通知をオンにします。',
      ],
      linkText: 'TelegramでTON Walletを開く',
    },
    token: {
      title: 'CSPINトークンを購入する',
      description: 'CSPINが必要な場合は公式コミュニティに参加し、購入方法の相談やOTC取引・流動性情報を確認してください。',
      linkText: 'CSPIN公式Telegramグループへ',
    },
    rules: {
      title: 'スロットのルール',
      items: [
        '3本のリールが7種類の絵文字シンボルで回転し、中央ラインのみが判定対象です。',
        '同じシンボルを2つ揃えると配当、3つ揃えると巨大ジャックポットです。',
        'ジャックポット時は該当配当が100倍になり、クレジットに加算されます。',
      ],
    },
    doubleup: {
      title: 'ダブルアップのルール',
      items: [
        'ダブルアップはそのスピンでCSPINを獲得した場合にのみ表示されます。',
        '赤または青を選びます。成功率は双方50%です。',
        '成功すると直前の配当が2倍になり、失敗するとその配当を失います。',
      ],
    },
    gameplay: {
      title: '遊び方',
      steps: [
        '上部のボタンからTONウォレットを接続します。',
        'CSPINトークンを入金してゲーム内クレジットに変換します。',
        'ベット額を選択してスピンボタンを押します。',
        '結果を確認し、勝利したらダブルアップに挑戦するか決めます。',
        '出金タブからCSPINをウォレットへ戻して現金化できます。',
      ],
    },
    extra: {
      title: '役立つヒント',
      items: [
        'ネットワーク手数料用に少量のTONを残しておきましょう。',
        '入金や出金が失敗した場合は「デバッグログを表示」で詳細を確認してください。',
        'クレジットはサーバーに保存されるため、再デプロイしてもリセットされません。',
        '責任を持って遊び、各セッションの上限を事前に決めておきましょう。',
      ],
    },
  },
};

// Russian (Русский)
const ru: Translations = {
  app: {
    title: 'CandleSpinner',
    subtitle: 'Слот-игра на блокчейне TON',
    footer: 'Доказуемо честная игра',
  },
  header: {
    credit: 'Кредиты CSPIN',
    loading: 'Загрузка...',
  },
  game: {
    title: 'Игровой автомат',
    subtitle: 'Доказуемо честная игра',
  },
  wallet: {
    connectPrompt: 'Подключите кошелек, чтобы начать играть',
  },
  deposit: {
    title: 'Пополнить токены CSPIN',
    amount: 'Сумма пополнения (CSPIN)',
    success: 'Пополнение успешно!',
    error: 'Ошибка пополнения',
    processing: 'Обработка...',
  },
  withdraw: {
    title: 'Вывести токены CSPIN',
    description: 'После запроса на вывод требуется одобрение администратора',
    available: 'Доступно',
    success: 'Запрос на вывод выполнен!',
    error: 'Ошибка запроса на вывод',
    processing: 'Обработка...',
  },
  buttons: {
    deposit: 'Пополнить',
    withdraw: 'Вывести',
    spin: 'Крутить!',
    spinning: 'Вращение...',
    max: 'МАКС',
    decline: 'Пропустить',
    refresh: 'Обновить',
    process: 'Обработать',
    back: 'На главную',
    debugLog: 'Посмотреть журнал отладки',
  },
  betting: {
    amount: 'Сумма ставки',
    betRange: 'Минимальная ставка 10 CSPIN',
  },
  errors: {
    insufficientBalance: 'Недостаточно средств!',
    generic: 'Игра провалилась',
    invalidAmount: 'Недопустимая сумма',
  },
  results: {
    jackpot: 'ДЖЕКПОТ!',
    win: 'Выигрыш!',
    congratulations: 'Поздравляем!',
    betterLuck: 'Удачи в следующий раз!',
  },
  doubleup: {
    title: 'Удвоение!',
    description: 'Выберите цвет',
    currentWin: 'Текущий выигрыш',
    red: 'Красный',
    blue: 'Синий',
    success: 'Успех!',
    failure: 'Неудача',
  },
  admin: {
    title: 'Админ - Управление выводами',
    pending: 'Ожидающие выводы',
    noWithdrawals: 'Нет ожидающих выводов',
    walletAddress: 'Адрес кошелька',
    amount: 'Сумма',
    requestedAt: 'Время запроса',
    accessDenied: 'Доступ запрещен - требуется кошелек администратора',
    connectAdmin: 'Подключите кошелек администратора для управления выводами',
  },
  footer: {
    copyright: 'Авторские права',
    allRights: 'Все права защищены',
  },
  help: {
    nav: {
      slot: 'Игровой автомат',
      help: 'Центр помощи',
    },
    title: 'Быстрый старт CandleSpinner',
    intro: 'Следуйте этому чек-листу, чтобы подготовить TON-кошелек и разобраться с правилами слота прежде чем крутить барабаны.',
    wallet: {
      title: 'Создайте TON-кошелек',
      description: 'Установите официального бота TON Wallet в Telegram, чтобы безопасно хранить токены CSPIN и одобрять игровые транзакции.',
      steps: [
        'Откройте официального бота TON Wallet в Telegram и нажмите «Start».',
        'Создайте новый кошелек, запишите seed-фразу и храните ее офлайн в безопасном месте.',
        'Задайте надежный пароль и включите уведомления, чтобы не пропустить запрос на подпись.',
      ],
      linkText: 'Открыть TON Wallet в Telegram',
    },
    token: {
      title: 'Купить токены CSPIN',
      description: 'Нужны CSPIN? Присоединяйтесь к официальному сообществу, задавайте вопросы о покупке, ищите OTC-сделки и актуальные новости о ликвидности.',
      linkText: 'Перейти в Telegram-группу CSPIN',
    },
    rules: {
      title: 'Правила игрового автомата',
      items: [
        'Три барабана с семью эмодзи-символами. Учитывается только центральная линия.',
        'Два одинаковых символа дают приз, три одинаковых – запускают джекпот.',
        'При джекпоте приз умножается на 100 и добавляется к вашим кредитам.',
      ],
    },
    doubleup: {
      title: 'Правила удвоения',
      items: [
        'Игра на удвоение появляется только после выигрышного спина с CSPIN.',
        'Выберите красный или синий – шанс успеха 50% на каждую сторону.',
        'Удача удвоит последний выигрыш, неудача вернет приз назад в банк.',
      ],
    },
    gameplay: {
      title: 'Как играть',
      steps: [
        'Подключите TON-кошелек через кнопку в верхней панели.',
        'Пополните счет токенами CSPIN, чтобы получить игровые кредиты.',
        'Выберите размер ставки и нажмите «Крутить».',
        'Изучите результат и решите, стоит ли пробовать удвоение после выигрыша.',
        'Когда захотите вывести средства, перейдите во вкладку «Вывод» и отправьте CSPIN обратно в кошелек.',
      ],
    },
    extra: {
      title: 'Полезные советы',
      items: [
        'Держите небольшой запас TON для оплаты сетевых комиссий.',
        'Если транзакция не прошла, откройте «Журнал отладки», чтобы увидеть детали.',
        'Кредиты хранятся на сервере, поэтому повторный деплой больше не обнуляет баланс.',
        'Играйте ответственно и заранее определяйте личный лимит.',
      ],
    },
  },
};

// Spanish (Español)
const es: Translations = {
  app: {
    title: 'CandleSpinner',
    subtitle: 'Juego de tragamonedas en blockchain TON',
    footer: 'Juego demostrablemente justo',
  },
  header: {
    credit: 'Créditos CSPIN',
    loading: 'Cargando...',
  },
  game: {
    title: 'Tragamonedas',
    subtitle: 'Juego demostrablemente justo',
  },
  wallet: {
    connectPrompt: 'Conecta tu billetera para comenzar a jugar',
  },
  deposit: {
    title: 'Depositar tokens CSPIN',
    amount: 'Cantidad a depositar (CSPIN)',
    success: '¡Depósito exitoso!',
    error: 'Error en el depósito',
    processing: 'Procesando...',
  },
  withdraw: {
    title: 'Retirar tokens CSPIN',
    description: 'Se requiere aprobación del administrador después de la solicitud de retiro',
    available: 'Disponible',
    success: '¡Solicitud de retiro completada!',
    error: 'Error en la solicitud de retiro',
    processing: 'Procesando...',
  },
  buttons: {
    deposit: 'Depositar',
    withdraw: 'Retirar',
    spin: '¡Girar!',
    spinning: 'Girando...',
    max: 'MÁX',
    decline: 'Omitir',
    refresh: 'Actualizar',
    process: 'Procesar',
    back: 'Volver al inicio',
    debugLog: 'Ver registro de depuración',
  },
  betting: {
    amount: 'Cantidad de apuesta',
    betRange: 'La apuesta mínima es 10 CSPIN',
  },
  errors: {
    insufficientBalance: '¡Saldo insuficiente!',
    generic: 'Juego fallido',
    invalidAmount: 'Cantidad no válida',
  },
  results: {
    jackpot: '¡PREMIO MAYOR!',
    win: '¡Ganaste!',
    congratulations: '¡Felicidades!',
    betterLuck: '¡Mejor suerte la próxima vez!',
  },
  doubleup: {
    title: '¡Desafío de duplicar!',
    description: 'Elige un color',
    currentWin: 'Ganancia actual',
    red: 'Rojo',
    blue: 'Azul',
    success: '¡Éxito!',
    failure: 'Fallido',
  },
  admin: {
    title: 'Admin - Gestión de retiros',
    pending: 'Retiros pendientes',
    noWithdrawals: 'No hay retiros pendientes',
    walletAddress: 'Dirección de billetera',
    amount: 'Cantidad',
    requestedAt: 'Solicitado en',
    accessDenied: 'Acceso denegado - Se requiere billetera de administrador',
    connectAdmin: 'Conecta la billetera de administrador para gestionar retiros',
  },
  footer: {
    copyright: 'Derechos de autor',
    allRights: 'Todos los derechos reservados',
  },
  help: {
    nav: {
      slot: 'Tragamonedas',
      help: 'Centro de ayuda',
    },
    title: 'Guía rápida de CandleSpinner',
    intro: 'Sigue esta guía para preparar tu billetera TON y entender cómo funciona la tragaperras antes de comenzar a girar.',
    wallet: {
      title: 'Crea una billetera TON',
      description: 'Instala el bot oficial TON Wallet en Telegram para guardar los tokens CSPIN con seguridad y aprobar las transacciones del juego.',
      steps: [
        'Abre el bot oficial TON Wallet en Telegram y pulsa Iniciar.',
        'Crea una nueva billetera, anota la frase de recuperación y guárdala offline en un lugar seguro.',
        'Configura un código de acceso sólido y activa las notificaciones para no perder ninguna solicitud de firma.',
      ],
      linkText: 'Abrir TON Wallet en Telegram',
    },
    token: {
      title: 'Comprar tokens CSPIN',
      description: '¿Necesitas CSPIN? Únete a la comunidad oficial para resolver dudas de compra, buscar acuerdos OTC o recibir novedades de liquidez.',
      linkText: 'Ir al grupo oficial de CSPIN en Telegram',
    },
    rules: {
      title: 'Reglas de la tragaperras',
      items: [
        'Tres carretes giran con siete símbolos emoji; solo cuenta la línea central.',
        'Empareja dos símbolos iguales para un premio pequeño y tres iguales para un gran jackpot.',
        'Cuando hay jackpot, el premio se multiplica por 100 antes de sumarse a tus créditos.',
      ],
    },
    doubleup: {
      title: 'Reglas de duplicar',
      items: [
        'El modo Duplicar aparece únicamente cuando la tirada gana CSPIN.',
        'Elige rojo o azul; cada color tiene un 50% de probabilidades.',
        'Si aciertas duplicas la recompensa reciente, si fallas la devuelves.',
      ],
    },
    gameplay: {
      title: 'Cómo jugar',
      steps: [
        'Conecta tu billetera TON con el botón de la barra superior.',
        'Deposita tokens CSPIN para convertirlos en créditos del juego.',
        'Elige el importe de la apuesta y pulsa Girar.',
        'Revisa el resultado y decide si quieres intentar Duplicar cuando ganes.',
        'Abre la pestaña Retirar cuando quieras devolver CSPIN a tu billetera.',
      ],
    },
    extra: {
      title: 'Consejos útiles',
      items: [
        'Guarda un poco de TON para cubrir las comisiones de red.',
        'Si un depósito o retiro falla, abre “Ver registro de depuración” para revisar el detalle.',
        'Los créditos se guardan en el servidor, por lo que un redeploy ya no reinicia el saldo.',
        'Juega con responsabilidad y fija un límite personal antes de cada sesión.',
      ],
    },
  },
};

// Hindi (हिन्दी)
const hi: Translations = {
  app: {
    title: 'CandleSpinner',
    subtitle: 'TON ब्लॉकचेन स्लॉट गेम',
    footer: 'सिद्ध रूप से निष्पक्ष खेल',
  },
  header: {
    credit: 'CSPIN क्रेडिट',
    loading: 'लोड हो रहा है...',
  },
  game: {
    title: 'स्लॉट मशीन',
    subtitle: 'सिद्ध रूप से निष्पक्ष खेल',
  },
  wallet: {
    connectPrompt: 'खेलना शुरू करने के लिए अपना वॉलेट कनेक्ट करें',
  },
  deposit: {
    title: 'CSPIN टोकन जमा करें',
    amount: 'जमा राशि (CSPIN)',
    success: 'जमा सफल!',
    error: 'जमा विफल',
    processing: 'प्रसंस्करण...',
  },
  withdraw: {
    title: 'CSPIN टोकन निकालें',
    description: 'निकासी अनुरोध के बाद व्यवस्थापक अनुमोदन आवश्यक है',
    available: 'उपलब्ध',
    success: 'निकासी अनुरोध पूर्ण!',
    error: 'निकासी अनुरोध विफल',
    processing: 'प्रसंस्करण...',
  },
  buttons: {
    deposit: 'जमा करें',
    withdraw: 'निकालें',
    spin: 'घुमाएं!',
    spinning: 'घूम रहा है...',
    max: 'अधिकतम',
    decline: 'छोड़ें',
    refresh: 'रीफ्रेश करें',
    process: 'प्रक्रिया',
    back: 'होम पर वापस जाएं',
    debugLog: 'डीबग लॉग देखें',
  },
  betting: {
    amount: 'दांव राशि',
    betRange: 'न्यूनतम दांव 10 CSPIN है',
  },
  errors: {
    insufficientBalance: 'अपर्याप्त शेष राशि!',
    generic: 'खेल विफल',
    invalidAmount: 'अमान्य राशि',
  },
  results: {
    jackpot: 'जैकपॉट!',
    win: 'जीत!',
    congratulations: 'बधाई हो!',
    betterLuck: 'अगली बार शुभकामनाएं!',
  },
  doubleup: {
    title: 'दोगुना चुनौती!',
    description: 'एक रंग चुनें',
    currentWin: 'वर्तमान जीत',
    red: 'लाल',
    blue: 'नीला',
    success: 'सफलता!',
    failure: 'विफल',
  },
  admin: {
    title: 'व्यवस्थापक - निकासी प्रबंधन',
    pending: 'लंबित निकासी',
    noWithdrawals: 'कोई लंबित निकासी नहीं',
    walletAddress: 'वॉलेट पता',
    amount: 'राशि',
    requestedAt: 'अनुरोध समय',
    accessDenied: 'पहुंच अस्वीकृत - व्यवस्थापक वॉलेट आवश्यक',
    connectAdmin: 'निकासी प्रबंधित करने के लिए व्यवस्थापक वॉलेट कनेक्ट करें',
  },
  footer: {
    copyright: 'कॉपीराइट',
    allRights: 'सर्वाधिकार सुरक्षित',
  },
  help: {
    nav: {
      slot: 'स्लॉट मशीन',
      help: 'सहायता केंद्र',
    },
    title: 'CandleSpinner त्वरित मार्गदर्शिका',
    intro: 'खेल शुरू करने से पहले इन चरणों का पालन करके TON वॉलेट तैयार करें और स्लॉट के नियम समझें।',
    wallet: {
      title: 'TON वॉलेट बनाएँ',
      description: 'Telegram के आधिकारिक TON Wallet बॉट को इंस्टॉल करें ताकि आप CSPIN टोकन सुरक्षित रख सकें और गेम की ट्रांज़ैक्शन को मंजूरी दे सकें।',
      steps: [
        'Telegram में आधिकारिक TON Wallet बॉट खोलें और Start दबाएँ।',
        'नया वॉलेट बनाएँ, रिकवरी फ़्रेज़ लिखकर ऑफ़लाइन सुरक्षित स्थान पर रखें।',
        'मज़बूत पासकोड सेट करें और हर साइनिंग अनुरोध देखने के लिए नोटिफिकेशन चालू रखें।',
      ],
      linkText: 'Telegram में TON Wallet खोलें',
    },
    token: {
      title: 'CSPIN टोकन खरीदें',
      description: 'CSPIN चाहिए? खरीद से जुड़े प्रश्न पूछने, OTC सौदे ढूँढने और तरलता अपडेट पाने के लिए आधिकारिक समुदाय से जुड़ें।',
      linkText: 'CSPIN का आधिकारिक Telegram समूह',
    },
    rules: {
      title: 'स्लॉट मशीन के नियम',
      items: [
        'तीन रीलें सात इमोजी प्रतीकों के साथ घूमती हैं और केवल मध्य पंक्ति गिनी जाती है।',
        'दो समान प्रतीक मिलते ही इनाम मिलता है, तीन समान होने पर जैकपॉट सक्रिय होता है।',
        'जैकपॉट पर इनाम 100 गुना होकर आपके क्रेडिट में जुड़ता है।',
      ],
    },
    doubleup: {
      title: 'डबल-अप नियम',
      items: [
        'डबल-अप विकल्प केवल तब दिखाई देता है जब स्पिन से CSPIN जीत मिलती है।',
        'लाल या नीला चुनें; दोनों के सफल होने की संभावना 50% है।',
        'जीतने पर ताज़ा इनाम दोगुना होता है, हारने पर वह इनाम वापस चला जाता है।',
      ],
    },
    gameplay: {
      title: 'कैसे खेलें',
      steps: [
        'ऊपरी पट्टी के बटन से अपना TON वॉलेट कनेक्ट करें।',
        'CSPIN टोकन जमा करें ताकि वे गेम क्रेडिट में बदल सकें।',
        'दांव की राशि चुनें और स्पिन बटन दबाएँ।',
        'परिणाम देखें और जीत मिलने पर डबल-अप आज़माने का निर्णय लें।',
        'CSPIN वापस भेजने के लिए जब चाहें निकासी टैब खोलें।',
      ],
    },
    extra: {
      title: 'उपयोगी सुझाव',
      items: [
        'नेटवर्क शुल्क के लिए थोड़ी सी TON राशि हमेशा रखें।',
        'जमा या निकासी असफल होने पर “डीबग लॉग देखें” खोलकर विवरण जाँचें।',
        'क्रेडिट सर्वर पर सुरक्षित रहते हैं, इसलिए पुनः डिप्लॉय करने पर वे रीसेट नहीं होते।',
        'जिम्मेदारी से खेलें और हर सत्र के लिए व्यक्तिगत सीमा पहले से तय करें।',
      ],
    },
  },
};

// 번역 맵
const translations: Record<SupportedLanguage, Translations> = {
  en,
  ko,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  vi,
  ja,
  ru,
  es,
  hi,
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
