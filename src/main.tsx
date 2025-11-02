// Buffer 및 기타 Node.js 폴리필 로드 (가장 먼저 실행)
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './styles/index.css';

// TON Connect Manifest URL
// ✅ 배포 도메인 기준으로 동적 생성 (로컬에서는 배포 URL 사용)
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

const manifestUrl = isLocalhost
  ? 'https://candlespinner-workers.pages.dev/tonconnect-manifest.json'
  : `${window.location.origin}/tonconnect-manifest.json`;

console.log('🔗 TON Connect Manifest URL:', manifestUrl);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
