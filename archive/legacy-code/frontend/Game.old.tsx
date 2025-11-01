import React, { useState } from 'react';
import { create } from 'zustand';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Address, toNano, beginCell } from '@ton/core';
import { sha256 } from '@ton/crypto';
import { useRpc } from '../hooks/useRpc';
import ReelPixi from './ReelPixi';
import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS } from '../constants';

interface GameStore {
  userCredit: number;
  betAmount: number;
  reelSymbols: string[];
  lastWinnings: number;
  isSpinning: boolean;
  showDoubleUp: boolean;
  isDeveloperMode: boolean;
  isTMAMode: boolean;
  setUserCredit: (credit: number) => void;
  setBetAmount: (amount: number) => void;
  setReelSymbols: (symbols: string[]) => void;
  setLastWinnings: (winnings: number) => void;
  setIsSpinning: (spinning: boolean) => void;
  setShowDoubleUp: (show: boolean) => void;
  setIsDeveloperMode: (mode: boolean) => void;
  setIsTMAMode: (mode: boolean) => void;
}

const useGameStore = create<GameStore>((set) => ({
  userCredit: 1000,
  betAmount: 100,
  reelSymbols: ['⭐','🪐','🌠'],
  lastWinnings: 0,
  isSpinning: false,
  showDoubleUp: false,
  isDeveloperMode: false,
  isTMAMode: false,
  setUserCredit: (credit) => set({ userCredit: credit }),
  setBetAmount: (amount) => set({ betAmount: amount }),
  setReelSymbols: (symbols) => set({ reelSymbols: symbols }),
  setLastWinnings: (winnings) => set({ lastWinnings: winnings }),
  setIsSpinning: (spinning) => set({ isSpinning: spinning }),
  setShowDoubleUp: (show) => set({ showDoubleUp: show }),
  setIsDeveloperMode: (mode) => set({ isDeveloperMode: mode }),
  setIsTMAMode: (mode) => set({ isTMAMode: mode }),
}));

