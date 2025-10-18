import React, { useState, useEffect } from 'react';
import { useTonConnect } from '../hooks/useTonConnect';
import { create } from 'zustand';

// Zustand 스토어
interface GameState {
  credit: number;
  betAmount: number;
  reelSymbols: string[];
  lastWinnings: number;
  isSpinning: boolean;
  showDoubleUp: boolean;
  pendingWinnings: number;
  setCredit: (credit: number) => void;
  setBetAmount: (amount: number) => void;
  setReelSymbols: (symbols: string[]) => void;
  setLastWinnings: (winnings: number) => void;
  setIsSpinning: (spinning: boolean) => void;
  setShowDoubleUp: (show: boolean) => void;
  setPendingWinnings: (winnings: number) => void;
}

const useGameStore = create<GameState>((set) => ({
  credit: 0,
  betAmount: 100,
  reelSymbols: ['⭐', '⭐', '⭐'],
  lastWinnings: 0,
  isSpinning: false,
  showDoubleUp: false,
  pendingWinnings: 0,
  setCredit: (credit) => set({ credit }),
  setBetAmount: (betAmount) => set({ betAmount }),
  setReelSymbols: (reelSymbols) => set({ reelSymbols }),
  setLastWinnings: (lastWinnings) => set({ lastWinnings }),
  setIsSpinning: (isSpinning) => set({ isSpinning }),
  setShowDoubleUp: (showDoubleUp) => set({ showDoubleUp }),
  setPendingWinnings: (pendingWinnings) => set({ pendingWinnings }),
}));

