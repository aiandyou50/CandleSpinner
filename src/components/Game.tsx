// src/components/Game.tsx
import React, { useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano, beginCell } from 'ton-core';
import { Buffer } from 'buffer';

// Buffer polyfill
window.Buffer = window.Buffer || Buffer;

const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd'; // From Memory

export const Game: React.FC = () => {
  const [credit, setCredit] = useState(1000);
  const [message, setMessage] = useState('게임을 시작하려면 지갑을 연결하세요.');
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [isProcessing, setIsProcessing] = useState(false);

  const [userCspinJettonWallet, setUserCspinJettonWallet] = useState('');

  const handleSpinClick = async () => {
    if (!wallet) {
      alert('스핀 전에 지갑을 연결해주세요!');
      return;
    }
    setIsProcessing(true);
    setMessage('스핀 중...');
    try {
      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: wallet.account.address })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '알 수 없는 오류');
      }

      const data = await response.json();
      setCredit(data.newCredit);
      setMessage(`결과: ${data.symbols.join(', ')} | 당첨금: ${data.winnings}`);

    } catch (error: any) {
      console.error('스핀 요청 실패:', error);
      setMessage(`오류: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeposit = async () => {
    if (!wallet) {
      alert('입금 전에 지갑을 연결해주세요!');
      return;
    }
    if (!userCspinJettonWallet) {
        alert('CSPIN 젯톤 지갑 주소를 입력해주세요.');
        return;
    }

    setIsProcessing(true);
    setMessage('입금 트랜잭션을 전송합니다...');

    try {
      const forwardPayload = beginCell().endCell();

      const body = beginCell()
        .storeUint(0x0f8a7ea5, 32) // op: transfer
        .storeUint(0, 64) // query_id
        .storeCoins(toNano('100')) // 100 CSPIN
        .storeAddress(Address.parse(GAME_WALLET_ADDRESS))
        .storeAddress(Address.parse(wallet.account.address))
        .storeBit(false) // no custom payload
        .storeCoins(toNano('0.05')) // forward_ton_amount
        .storeRef(forwardPayload)
        .endCell();

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: userCspinJettonWallet,
            amount: toNano('0.1').toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(tx);
      setMessage('입금 트랜잭션이 전송되었습니다. 확인 중...');

      const creditResponse = await fetch('/api/credit-deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              walletAddress: wallet.account.address,
              txHash: result.boc,
          })
      });

      if (!creditResponse.ok) {
          const errorData = await creditResponse.json();
          throw new Error(errorData.error || '크레딧 입금 API 호출 실패');
      }

      const creditData = await creditResponse.json();
      setCredit(creditData.newCredit);
      setMessage('입금이 확인되었습니다! 크레딧이 업데이트되었습니다.');

    } catch (e: any) {
      setMessage('입금 중 오류 발생: ' + e.message);
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <header className="absolute top-4 right-4">
        <TonConnectButton />
      </header>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">
          🎰 CandleSpinner
        </h1>

        {wallet && (
            <div className="text-center mb-4 text-sm">
                <p>연결된 지갑: {Address.parse(wallet.account.address).toString({ bounceable: false })}</p>
            </div>
        )}

        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <p className="text-lg">현재 크레딧: <span className="text-yellow-400 font-bold">{credit}</span></p>
          <p className="text-green-400">{message}</p>
        </div>

        <div className="bg-black/50 rounded-lg p-8 mb-6">
          <div className="flex justify-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-4xl">⭐</div>
            <div className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-4xl">🪐</div>
            <div className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-4xl">💎</div>
          </div>

          <div className="text-center space-y-4">
            <div className="space-x-4">
              <button
                onClick={handleSpinClick}
                disabled={isProcessing || !wallet}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl disabled:opacity-50"
              >
                🎰 SPIN!
              </button>
              <button
                onClick={handleDeposit}
                disabled={isProcessing || !wallet}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl disabled:opacity-50"
              >
                💸 100 CSPIN 입금
              </button>
            </div>
            <div className="text-xs text-gray-400">
                <p>입금을 위해 CSPIN 젯톤 지갑 주소를 입력하세요 (PoC)</p>
                <input
                    type="text"
                    value={userCspinJettonWallet}
                    onChange={(e) => setUserCspinJettonWallet(e.target.value)}
                    placeholder="Your CSPIN Jetton Wallet Address"
                    className="mt-1 w-full max-w-md p-2 rounded bg-gray-800 text-white border border-gray-600"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
