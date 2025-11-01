/// <reference types="vite/client" />

declare module "*.css" {
  const content: string;
  export default content;
}

// TMA 타입 선언
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }

  interface ImportMeta {
    readonly env: {
      // Blockchain Configuration
      readonly VITE_GAME_WALLET_ADDRESS?: string;
      readonly VITE_CSPIN_TOKEN_ADDRESS?: string;
      readonly VITE_CSPIN_JETTON_WALLET?: string;

      // TonConnect Configuration
      readonly VITE_TON_CONNECT_MANIFEST_URL?: string;

      // TON RPC Configuration
      readonly VITE_TON_RPC_URL?: string;
      readonly VITE_TON_API_KEY?: string;

      // Monitoring
      readonly VITE_SENTRY_DSN?: string;

      // Feature Flags
      readonly VITE_IS_TESTNET?: string;
      readonly VITE_DEBUG_MODE?: string;

      // Built-in
      readonly MODE: 'development' | 'production';
    };
  }
}

export {};
