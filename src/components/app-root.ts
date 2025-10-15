import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { signal, effect } from '@preact/signals';
import { TonConnectUI, THEME } from '@tonconnect/ui';
import i18next from 'i18next';
import { Address, beginCell, toNano } from '@ton/core';

// === I18N Configuration ===
const resources = {
  en: {
    translation: {
      // Landing Page
      connect_wallet: "Connect Your TON Wallet",
      connect_desc: "Play the Galactic Casino with your own CSPIN tokens.",
      disconnect: "Disconnect",
      
      // Game View
      balance: "Balance: {{balance}} CSPIN",
      wallet_address: "Wallet",
      spin: "SPIN",
      bet_amount: "Bet Amount",
      
      // Footer
      version: "v4.0.0",
      app_title: "CandleSpinner: The Galactic Casino",
      
      // Language Selector
      language: "Language",
      
      // Status Messages
      connecting: "Connecting...",
      transaction_pending: "Transaction pending...",
      transaction_success: "Transaction successful!",
      transaction_failed: "Transaction failed",
      waiting_confirmation: "Waiting for transaction confirmation...",
      transaction_insufficient_ton: "Insufficient TON balance for transaction",
      approve_in_wallet: "Please approve transaction in your wallet",
      
      // Slot Machine
      slot_title: "Galactic Slot Machine",
      winning_lines: "20 Fixed Paylines",
      
      // Developer Mode
      dev_mode: "Developer Mode",
      dev_balance: "Virtual Balance (Dev Mode)"
    }
  },
  ko: {
    translation: {
      // Landing Page
      connect_wallet: "TON 지갑 연결",
      connect_desc: "자신의 CSPIN 토큰으로 은하 카지노를 플레이하세요.",
      disconnect: "연결 해제",
      
      // Game View
      balance: "잔액: {{balance}} CSPIN",
      wallet_address: "지갑",
      spin: "스핀",
      bet_amount: "베팅 금액",
      
      // Footer
      version: "v4.0.0",
      app_title: "CandleSpinner: 은하 카지노",
      
      // Language Selector
      language: "언어",
      
      // Status Messages
      connecting: "연결 중...",
      transaction_pending: "트랜잭션 처리 중...",
      transaction_success: "트랜잭션 성공!",
      transaction_failed: "트랜잭션 실패",
      waiting_confirmation: "트랜잭션 확인 대기 중...",
      transaction_insufficient_ton: "TON 잔액이 부족합니다",
      approve_in_wallet: "지갑에서 트랜잭션을 승인하세요",
      
      // Slot Machine
      slot_title: "은하 슬롯머신",
      winning_lines: "20개 고정 페이라인",
      
      // Developer Mode
      dev_mode: "개발자 모드",
      dev_balance: "가상 잔액 (개발 모드)"
    }
  },
  ja: {
    translation: {
      connect_wallet: "TONウォレットを接続",
      connect_desc: "自分のCSPINトークンでギャラクシーカジノをプレイしましょう。",
      disconnect: "切断",
      balance: "残高: {{balance}} CSPIN",
      wallet_address: "ウォレット",
      spin: "スピン",
      bet_amount: "ベット額",
      version: "v4.0.0",
      app_title: "CandleSpinner: ギャラクシーカジノ",
      language: "言語"
    }
  },
  "zh-CN": {
    translation: {
      connect_wallet: "连接您的TON钱包",
      connect_desc: "使用您自己的CSPIN代币玩银河赌场。",
      disconnect: "断开连接",
      balance: "余额: {{balance}} CSPIN",
      wallet_address: "钱包",
      spin: "旋转",
      bet_amount: "投注金额",
      version: "v4.0.0",
      app_title: "CandleSpinner: 银河赌场",
      language: "语言"
    }
  },
  "zh-TW": {
    translation: {
      connect_wallet: "連接您的TON錢包",
      connect_desc: "使用您自己的CSPIN代幣玩銀河賭場。",
      disconnect: "斷開連接",
      balance: "餘額: {{balance}} CSPIN",
      wallet_address: "錢包",
      spin: "旋轉",
      bet_amount: "投注金額",
      version: "v4.0.0",
      app_title: "CandleSpinner: 銀河賭場",
      language: "語言"
    }
  }
};

