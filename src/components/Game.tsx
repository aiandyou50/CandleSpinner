// src/components/Game.tsx
import React, { useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano, beginCell } from 'ton-core';

const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';

export const Game: React.FC = () => {
  const [credit, setCredit] = useState(1000);
  const [message, setMessage] = useState('게임을 시작하려면 지갑을 연결하세요.');
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userCspinJettonWallet, setUserCspinJettonWallet] = useState('');
  const [showDoubleUp, setShowDoubleUp] = useState(false);
  const [lastWinnings, setLastWinnings] = useState(0);
  const [reelSymbols, setReelSymbols] = useState(['⭐', '🪐', '💎']);

  const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '알 수 없는 오류');
    }
    return response.json();
  };

  const handleSpinClick = async () => {
    if (!wallet) return alert('스핀 전에 지갑을 연결해주세요!');
    setIsProcessing(true);
    setShowDoubleUp(false);
    setMessage('스핀 중...');
    try {
      const data = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: wallet.account.address, betAmount: 10, clientSeed: Math.random().toString() })
      }).then(handleApiResponse);

      setReelSymbols(data.reels);
      setCredit(data.newCredit);
      if (data.winnings > 0) {
        setLastWinnings(data.winnings);
        setShowDoubleUp(true);
        setMessage(`당첨! 획득 상금: ${data.winnings}`);
      } else {
        setMessage('아쉽지만 다음 기회에...');
      }
    } catch (error: any) {
      setMessage(`오류: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeposit = async () => {
    if (!wallet || !userCspinJettonWallet) return alert('지갑을 연결하고 CSPIN 젯톤 지갑 주소를 입력하세요.');
    setIsProcessing(true);
    setMessage('입금 트랜잭션을 전송합니다...');
    try {
        const depositAmount = 100;
        const forwardPayload = beginCell().endCell();
        const body = beginCell()
            .storeUint(0x0f8a7ea5, 32)
            .storeUint(0, 64)
            .storeCoins(toNano(depositAmount))
            .storeAddress(Address.parse(GAME_WALLET_ADDRESS))
            .storeAddress(Address.parse(wallet.account.address))
            .storeBit(false)
            .storeCoins(toNano('0.05'))
            .storeRef(forwardPayload)
            .endCell();

        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{
                address: userCspinJettonWallet,
                amount: toNano('0.1').toString(),
                payload: body.toBoc().toString('base64'),
            }],
        });

        setMessage('입금 트랜잭션 확인 중...');
        const data = await fetch('/api/credit-deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: wallet.account.address, amount: depositAmount })
        }).then(handleApiResponse);

        setCredit(data.newCredit);
        setMessage('입금이 확인되었습니다!');
    } catch (e: any) {
      setMessage(`입금 중 오류 발생: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGambleClick = async (choice: 'red' | 'blue') => {
    if (!wallet) return;
    setIsProcessing(true);
    try {
        const data = await fetch('/api/double-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: wallet.account.address, choice, clientSeed: Math.random().toString() })
        }).then(handleApiResponse);

        setShowDoubleUp(false);
        setCredit(data.newCredit);
        if (data.won) {
            setMessage(`더블업 성공! 획득 상금: ${data.newWinnings}`);
        } else {
            setMessage('더블업 실패...');
        }
    } catch (error: any) {
        setMessage(`오류: ${error.message}`);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCollectClick = async () => {
    if (!wallet) return;
    setIsProcessing(true);
    try {
        const data = await fetch('/api/collect-winnings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: wallet.account.address })
        }).then(handleApiResponse);

        setShowDoubleUp(false);
        setCredit(data.newCredit);
        setMessage('상금을 수령했습니다!');
    } catch (error: any) {
        setMessage(`오류: ${error.message}`);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleWithdrawClick = async () => {
      if (!wallet) return;
      if (confirm(`정말 ${credit} CSPIN을 모두 인출하시겠습니까?`)) {
          setIsProcessing(true);
          try {
              const data = await fetch('/api/initiate-withdrawal', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ walletAddress: wallet.account.address })
              }).then(handleApiResponse);

              setCredit(0);
              setMessage(`인출 요청 완료: ${data.requestedAmount} CSPIN`);
          } catch (error: any) {
              setMessage(`인출 오류: ${error.message}`);
          } finally {
              setIsProcessing(false);
          }
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <header className="absolute top-4 right-4"><TonConnectButton /></header>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">🎰 CandleSpinner</h1>
        {wallet && <div className="text-center mb-4 text-sm"><p>연결된 지갑: {Address.parse(wallet.account.address).toString({ bounceable: false })}</p></div>}
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <p className="text-lg">현재 크레딧: <span className="text-yellow-400 font-bold">{credit}</span></p>
          <p className="text-green-400">{message}</p>
        </div>
        <div className="bg-black/50 rounded-lg p-8 mb-6">
          <div className="flex justify-center space-x-4 mb-6">
            {reelSymbols.map((symbol, index) => (
              <div key={index} className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-4xl">{symbol}</div>
            ))}
          </div>
          <div className="text-center space-y-4">
            {showDoubleUp ? (
              <div className="space-x-4">
                  <p className="mb-2">상금 {lastWinnings}을 걸고 더블업 하시겠습니까?</p>
                  <button onClick={() => handleGambleClick('red')} disabled={isProcessing} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded">RED</button>
                  <button onClick={() => handleGambleClick('blue')} disabled={isProcessing} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">BLUE</button>
                  <button onClick={handleCollectClick} disabled={isProcessing} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded">COLLECT</button>
              </div>
            ) : (
              <button onClick={handleSpinClick} disabled={isProcessing || !wallet} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl disabled:opacity-50">🎰 SPIN!</button>
            )}
            <hr className="my-4 border-gray-600"/>
            <div className="space-x-4">
                <button onClick={handleDeposit} disabled={isProcessing || !wallet} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">💸 100 CSPIN 입금</button>
                <button onClick={handleWithdrawClick} disabled={isProcessing || !wallet || credit <= 0} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">💰 전체 인출</button>
            </div>
            <div className="text-xs text-gray-400 pt-2">
                <p>입금을 위해 CSPIN 젯톤 지갑 주소를 입력하세요.</p>
                <input type="text" value={userCspinJettonWallet} onChange={(e) => setUserCspinJettonWallet(e.target.value)} placeholder="Your CSPIN Jetton Wallet Address" className="mt-1 w-full max-w-md p-2 rounded bg-gray-800 text-white border border-gray-600"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
