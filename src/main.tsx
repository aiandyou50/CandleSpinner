// src/main.tsx
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

import ReactDOM from 'react-dom/client';
import Game from './components/Game';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = 'https://aiandyou.me/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <Game />
  </TonConnectUIProvider>
);
