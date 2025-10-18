// src/App.tsx
import React from 'react';
import Game from './components/Game';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';
import { TON_CONNECT_MANIFEST_URL } from './constants';

function App() {
  return (
    <TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
      <div>
        <header style={{ position: 'absolute', top: 12, right: 12 }}>
          <TonConnectButton />
        </header>

        <main>
          <Game />
        </main>
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
