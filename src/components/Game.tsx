// src/components/Game.tsx
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano, beginCell } from 'ton-core';
import { Header } from './Header';
import { ReelDisplay } from './ReelDisplay';
import { Controls } from './Controls';
import { useGameStore } from '../store';

const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';

export const Game: React.FC = () => {
  const {
    credit, message, isProcessing, userCspinJettonWallet,
    showDoubleUp, lastWinnings, reelSymbols,
    setCredit, setMessage, setIsProcessing, setUserCspinJettonWallet,
    startSpin, endSpin, setShowDoubleUp
  } = useGameStore();

  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '알 수 없는 오류');
    }
    return response.json();
  };

  const handleSpinClick = async () => {
    if (!wallet) return alert('스핀 전에 지갑을 연결해주세요!');
    startSpin();
    try {
      const data = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: wallet.account.address, betAmount: 10, clientSeed: Math.random().toString() })
      }).then(handleApiResponse);
      endSpin(data.newCredit, data.reels, data.winnings);
    } catch (error: any) {
      setMessage(`오류: ${error.message}`);
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
      <Header />
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <p className="text-lg">현재 크레딧: <span className="text-yellow-400 font-bold">{credit}</span></p>
          <p className="text-green-400">{message}</p>
        </div>
        <div className="bg-black/50 rounded-lg p-8 mb-6">
          <ReelDisplay symbols={reelSymbols} />
          <Controls
            isProcessing={isProcessing}
            wallet={wallet}
            credit={credit}
            showDoubleUp={showDoubleUp}
            lastWinnings={lastWinnings}
            userCspinJettonWallet={userCspinJettonWallet}
            setUserCspinJettonWallet={setUserCspinJettonWallet}
            handleSpinClick={handleSpinClick}
            handleDeposit={handleDeposit}
            handleWithdrawClick={handleWithdrawClick}
            handleGambleClick={handleGambleClick}
            handleCollectClick={handleCollectClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Game;
