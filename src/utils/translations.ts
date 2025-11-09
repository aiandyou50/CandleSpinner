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
  footer: {
    copyright: string;
    allRights: string;
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
  footer: {
    copyright: 'Copyright',
    allRights: 'All rights reserved',
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
  },
  betting: {
    amount: '베팅 금액',
    betRange: '최소 베팅액은 10 CSPIN입니다',
  },
  errors: {
    insufficientBalance: '잔액 부족!',
    generic: '게임 실행 실패',
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
  },
  betting: {
    amount: '投注金额',
    betRange: '最小投注额为10 CSPIN',
  },
  errors: {
    insufficientBalance: '余额不足！',
    generic: '游戏失败',
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
  },
  betting: {
    amount: '投注金額',
    betRange: '最小投注額為10 CSPIN',
  },
  errors: {
    insufficientBalance: '餘額不足！',
    generic: '遊戲失敗',
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
    back: 'Về trang chủ',
  },
  betting: {
    amount: 'Số tiền cược',
    betRange: 'Cược tối thiểu là 10 CSPIN',
  },
  errors: {
    insufficientBalance: 'Số dư không đủ!',
    generic: 'Trò chơi thất bại',
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
  },
  betting: {
    amount: 'ベット額',
    betRange: '最小ベット額は10 CSPIN',
  },
  errors: {
    insufficientBalance: '残高不足！',
    generic: 'ゲーム失敗',
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
  },
  betting: {
    amount: 'Сумма ставки',
    betRange: 'Минимальная ставка 10 CSPIN',
  },
  errors: {
    insufficientBalance: 'Недостаточно средств!',
    generic: 'Игра провалилась',
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
  },
  betting: {
    amount: 'Cantidad de apuesta',
    betRange: 'La apuesta mínima es 10 CSPIN',
  },
  errors: {
    insufficientBalance: '¡Saldo insuficiente!',
    generic: 'Juego fallido',
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
  },
  betting: {
    amount: 'दांव राशि',
    betRange: 'न्यूनतम दांव 10 CSPIN है',
  },
  errors: {
    insufficientBalance: 'अपर्याप्त शेष राशि!',
    generic: 'खेल विफल',
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