// Initialize i18next
i18next.init({
  lng: navigator.language.split('-')[0] || 'en',
  fallbackLng: 'en',
  resources,
  interpolation: { escapeValue: false }
});

// === Constants ===
const CSPIN_TOKEN_ADDRESS = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';
const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';

// === State Management (Signals) ===
const walletAddress = signal<string | null>(null);
const balance = signal<number>(1000); // Developer mode default balance
const currentView = signal<'landing' | 'game'>('landing');
const currentLanguage = signal<string>(i18next.language);
const isDevMode = signal<boolean>(import.meta.env.DEV === true);
const transactionStatus = signal<string>('');
const slotReels = signal<number[][]>([
  [0, 1, 2],
  [1, 2, 3],
  [2, 3, 4],
  [3, 4, 0],
  [4, 0, 1]
]);

// === TON Connect Initialization (will be done in component) ===
let tonConnectUI: TonConnectUI | null = null;

// === Helper Functions ===

/**
 * Generate Jetton transfer BOC for CSPIN token
 */
function generateJettonTransferBOC(
  amount: bigint,
  destinationAddress: string,
  forwardAmount: bigint = toNano('0.05')
): { boc: string; deepLink: string } {
  try {
    // Create the transfer message body
    const body = beginCell()
      .storeUint(0xf8a7ea5, 32) // Jetton transfer opcode
      .storeUint(0, 64) // query_id
      .storeCoins(amount) // amount
      .storeAddress(Address.parse(destinationAddress)) // destination
      .storeAddress(Address.parse(walletAddress.value!)) // response_destination
      .storeBit(0) // custom_payload (null)
      .storeCoins(forwardAmount) // forward_ton_amount
      .storeBit(0) // forward_payload (empty)
      .endCell();

    const boc = body.toBoc().toString('base64');
    
    // Create TON deep-link
    const deepLink = `ton://transfer/${GAME_WALLET_ADDRESS}?amount=${forwardAmount}&bin=${encodeURIComponent(boc)}`;

    // Developer mode logging
    if (isDevMode.value) {
      console.log('=== BOC Generation (Dev Mode) ===');
      console.log('Raw BOC (Uint8Array):', body.toBoc());
      console.log('Base64 BOC:', boc);
      console.log('Deep-link:', deepLink);
      console.log('Amount:', amount.toString());
      console.log('Destination:', destinationAddress);
      console.log('=================================');
    }

    return { boc, deepLink };
  } catch (error) {
    console.error('Failed to generate BOC:', error);
    throw error;
  }
}

/**
 * Commit spin to backend
 */
async function commitSpin(betAmount: number): Promise<string> {
  // TODO: Implement actual API call to /commitSpin
  // For now, return a mock commitment
  if (isDevMode.value) {
    console.log('DEV MODE: Committing spin with bet:', betAmount);
  }
  
  // Mock response
  return 'mock_commitment_' + Date.now();
}

/**
 * Reveal spin result from backend
 */
async function revealSpin(commitment: string): Promise<any> {
  // TODO: Implement actual API call to /revealSpin
  if (isDevMode.value) {
    console.log('DEV MODE: Revealing spin for commitment:', commitment);
  }
  
  // Mock response
  return {
    reels: [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 1], [5, 1, 2]],
    win: 100,
    lines: [1, 5, 12]
  };
}

/**
 * Detect available TonConnect APIs
 * Checks multiple possible TonConnect API locations for compatibility
 */