export const Game: React.FC = () => {
  const { connectedWallet, tonConnectUI } = useTonConnect();
  const {
    credit,
    betAmount,
    reelSymbols,
    lastWinnings,
    isSpinning,
    showDoubleUp,
    pendingWinnings,
    setCredit,
    setBetAmount,
    setReelSymbols,
    setLastWinnings,
    setIsSpinning,
    setShowDoubleUp,
    setPendingWinnings,
  } = useGameStore();

  const [clientSeed, setClientSeed] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 클라이언트 시드 생성
  useEffect(() => {
    setClientSeed(Math.random().toString(36).substring(2, 15));
  }, []);

  // CSPIN 입금 처리 (PoC 로직 통합)
  const handleDepositSuccess = async (depositAmount: number) => {
    if (!connectedWallet) {
      setError('지갑이 연결되지 않았습니다.');
      return;
    }

    try {
      setError(null);
      alert('온체인 입금 확인. 서버에 크레딧을 등록합니다...');

      const response = await fetch('/api/credit-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedWallet.account.address,
          amount: depositAmount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCredit(data.newCredit);
        alert('크레딧 충전 완료!');
      } else {
        setError(data.error || '크레딧 충전 실패');
      }
    } catch (err) {
      setError('크레딧 충전 중 오류가 발생했습니다.');
      console.error('Deposit error:', err);
    }
  };

  // 스핀 처리
  const handleSpinClick = async () => {
    if (!connectedWallet) {
      setError('지갑을 연결해주세요.');
      return;
    }

    if (credit < betAmount) {
      setError('크레딧이 부족합니다.');
      return;
    }

    if (showDoubleUp) {
      setError('미니게임 결과를 먼저 처리해야 합니다.');
      return;
    }

    try {
      setError(null);
      setIsSpinning(true);
      setLastWinnings(0);

      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedWallet.account.address,
          betAmount,
          clientSeed,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setIsSpinning(false);
        return;
      }

      // 릴 애니메이션 (간단한 시뮬레이션)
      setReelSymbols(data.reels);
      setCredit(data.newCredit);

      if (data.winnings > 0) {
        setShowDoubleUp(true);
        setPendingWinnings(data.winnings);
        setLastWinnings(data.winnings);

        if (data.isJackpot) {
          alert(`🎉 JACKPOT! ${data.winnings} 크레딧 당첨!`);
        } else {
          alert(`${data.winnings} 크레딧 당첨! 더블업 기회가 있습니다.`);
        }
      } else {
        alert('아쉽습니다. 다음 기회를 노려보세요!');
      }

      // 새 클라이언트 시드 생성
      setClientSeed(Math.random().toString(36).substring(2, 15));
      setIsSpinning(false);

    } catch (err) {
      setError('스핀 중 오류가 발생했습니다.');
      setIsSpinning(false);
      console.error('Spin error:', err);
    }
  };

  // 더블업 처리
  const handleDoubleUp = async (choice: 'red' | 'blue') => {
    try {
      setError(null);

      const response = await fetch('/api/double-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedWallet!.account.address,
          choice,
          clientSeed,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.won) {
        setCredit(credit + data.newWinnings);
        alert(`🎉 성공! ${data.newWinnings} 크레딧을 추가로 얻었습니다!`);
      } else {
        alert('아쉽습니다. 상금이 소멸되었습니다.');
      }

      setShowDoubleUp(false);
      setPendingWinnings(0);
      setLastWinnings(0);
      setClientSeed(Math.random().toString(36).substring(2, 15));

    } catch (err) {
      setError('더블업 중 오류가 발생했습니다.');
      console.error('Double up error:', err);
    }
  };

  // 상금 수령
  const handleCollectWinnings = async () => {
    try {
      setError(null);

      const response = await fetch('/api/collect-winnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedWallet!.account.address,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setCredit(data.newCredit);
      setShowDoubleUp(false);
      setPendingWinnings(0);
      setLastWinnings(0);
      alert(`${pendingWinnings} 크레딧이 계정에 추가되었습니다.`);

    } catch (err) {
      setError('상금 수령 중 오류가 발생했습니다.');
      console.error('Collect winnings error:', err);
    }
  };

  // 인출 처리
  const handleWithdraw = async () => {
    if (credit <= 0) {
      setError('인출할 크레딧이 없습니다.');
      return;
    }

    try {
      setError(null);

      const response = await fetch('/api/initiate-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedWallet!.account.address,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setCredit(0);
      alert(`${data.requestedAmount} 크레딧 인출 요청이 접수되었습니다.`);

    } catch (err) {
      setError('인출 요청 중 오류가 발생했습니다.');
      console.error('Withdraw error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">
          🎰 CandleSpinner
        </h1>

        {/* 지갑 연결 상태 */}
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">지갑 상태</h2>
          {connectedWallet ? (
            <p className="text-green-400">
              ✅ 연결됨: {connectedWallet.account.address.slice(0, 8)}...
            </p>
          ) : (
            <p className="text-red-400">❌ 지갑 연결 필요</p>
          )}
        </div>

        {/* 크레딧 정보 */}
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg">현재 크레딧: <span className="text-yellow-400 font-bold">{credit}</span></p>
              {lastWinnings > 0 && (
                <p className="text-green-400">최근 당첨: {lastWinnings} 크레딧</p>
              )}
            </div>
            <div className="text-right">
              <label className="block text-sm mb-1">베팅 금액</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bg-gray-800 text-white rounded px-3 py-1 w-24"
                min="10"
                max={credit}
              />
            </div>
          </div>
        </div>

        {/* 슬롯 머신 */}
        <div className="bg-black/50 rounded-lg p-8 mb-6">
          <div className="flex justify-center space-x-4 mb-6">
            {reelSymbols.map((symbol, index) => (
              <div
                key={index}
                className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-4xl animate-pulse"
              >
                {symbol}
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleSpinClick}
              disabled={isSpinning || !connectedWallet || credit < betAmount || showDoubleUp}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
            >
              {isSpinning ? '🎰 SPINNING...' : '🎰 SPIN!'}
            </button>
          </div>
        </div>

        {/* 미니게임 (더블업) */}
        {showDoubleUp && (
          <div className="bg-black/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-center">
              🎲 더블업 기회! ({pendingWinnings} 크레딧)
            </h3>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => handleDoubleUp('red')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
              >
                🔴 RED
              </button>
              <button
                onClick={() => handleDoubleUp('blue')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
              >
                🔵 BLUE
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={handleCollectWinnings}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                💰 상금 수령 ({pendingWinnings} 크레딧)
              </button>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleDepositSuccess(1000)} // 테스트용 1000 크레딧
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg"
            disabled={!connectedWallet}
          >
            💳 CSPIN 입금 (테스트)
          </button>
          <button
            onClick={handleWithdraw}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg"
            disabled={!connectedWallet || credit <= 0}
          >
            💸 인출 요청
          </button>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-300">❌ {error}</p>
          </div>
        )}

        {/* 게임 규칙 */}
        <div className="bg-black/20 rounded-lg p-4 text-sm">
          <h3 className="font-semibold mb-2">🎮 게임 규칙</h3>
          <ul className="space-y-1 text-gray-300">
            <li>• 각 심볼의 배당률이 적용됩니다</li>
            <li>• 3개 동일 심볼 = 잭팟 (100배 보너스)</li>
            <li>• 당첨 시 더블업 기회가 주어집니다</li>
            <li>• CSPIN 토큰으로 크레딧을 충전할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Game;