// src/components/Header.tsx
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address } from 'ton-core';

export const Header = () => {
  const wallet = useTonWallet();

  return (
    <header className="flex justify-between items-center p-4">
      <h1 className="text-4xl font-bold text-yellow-400">🎰 CandleSpinner</h1>
      <div className="absolute top-4 right-4">
        <TonConnectButton />
      </div>
      {wallet && (
        <div className="absolute top-16 right-4 text-xs text-white">
          <p>Connected: {Address.parse(wallet.account.address).toString({ bounceable: false })}</p>
        </div>
      )}
    </header>
  );
};