function detectTonConnect(): {
  available: boolean;
  api: any;
  type: string;
} {
  try {
    // Check for TonConnect UI instance (most common)
    if (tonConnectUI) {
      return { available: true, api: tonConnectUI, type: 'tonConnectUI' };
    }
    
    // Check for global window.tonConnectUI
    if (typeof window !== 'undefined' && (window as any).tonConnectUI) {
      return { available: true, api: (window as any).tonConnectUI, type: 'window.tonConnectUI' };
    }
    
    // Check for window.TonConnect
    if (typeof window !== 'undefined' && (window as any).TonConnect) {
      return { available: true, api: (window as any).TonConnect, type: 'window.TonConnect' };
    }
    
    return { available: false, api: null, type: 'none' };
  } catch (error) {
    console.error('Error detecting TonConnect:', error);
    return { available: false, api: null, type: 'none' };
  }
}

/**
 * Get TON balance for an address
 * Uses public API as fallback to toncenter
 */
async function getTonBalance(address: string): Promise<number> {
  try {
    // TODO: Implement proper TON balance check via toncenter or other API
    // For now, we'll use a simple fetch to toncenter API
    const response = await fetch(
      `https://toncenter.com/api/v2/getAddressBalance?address=${address}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }
    
    const data = await response.json();
    // Balance is returned in nanotons, convert to TON
    return parseInt(data.result || '0') / 1e9;
  } catch (error) {
    console.error('Failed to get TON balance:', error);
    // In dev mode or on error, return a safe default
    if (isDevMode.value) {
      console.log('DEV MODE: Returning mock balance of 10 TON');
      return 10;
    }
    // Return 0 on error to prevent transactions
    return 0;
  }
}

/**
 * Send transaction via TonConnect
 * Tries multiple API shapes for compatibility with different TonConnect versions
 */
async function sendViaTonConnect(boc: string): Promise<{
  success: boolean;
  txHash?: string;
  txId?: string;
  error?: string;
}> {
  const detection = detectTonConnect();
  
  if (!detection.available) {
    return { success: false, error: 'TonConnect not available' };
  }
  
  const api = detection.api;
  
  if (isDevMode.value) {
    console.log('=== TonConnect Send Attempt (Dev Mode) ===');
    console.log('API Type:', detection.type);
    console.log('BOC:', boc);
  }
  
  // Try different API shapes in sequence
  const attempts = [
    // Attempt 1: tonConnectUI.sendTransaction with boc
    async () => {
      if (api.sendTransaction) {
        const result = await api.sendTransaction({ boc });
        return { success: true, txHash: result?.txHash || result?.tx_hash, txId: result?.txId };
      }
      throw new Error('sendTransaction method not available');
    },
    
    // Attempt 2: tonConnectUI.connector.sendTransaction
    async () => {
      if (api.connector && api.connector.sendTransaction) {
        const result = await api.connector.sendTransaction({ boc });
        return { success: true, txHash: result?.txHash || result?.tx_hash, txId: result?.txId };
      }
      throw new Error('connector.sendTransaction not available');
    },
    
    // Attempt 3: tonConnectUI.connector.send with type:'boc'
    async () => {
      if (api.connector && api.connector.send) {
        const result = await api.connector.send({ type: 'boc', boc });
        return { success: true, txHash: result?.txHash || result?.tx_hash, txId: result?.txId };
      }
      throw new Error('connector.send not available');
    },
    
    // Attempt 4: tonConnectUI.send
    async () => {
      if (api.send) {
        const result = await api.send({ type: 'boc', boc });
        return { success: true, txHash: result?.txHash || result?.tx_hash, txId: result?.txId };
      }
      throw new Error('send method not available');
    },
    
    // Attempt 5: tonConnectUI.request
    async () => {
      if (api.request) {
        const result = await api.request('send', { boc });
        return { success: true, txHash: result?.txHash || result?.tx_hash, txId: result?.txId };
      }
      throw new Error('request method not available');
    }
  ];
  
  // Try each method in sequence until one succeeds
  for (let i = 0; i < attempts.length; i++) {
    try {
      const result = await attempts[i]();
      if (isDevMode.value) {
        console.log(`Attempt ${i + 1} succeeded:`, result);
      }
      return result;
    } catch (error) {
      if (isDevMode.value) {
        console.log(`Attempt ${i + 1} failed:`, error);
      }
      // Continue to next attempt
    }
  }
  
  // All attempts failed
  return { success: false, error: 'All TonConnect send attempts failed' };
}

/**
 * Poll for transaction confirmation
 * Stub implementation with backend fallback
 */
async function pollForConfirmation(txResult: { txHash?: string; txId?: string }): Promise<boolean> {
  const txIdentifier = txResult.txHash || txResult.txId;
  
  if (isDevMode.value) {
    console.log('=== Polling for Confirmation (Dev Mode) ===');
    console.log('TX Identifier:', txIdentifier);
  }
  
  // TODO: Implement actual backend API call to /api/tx-status
  // For now, we'll implement a stub with timeout-based demo logic
  
  const maxAttempts = 20; // 20 attempts * 3 seconds = 60 seconds max
  const pollInterval = 3000; // 3 seconds
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Try to call backend API
      // TODO: Replace with actual endpoint when available
      const response = await fetch('/api/tx-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: txIdentifier })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.confirmed) {
          if (isDevMode.value) {
            console.log('Transaction confirmed via backend API');
          }
          return true;
        }
      }
    } catch (error) {
      // Backend not available, use fallback demo logic
      if (isDevMode.value && attempt === 0) {
        console.log('Backend API not available, using demo fallback (12s timeout)');
      }
    }
    
    // Fallback: In dev mode, automatically confirm after 12 seconds (4 attempts * 3s)
    if (isDevMode.value && attempt >= 3) {
      console.log('DEV MODE: Auto-confirming transaction after timeout');
      return true;
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  if (isDevMode.value) {
    console.log('Transaction confirmation timeout');
  }
  
  // Timeout reached - assume success in dev mode, failure in production
  return isDevMode.value;
}

/**
 * Check if running in Telegram in-app browser
 */
function isTelegramInApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Check for Telegram WebView
  const isTelegram = userAgent.includes('telegram');
  
  // Check for Telegram WebApp API
  const hasTelegramWebApp = (window as any).Telegram && (window as any).Telegram.WebApp;
  
  return isTelegram || hasTelegramWebApp;
}

// === Lit Component ===
@customElement('app-root')
export class AppRoot extends LitElement {
  @state() private _currentView: 'landing' | 'game' = 'landing';
  @state() private _balance: number = 1000;
  @state() private _walletAddress: string | null = null;
  @state() private _language: string = 'en';
  @state() private _transactionStatus: string = '';
  @state() private _slotReels: number[][] = [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 0], [4, 0, 1]];
  @state() private _isSpinning: boolean = false;

  static override styles = css`
    :host {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --secondary: #8b5cf6;
      --bg: #0f0f1b;
      --card-bg: #1a1a2e;
      --card-border: #2d2d44;
      --text: #e2e8f0;
      --text-secondary: #94a3b8;
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
      
      display: block;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    header {
      text-align: center;
      padding: 2rem 0;
      border-bottom: 2px solid var(--card-border);
      margin-bottom: 2rem;
    }

    header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .language-selector {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .language-selector select {
      background: var(--card-bg);
      color: var(--text);
      border: 1px solid var(--card-border);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 2rem;
      margin: 1.5rem 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }

    .card h2 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
      color: var(--text);
    }

    .card p {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.875rem 2rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s;
      display: inline-block;
    }

    .btn:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 8px 12px -2px rgba(99, 102, 241, 0.4);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: var(--card-border);
      color: var(--text);
    }

    .btn-secondary:hover {
      background: #3d3d5c;
    }

    .wallet-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-top: 1.5rem;
      padding: 1rem;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 10px;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .wallet-address {
      font-family: 'Courier New', monospace;
      color: var(--primary);
      font-weight: 600;
    }

    .balance-display {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--success);
      margin-bottom: 1rem;
      text-align: center;
    }

    .dev-mode-badge {
      display: inline-block;
      background: var(--warning);
      color: #000;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-left: 0.5rem;
    }

    .slot-machine {
      margin: 2rem 0;
      padding: 2rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      border-radius: 16px;
      border: 2px solid var(--primary);
    }

    .slot-title {
      text-align: center;
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--primary);
    }

    .reels-container {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      margin: 2rem 0;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .reel {
      background: var(--card-bg);
      border: 2px solid var(--card-border);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      aspect-ratio: 1 / 1.5;
    }

    .reel.spinning {
      animation: spin 0.5s linear infinite;
    }

    @keyframes spin {
      0% { transform: translateY(0); }
      100% { transform: translateY(-100%); }
    }

    .symbol {
      background: var(--primary);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      flex: 1;
    }

    .spin-controls {
      text-align: center;
      margin-top: 2rem;
    }

    .status-message {
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      font-weight: 600;
    }

    .status-message.success {
      background: rgba(16, 185, 129, 0.2);
      color: var(--success);
      border: 1px solid var(--success);
    }

    .status-message.error {
      background: rgba(239, 68, 68, 0.2);
      color: var(--error);
      border: 1px solid var(--error);
    }

    .status-message.info {
      background: rgba(99, 102, 241, 0.2);
      color: var(--primary);
      border: 1px solid var(--primary);
    }

    footer {
      text-align: center;
      padding: 2rem 0;
      border-top: 2px solid var(--card-border);
      margin-top: 3rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    footer .version {
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    #ton-connect-button {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }

    .hidden {
      display: none;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      header h1 {
        font-size: 2rem;
      }

      .reels-container {
        gap: 0.5rem;
      }

      .symbol {
        font-size: 1.5rem;
      }
    }
  `;

  constructor() {
    super();
    
    // Subscribe to signal changes
    effect(() => {
      this._currentView = currentView.value;
      this.requestUpdate();
    });

    effect(() => {
      this._balance = balance.value;
      this.requestUpdate();
    });

    effect(() => {
      this._walletAddress = walletAddress.value;
      this.requestUpdate();
    });

    effect(() => {
      this._language = currentLanguage.value;
      this.requestUpdate();
    });

    effect(() => {
      this._transactionStatus = transactionStatus.value;
      this.requestUpdate();
    });

    effect(() => {
      this._slotReels = slotReels.value;
      this.requestUpdate();
    });
  }

  override connectedCallback() {
    super.connectedCallback();
    
    // Update language change handler
    i18next.on('languageChanged', () => {
      this.requestUpdate();
    });
  }

  override firstUpdated() {
    // Initialize TonConnect UI
    tonConnectUI = new TonConnectUI({
      manifestUrl: 'https://aiandyou.me/tonconnect-manifest.json',
      uiPreferences: {
        theme: THEME.DARK
      }
    });

    // Listen to wallet status changes
    tonConnectUI.onStatusChange(wallet => {
      if (wallet) {
        walletAddress.value = wallet.account.address;
        currentView.value = 'game';
        console.log('Wallet connected:', wallet.account.address);
      } else {
        walletAddress.value = null;
        currentView.value = 'landing';
        console.log('Wallet disconnected');
      }
    });
  }

  private handleLanguageChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const lang = select.value;
    currentLanguage.value = lang;
    i18next.changeLanguage(lang);
  }

  private async handleSpin() {
    if (this._isSpinning) return;
    
    const betAmount = 10; // Default bet amount
    
    if (!isDevMode.value && this._balance < betAmount) {
      transactionStatus.value = 'Insufficient balance';
      return;
    }

    try {
      this._isSpinning = true;
      transactionStatus.value = i18next.t('transaction_pending');
      
      // Step 1: Commit spin to get commitment
      const commitment = await commitSpin(betAmount);
      
      if (!isDevMode.value) {
        // Step 2: Generate Jetton transfer BOC
        const { boc, deepLink } = generateJettonTransferBOC(
          toNano(betAmount.toString()),
          GAME_WALLET_ADDRESS
        );
        
        // Step 3: Check wallet balance
        if (this._walletAddress) {
          const tonBalance = await getTonBalance(this._walletAddress);
          if (isDevMode.value) {
            console.log('TON Balance:', tonBalance);
          }
          
          // Need at least 0.1 TON for transaction fees
          if (tonBalance < 0.1) {
            transactionStatus.value = i18next.t('transaction_insufficient_ton');
            this._isSpinning = false;
            setTimeout(() => {
              transactionStatus.value = '';
            }, 5000);
            return;
          }
        }
        
        // Step 4: Attempt TonConnect send first
        const tonConnectResult = await sendViaTonConnect(boc);
        
        if (tonConnectResult.success) {
          // TonConnect succeeded
          if (isDevMode.value) {
            console.log('=== TonConnect Send Successful ===');
            console.log('TX Hash/ID:', tonConnectResult.txHash || tonConnectResult.txId);
          }
          
          transactionStatus.value = i18next.t('waiting_confirmation');
          
          // Step 5: Poll for confirmation
          const confirmed = await pollForConfirmation(tonConnectResult);
          
          if (confirmed) {
            // Step 6: Reveal spin after confirmation
            const result = await revealSpin(commitment);
            slotReels.value = result.reels;
            
            // Update balance
            if (result.win > 0) {
              balance.value += result.win;
              transactionStatus.value = `🎉 ${i18next.t('transaction_success')} Won ${result.win} CSPIN!`;
            } else {
              balance.value -= betAmount;
              transactionStatus.value = 'Better luck next time!';
            }
          } else {
            transactionStatus.value = i18next.t('transaction_failed') + ' (confirmation timeout)';
          }
        } else {
          // TonConnect not available or failed, fallback to Telegram/deep-link
          if (isDevMode.value) {
            console.log('=== TonConnect Failed, Using Fallback ===');
            console.log('Error:', tonConnectResult.error);
          }
          
          // Check if we're in Telegram in-app browser
          if (isTelegramInApp()) {
            // Try to use Telegram WebApp API to open link
            try {
              const telegram = (window as any).Telegram;
              if (telegram && telegram.WebApp && telegram.WebApp.openLink) {
                telegram.WebApp.openLink(deepLink);
                transactionStatus.value = i18next.t('approve_in_wallet');
              } else {
                // Fallback to regular deep-link
                window.location.href = deepLink;
                transactionStatus.value = i18next.t('approve_in_wallet');
              }
            } catch (error) {
              console.error('Telegram WebApp error:', error);
              window.location.href = deepLink;
              transactionStatus.value = i18next.t('approve_in_wallet');
            }
          } else {
            // Not in Telegram, use regular deep-link
            window.location.href = deepLink;
            transactionStatus.value = i18next.t('approve_in_wallet');
          }
        }
      } else {
        // Developer mode: simulate spin without actual transaction
        console.log('DEV MODE: Simulating spin without actual transaction');
        
        // Animate reels
        this.animateReels();
        
        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reveal result
        const result = await revealSpin(commitment);
        slotReels.value = result.reels;
        
        // Update balance
        if (result.win > 0) {
          balance.value += result.win;
          transactionStatus.value = `🎉 ${i18next.t('transaction_success')} Won ${result.win} CSPIN!`;
        } else {
          balance.value -= betAmount;
          transactionStatus.value = 'Better luck next time!';
        }
      }
      
    } catch (error) {
      console.error('Spin error:', error);
      transactionStatus.value = i18next.t('transaction_failed');
    } finally {
      this._isSpinning = false;
      
      // Clear status after 5 seconds
      setTimeout(() => {
        transactionStatus.value = '';
      }, 5000);
    }
  }

  private animateReels() {
    // Simple animation: randomize symbols during spin
    const symbols = ['🕯️', '🎰', '💎', '⭐', '🍀', '🎲'];
    const intervalId = setInterval(() => {
      slotReels.value = slotReels.value.map(reel => 
        reel.map(() => Math.floor(Math.random() * symbols.length))
      );
    }, 100);

    setTimeout(() => clearInterval(intervalId), 2000);
  }

  private handleDisconnect() {
    if (tonConnectUI) {
      tonConnectUI.disconnect();
    }
  }

  override render() {
    return html`
      <div class="container">
        <div class="language-selector">
          <select @change=${this.handleLanguageChange} .value=${this._language}>
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
          </select>
        </div>

        <header>
          <h1>🕯️ CandleSpinner</h1>
          <div style="color: var(--text-secondary);">${i18next.t('app_title')}</div>
          ${isDevMode.value ? html`<span class="dev-mode-badge">${i18next.t('dev_mode')}</span>` : ''}
        </header>

        ${this._currentView === 'landing' 
          ? this.renderLanding() 
          : this.renderGame()}

        <footer>
          <div class="version">${i18next.t('version')}</div>
          <div>${i18next.t('app_title')}</div>
          <div style="margin-top: 0.5rem; font-size: 0.8rem;">
            Powered by TON Blockchain
          </div>
        </footer>
      </div>
    `;
  }

  private renderLanding() {
    return html`
      <div class="card">
        <h2>${i18next.t('connect_wallet')}</h2>
        <p>${i18next.t('connect_desc')}</p>
        <div style="text-align: center; margin-top: 2rem;">
          <button class="btn" @click=${this.handleConnect}>
            ${i18next.t('connect_wallet')}
          </button>
        </div>
      </div>
    `;
  }

  private async handleConnect() {
    if (tonConnectUI) {
      try {
        // In dev mode, simulate connection for demo purposes
        if (isDevMode.value) {
          console.log('DEV MODE: Simulating wallet connection');
          walletAddress.value = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';
          currentView.value = 'game';
        } else {
          await tonConnectUI.openModal();
        }
      } catch (error) {
        console.error('Failed to open wallet modal:', error);
      }
    }
  }

  private renderGame() {
    const symbols = ['🕯️', '🎰', '💎', '⭐', '🍀'];
    
    return html`
      <div class="card">
        <div class="balance-display">
          ${isDevMode.value ? i18next.t('dev_balance') : i18next.t('balance', { balance: this._balance })}
        </div>

        <div class="slot-machine">
          <div class="slot-title">${i18next.t('slot_title')}</div>
          <div style="text-align: center; color: var(--text-secondary); margin-bottom: 1rem;">
            ${i18next.t('winning_lines')}
          </div>

          <div class="reels-container">
            ${this._slotReels.map((reel, reelIndex) => html`
              <div class="reel ${this._isSpinning ? 'spinning' : ''}">
                ${reel.map((symbolIndex) => html`
                  <div class="symbol">${symbols[symbolIndex % symbols.length]}</div>
                `)}
              </div>
            `)}
          </div>

          <div class="spin-controls">
            <button 
              class="btn" 
              @click=${this.handleSpin}
              ?disabled=${this._isSpinning}
            >
              ${this._isSpinning ? '⏳ Spinning...' : `${i18next.t('spin')} (10 CSPIN)`}
            </button>
          </div>

          ${this._transactionStatus ? html`
            <div class="status-message info">
              ${this._transactionStatus}
            </div>
          ` : ''}
        </div>

        ${isDevMode.value ? this.renderDebugPanel() : ''}

        <div class="wallet-info">
          <div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">
              ${i18next.t('wallet_address')}
            </div>
            <div class="wallet-address">
              ${this._walletAddress ? 
                `${this._walletAddress.substring(0, 6)}...${this._walletAddress.slice(-4)}` : 
                'Not connected'}
            </div>
          </div>
          <button class="btn btn-secondary" @click=${this.handleDisconnect}>
            ${i18next.t('disconnect')}
          </button>
        </div>
      </div>
    `;
  }

  private renderDebugPanel() {
    const detection = detectTonConnect();
    return html`
      <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255, 152, 0, 0.1); border-radius: 8px; border: 1px solid var(--warning);">
        <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--warning);">🔧 Debug Panel (Dev Mode Only)</div>
        <div style="font-size: 0.85rem; font-family: monospace; color: var(--text-secondary);">
          <div>TonConnect Available: ${detection.available ? '✅' : '❌'}</div>
          <div>TonConnect Type: ${detection.type}</div>
          <div>Telegram In-App: ${isTelegramInApp() ? '✅' : '❌'}</div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
