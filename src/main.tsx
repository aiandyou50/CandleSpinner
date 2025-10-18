// src/main.tsx
import { Buffer } from 'buffer';
// Ensure Buffer polyfill is available globally before any other code runs
window.Buffer = window.Buffer || Buffer;

import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = 'https://aiandyou.me/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode> Temporarily disabled for debugging
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
  // </React.StrictMode>
);