export const Game: React.FC<{ onDepositClick?: () => void }> = ({ onDepositClick }) => {
  const {
    userCredit,
    betAmount,
    reelSymbols,
    lastWinnings,
    isSpinning,
    showDoubleUp,
    isDeveloperMode,
    isTMAMode,
    setUserCredit,
    setBetAmount,
    setReelSymbols,
    setLastWinnings,
    setIsSpinning,
    setShowDoubleUp,
    setIsDeveloperMode,
    setIsTMAMode,
  } = useGameStore();
  const [message, setMessage] = useState('게임이 로드되었습니다!');
  const connectedWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const rpc = useRpc();
  const [showReel, setShowReel] = useState<boolean>(true);

  // 개발자 모드 토글
  const toggleDeveloperMode = async (password: string) => {
    if (!password) return;

    try {
      // Pages 환경 변수와 비교 (실제로는 API로 확인)
      const response = await fetch('/api/check-developer-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.valid) {
          setIsDeveloperMode(!isDeveloperMode);
          setMessage(`개발자 모드 ${!isDeveloperMode ? 'ON' : 'OFF'} 되었습니다.`);
        } else {
          alert('잘못된 비밀번호입니다.');
        }
      } else {
        // API가 없으면 로컬 모킹
        if (password === 'dev123') {
          setIsDeveloperMode(!isDeveloperMode);
          setMessage(`개발자 모드 ${!isDeveloperMode ? 'ON' : 'OFF'} 되었습니다.`);
        } else {
          alert('잘못된 비밀번호입니다.');
        }
      }
    } catch (e) {
      // API 실패 시 로컬 모킹
      if (password === 'dev123') {
        setIsDeveloperMode(!isDeveloperMode);
        setMessage(`개발자 모드 ${!isDeveloperMode ? 'ON' : 'OFF'} 되었습니다.`);
      } else {
        alert('잘못된 비밀번호입니다.');
      }
    }
  };

  // 잭팟 비디오 재생
  const playJackpotVideo = () => {
    const video = document.createElement('video');
    video.src = '/video.mp4';
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.zIndex = '9999';
    video.style.backgroundColor = 'black';
    video.autoplay = true;
    video.muted = true; // 브라우저 정책으로 인해 음소거
    video.onended = () => {
      document.body.removeChild(video);
    };
    video.onerror = () => {
      document.body.removeChild(video);
      alert('잭팟 비디오를 찾을 수 없습니다.');
    };
    document.body.appendChild(video);
  };

  const handleSpinClick = async () => {
    setMessage('스핀을 실행 중...');
    setIsSpinning(true);
    setShowDoubleUp(false);
    try {
      // Provably Fair를 위한 클라이언트 시드 생성
      const clientSeed = Math.random().toString(36).slice(2);

      const payload = {
        walletAddress: connectedWallet?.account.address || 'anonymous',
        betAmount,
        clientSeed
      };
      const resp = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const j = await resp.json();
        const win = typeof j.winnings === 'number' ? j.winnings : 0;
        setUserCredit(j.newCredit ?? (userCredit - betAmount + win));
        setMessage(`스핀 완료. 획득: ${win}`);

        // 릴 업데이트
        if (j.reels) setReelSymbols(j.reels);

        // 미니게임 활성화
        if (win > 0) {
          setLastWinnings(win);
          setShowDoubleUp(true);
        }

        // 잭팟 처리
        if (j.isJackpot) {
          playJackpotVideo();
        }

        setIsSpinning(false);
        return;
      }
      // 백엔드 실패 시 로컬 모킹
      console.warn('/api/spin 호출 실패, 로컬 모킹 사용');
    } catch (e) {
      console.warn('스핀 호출 중 예외', e);
      // 로컬 모킹 (API 실패 시)
      console.warn('/api/spin 호출 실패, 로컬 모킹 사용');
    }

    // 로컬 모킹
    const mockReels = ['⭐', '🪐', '🌠'];
    let mockWin = Math.random() > 0.7 ? Math.floor(Math.random() * betAmount * 3) : 0;
    let isJackpot = false;

    // 개발자 모드: 무조건 잭팟
    if (isDeveloperMode) {
      mockReels.fill('👑');
      // 잭팟 계산: 각 심볼 당첨금 합 * 100
      // 👑의 배당률은 20, 3개 심볼 = 60 * betAmount * 100
      mockWin = (20 * 3) * betAmount * 100;
      isJackpot = true;
    } else {
      // 심볼 랜덤 생성
      for (let i = 0; i < 3; i++) {
        const rand = Math.random();
        if (rand > 0.9) mockReels[i] = '👑';
        else if (rand > 0.8) mockReels[i] = '💎';
        else if (rand > 0.6) mockReels[i] = '🚀';
        else if (rand > 0.4) mockReels[i] = '☄️';
        else mockReels[i] = '⭐';
      }

      // 잭팟 체크 (모든 심볼이 같을 때)
      isJackpot = mockReels[0] === mockReels[1] && mockReels[1] === mockReels[2];
      if (isJackpot) {
        // 심볼 배당률 계산
        const symbolMultipliers: { [key: string]: number } = {
          '👑': 20, '💎': 10, '🚀': 3, '☄️': 2, '⭐': 0.5
        };
        const baseWin = mockReels.reduce((sum, symbol) => sum + (symbolMultipliers[symbol] || 0), 0) * betAmount;
        mockWin = baseWin * 100;
      }
    }

    setReelSymbols(mockReels);
    setLastWinnings(mockWin);
    setUserCredit(userCredit - betAmount + mockWin);

    if (mockWin > 0) {
      setShowDoubleUp(true);
    }

    // 잭팟 비디오 재생
    if (isJackpot) {
      playJackpotVideo();
    }

    setTimeout(() => {
      setIsSpinning(false);
      setMessage(`(모킹) 스핀 완료. ${mockWin > 0 ? `당첨: ${mockWin} CSPIN!` : '꽝입니다.'}`);
    }, 1000);
  };

  // 입금 성공 후 백엔드 등록
  const handleDepositSuccess = async (txBoc: string, senderAddress: string, amount: number) => {
    try {
      const resp = await fetch('/api/credit-deposit', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ walletAddress: senderAddress, amount }) 
      });
      
      if (resp.ok) {
        const data = await resp.json();
        setUserCredit(data.newCredit);
        setMessage('크레딧 충전 완료!');
      } else {
        setMessage('크레딧 충전 실패');
      }
    } catch (e) {
      console.warn('credit-deposit 호출 실패', e);
      setMessage('크레딧 등록 중 오류 발생');
    }
  };

  const [depositAmount, setDepositAmount] = useState<string>("100");

  // CSPIN 전송 페이로드 빌드 (PoC 로직 기반)
  const buildCSPINTransferPayload = (amount: bigint, destination: Address, responseTo: Address) => {
    const cell = beginCell()
      .storeUint(0xF8A7EA5, 32)     // op: transfer
      .storeUint(0, 64)             // query_id
      .storeCoins(amount)            // amount
      .storeAddress(destination)     // destination
      .storeAddress(responseTo)      // response_destination
      .storeBit(0)                   // custom_payload: none
      .storeCoins(BigInt(0))         // forward_ton_amount
      .storeBit(1)                   // forward_payload: right (for ^Cell)
      .storeBit(0)                   // forward_payload: nothing (none)
      .endCell();
    return cell;
  };

  // CSPIN 입금 처리
  const handleDeposit = async () => {
    if (!connectedWallet) {
      alert('지갑을 연결하세요');
      return;
    }

    try {
      const amount = BigInt(depositAmount) * BigInt(10 ** 9); // CSPIN 9 decimals
      const destination = Address.parse(GAME_WALLET_ADDRESS);
      const responseTo = Address.parse(connectedWallet.account.address);
      
      // 사용자의 CSPIN 지갑 주소 계산 (백엔드 API 사용)
      const walletResp = await fetch('/api/get-jetton-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAddress: CSPIN_TOKEN_ADDRESS,
          userAddress: connectedWallet.account.address
        })
      });

      if (!walletResp.ok) {
        throw new Error('Failed to get jetton wallet address from API');
      }

      const walletData = await walletResp.json();
      const userJettonWalletAddress = walletData.jettonWalletAddress;

      const payloadCell = buildCSPINTransferPayload(amount, destination, responseTo);
      const boc = payloadCell.toBoc();
      const hex = boc.toString('hex');
      const base64 = Buffer.from(hex, 'hex').toString('base64');

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: userJettonWalletAddress, // 사용자의 CSPIN 지갑 주소
          amount: '30000000', // 0.03 TON for gas
          payload: base64
        }]
      };

      const result: any = await tonConnectUI.sendTransaction(tx);
      
      if (result && result.boc) {
        // 온체인 성공, 백엔드에 크레딧 등록
        await handleDepositSuccess(result.boc, connectedWallet.account.address, parseInt(depositAmount));
      } else {
        setMessage('트랜잭션이 전송되었으나 결과 boc를 찾을 수 없습니다.');
      }
    } catch (e) {
      console.warn('deposit failed', e);
      alert('입금 트랜잭션 실패: ' + String(e));
    }
  };

  // 미니게임: 더블업
  const handleGamble = async (choice: 'red' | 'blue') => {
    const clientSeed = Math.random().toString(36).slice(2);
    
    try {
      const resp = await fetch('/api/double-up', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          walletAddress: connectedWallet?.account.address || 'anonymous', 
          choice, 
          clientSeed 
        }) 
      });
      
      if (resp.ok) {
        const data = await resp.json();
        setShowDoubleUp(false);
        if (data.won) {
          setUserCredit(userCredit + data.newWinnings);
          setMessage(`더블업 성공! ${data.newWinnings} 크레딧 획득`);
        } else {
          setMessage('더블업 실패...');
          setLastWinnings(0);
        }
      } else {
        setMessage('미니게임 오류');
      }
    } catch (e) {
      console.warn('double-up error', e);
      setMessage('미니게임 호출 실패');
    }
  };

  // CSPIN 인출: 백엔드에서 게임 월렛으로 전송
  const handleWithdraw = async () => {
    if (!connectedWallet) {
      alert('지갑을 연결하세요');
      return;
    }

    if (userCredit === 0) {
      alert('인출할 크레딧이 없습니다.');
      return;
    }

    try {
      setMessage('CSPIN 토큰 인출 중...');

      const resp = await fetch('/api/initiate-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedWallet.account.address,
          withdrawalAmount: userCredit
        })
      });

      const j = await resp.json();
      if (resp.ok && j.success) {
        setUserCredit(j.newCredit);
        setMessage(`✅ 인출 완료! ${j.withdrawalAmount} CSPIN 토큰이 지갑으로 전송되었습니다.`);
      } else {
        setMessage(`❌ 인출 실패: ${j.error || '알 수 없는 오류'}`);
      }
    } catch (e) {
      setMessage(`❌ 인출 호출 실패: ${String(e)}`);
    }
  };

  // 상금 수령
  const handleCollect = async () => {
    try {
      const resp = await fetch('/api/collect-winnings', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          walletAddress: connectedWallet?.account.address || 'anonymous' 
        }) 
      });
      
      if (resp.ok) {
        const data = await resp.json();
        setUserCredit(data.newCredit);
        setShowDoubleUp(false);
        setMessage('상금 수령 완료!');
      } else {
        setMessage('상금 수령 실패');
      }
    } catch (e) {
      console.warn('collect error', e);
      setMessage('상금 수령 호출 실패');
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
          <p className="text-lg">현재 크레딧: <span className="text-yellow-400 font-bold">{userCredit}</span></p>
          <p className="text-green-400">{message}</p>
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
              {showReel ? <ReelPixi spinning={isSpinning} reels={reelSymbols} /> : <div className="text-sm text-gray-300">Reel disabled for debugging. Toggle below to enable.</div>}
            </div>
          </div>



          <div className="text-center space-x-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <label className="text-sm">입금 금액 (CSPIN):</label>
              <input 
                type="number" 
                value={depositAmount} 
                onChange={e => setDepositAmount(e.target.value)} 
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm w-20" 
                placeholder="100" 
              />
              <button
                onClick={onDepositClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
              >
                CSPIN 입금
              </button>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <button
                onClick={handleWithdraw}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
              >
                CSPIN 인출
              </button>
            </div>
            <button
              onClick={handleSpinClick}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
            >
              🎰 SPIN!
            </button>
            {showDoubleUp && (
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleGamble('red')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  빨강 Gamble
                </button>
                <button
                  onClick={() => handleGamble('blue')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  파랑 Gamble
                </button>
                <button
                  onClick={handleCollect}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  상금 수령
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;