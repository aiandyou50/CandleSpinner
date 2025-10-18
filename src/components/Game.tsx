import React, { useState } from 'react';
import { create } from 'zustand';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import ReelPixi from './ReelPixi';

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
  const [spinning, setSpinning] = useState(false);
  const { count, increment } = useSimpleStore();
  const connectedWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [reels, setReels] = useState<string[]>(['⭐','🪐','🌠']);
  const [showReel, setShowReel] = useState<boolean>(false);

  const handleSpinClick = async () => {
  setMessage('스핀을 실행 중...');
  setSpinning(true);
    try {
      // Try to call backend /api/spin - include wallet address and a client seed for provably fair
      const clientSeed = Math.random().toString(36).slice(2);
      const payload = { walletAddress: connectedWallet?.account.address || 'anonymous', betAmount: 10, clientSeed };
      const resp = await fetch('/api/spin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (resp.ok) {
        const j = await resp.json();
        // expect { win: number, symbols: string[] }
        const win = typeof j.winnings === 'number' ? j.winnings : 0;
        setCredit((c) => j.newCredit ?? (c - 10 + win));
        setMessage(`스핀 완료. 획득: ${win}`);
        // update reels for visual
        if (j.reels) setReels(j.reels);
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
    // set mock reels
    const mockReels = [rnd > 0.8 ? '💎' : '⭐', rnd > 0.5 ? '🪐' : '⭐', rnd > 0.95 ? '👑' : '🌠'];
    setReels(mockReels);
    // stop spinning after short delay to simulate reel animation
    setTimeout(() => {
      setSpinning(false);
      setMessage(`(로컬) 스핀 완료. 획득: ${win}`);
    }, 900);
  };

  const handleDepositSuccess = async (txBoc: string, senderAddress: string) => {
    // Called after successful on-chain deposit in PoC flow.
    // Notify backend to credit off-chain balance.
    try {
      await fetch('/api/credit-deposit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ txBoc, senderAddress }) });
      setMessage('입금이 등록되었습니다. 서버에서 크레딧을 반영합니다.');
    } catch (e) {
      console.warn('credit-deposit 호출 실패', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      {/* Inline keyframes for simple slow spin and delay helpers */}
      <style>{`
        @keyframes slow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: slow-spin 0.9s linear; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">
          🚀 Candle Spinner - Space Slot Machine
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
            {/** Simple reel boxes with CSS animation when spinning */}
            <div className="w-60 h-20 flex items-center justify-center">
              {showReel ? <ReelPixi spinning={spinning} reels={reels} /> : <div className="text-sm text-gray-300">Reel disabled for debugging. Toggle below to enable.</div>}
            </div>
          </div>

          {/** Visual test checklist */}
          <div className="bg-black/20 rounded-md p-4 mb-4">
            <h3 className="text-yellow-300 font-semibold mb-2">MVP 테스트 체크리스트</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-200">
              <li>✅ 지갑 연결 UI 표시</li>
              <li>✅ 지갑 연결/연결 해제</li>
              <li>✅ 크레딧 표시 및 갱신</li>
              <li>✅ SPIN 클릭 시 서버 호출(또는 모킹)</li>
              <li>✅ 릴 애니메이션(간단 모킹)</li>
              <li>⚠️ PoC CSPIN 입금 로직 통합(요청 시 통합됨)</li>
              <li>⚠️ `/api/spin` 서버 로직 구현 필요(현: 프론트 모킹 가능)</li>
              <li>⚠️ Provably Fair 완전 구현(클라이언트-서버 시드 교환 필요)</li>
            </ul>
            <div className="mt-3 flex space-x-2">
              <button onClick={async () => {
                // Wallet connect test
                if (connectedWallet) alert('지갑이 연결되어 있습니다: ' + connectedWallet.account.address);
                else alert('지갑 미연결 - 우상단 TonConnect 버튼을 눌러 연결하세요');
              }} className="bg-indigo-600 px-3 py-1 rounded text-sm">지갑 연결 테스트</button>
              <button onClick={async () => {
                // Spin API test
                try {
                  const resp = await fetch('/api/spin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ walletAddress: connectedWallet?.account.address || 'test', betAmount: 1, clientSeed: 'test-seed' }) });
                  const j = await resp.json().catch(() => null);
                  alert('Spin API 응답: ' + JSON.stringify(j));
                } catch (e) {
                  alert('Spin API 호출 실패: ' + String(e));
                }
              }} className="bg-indigo-600 px-3 py-1 rounded text-sm">Spin API 테스트</button>
              <button onClick={() => setShowReel(s => !s)} className="bg-gray-600 px-3 py-1 rounded text-sm">{showReel ? '릴 숨기기' : '릴 보이기'}</button>
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
              onClick={async () => {
                if (!tonConnectUI || !connectedWallet) {
                  alert('지갑을 연결하세요');
                  return;
                }
                // sample deposit tx using tonConnectUI - this is a simplified demo
                try {
                  const tx = { validUntil: Math.floor(Date.now() / 1000) + 600, messages: [{ address: 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV', amount: '1000000' }] };
                  const result: any = await tonConnectUI.sendTransaction(tx);
                  // call backend to register deposit if boc available
                  if (result && result.boc) {
                    await handleDepositSuccess(result.boc, connectedWallet.account.address);
                  } else {
                    setMessage('트랜잭션이 전송되었으나 결과 boc를 찾을 수 없습니다.');
                  }
                } catch (e) {
                  console.warn('deposit failed', e);
                  alert('입금 트랜잭션 실패: ' + String(e));
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-sm"
            >
              PoC 입금 테스트
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