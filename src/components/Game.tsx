import React, { useState } from 'react';
import { create } from 'zustand';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

// 간단한 Zustand 스토어 테스트
interface SimpleState {
  count: number;
  increment: () => void;
}

const useSimpleStore = create<SimpleState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

export const Game: React.FC = () => {
  const [credit, setCredit] = useState(1000);
  const [message, setMessage] = useState('게임이 로드되었습니다!');
  const { count, increment } = useSimpleStore();
  const connectedWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const handleSpinClick = async () => {
    setMessage('스핀을 실행 중...');
    try {
      // Try to call backend /api/spin
      const resp = await fetch('/api/spin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bet: 10 }) });
      if (resp.ok) {
        const j = await resp.json();
        // expect { win: number, symbols: string[] }
        const win = typeof j.win === 'number' ? j.win : 0;
        setCredit((c) => c - 10 + win);
        setMessage(`스핀 완료. 획득: ${win}`);
        return;
      }
      // fallback to mock if backend not available
      console.warn('/api/spin 호출 실패, 로컬 모킹 사용');
    } catch (e) {
      console.warn('스핀 호출 중 예외', e);
    }

    // Local mock: random small win
    const rnd = Math.random();
    const win = rnd > 0.95 ? 100 : rnd > 0.8 ? 20 : 0;
    setCredit((c) => c - 10 + win);
    setMessage(`(로컬) 스핀 완료. 획득: ${win}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">
          🎰 CandleSpinner
        </h1>

        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <p className="text-lg">현재 크레딧: <span className="text-yellow-400 font-bold">{credit}</span></p>
          <p className="text-green-400">{message}</p>
          <p className="text-blue-400">Zustand 카운트: {count}</p>
        </div>

        <div className="bg-black/50 rounded-lg p-8 mb-6">
          <div className="text-right mb-4">
            {connectedWallet ? (
              <div className="text-sm text-green-300">지갑 연결됨: {connectedWallet.account.address}</div>
            ) : (
              <div className="text-sm text-red-300">지갑 미연결</div>
            )}
          </div>
          <div className="flex justify-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-4xl">
              ⭐
            </div>
            <div className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-4xl">
              🪐
            </div>
            <div className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-4xl">
              �
            </div>
          </div>

          <div className="text-center space-x-4">
            <button
              onClick={handleSpinClick}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
            >
              🎰 SPIN!
            </button>
            <button
              onClick={increment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
            >
              카운트 증가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;