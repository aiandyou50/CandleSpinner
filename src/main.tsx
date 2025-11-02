// Buffer 및 기타 Node.js 폴리필 로드 (가장 먼저 실행)
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './styles/index.css';

// TON Connect Manifest URL
// ✅ 고정된 manifest URL 사용 (aiandyou.me)
const manifestUrl = 'https://aiandyou.me/tonconnect-manifest.json';

console.log('🔗 TON Connect Manifest URL:', manifestUrl);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
