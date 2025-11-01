/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TON_NETWORK: string;
  readonly VITE_CSPIN_TOKEN_ADDRESS: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
