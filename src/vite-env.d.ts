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
      readonly VITE_SENTRY_DSN?: string;
      readonly VITE_TON_RPC_URL?: string;
      readonly MODE: 'development' | 'production';
    };
  }
}

export {};
