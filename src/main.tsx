// Buffer 및 기타 Node.js 폴리필 로드 (가장 먼저 실행)
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './index.css';

// TON Connect Manifest URL
// ✅ Workers 직접 주소 사용 (CORS 헤더 적용 보장)
const manifestUrl = 'https://candlespinner-workers.x00518.workers.dev/tonconnect-manifest.json';

console.log('🔗 TON Connect Manifest URL:', manifestUrl);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
