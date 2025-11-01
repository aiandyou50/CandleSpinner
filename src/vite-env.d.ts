/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TON_NETWORK: string;
  readonly VITE_CSPIN_TOKEN_ADDRESS: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_GAME_WALLET_ADDRESS: string;
  readonly VITE_CSPIN_JETTON_WALLET: string;
  readonly VITE_TON_CONNECT_MANIFEST_URL: string;
  readonly VITE_TON_RPC_URL: string;
  readonly VITE_TON_API_KEY: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_IS_TESTNET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
