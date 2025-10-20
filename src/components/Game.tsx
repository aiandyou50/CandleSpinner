import React, { useState } from 'react';
import { create } from 'zustand';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Address, toNano, beginCell } from '@ton/core';
import { jettonWalletCodeFromLibrary, getJettonWalletAddress } from '@ton/ton';
import { sha256 } from '@ton/crypto';
import { useRpc } from '../hooks/useRpc';
import ReelPixi from './ReelPixi';
import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS } from '../constants';

// Zustand 스토어
interface GameStore {
  userCredit: number;
  betAmount: number;
  reelSymbols: string[];
  lastWinnings: number;
  isSpinning: boolean;
  showDoubleUp: boolean;
  isDeveloperMode: boolean;
  setUserCredit: (credit: number) => void;
  setBetAmount: (amount: number) => void;
  setReelSymbols: (symbols: string[]) => void;
  setLastWinnings: (winnings: number) => void;
  setIsSpinning: (spinning: boolean) => void;
  setShowDoubleUp: (show: boolean) => void;
  setIsDeveloperMode: (mode: boolean) => void;
}

const useGameStore = create<GameStore>((set) => ({
  userCredit: 1000,
  betAmount: 100,
  reelSymbols: ['⭐','🪐','🌠'],
  lastWinnings: 0,
  isSpinning: false,
  showDoubleUp: false,
  isDeveloperMode: false,
  setUserCredit: (credit) => set({ userCredit: credit }),
  setBetAmount: (amount) => set({ betAmount: amount }),
  setReelSymbols: (symbols) => set({ reelSymbols: symbols }),
  setLastWinnings: (winnings) => set({ lastWinnings: winnings }),
  setIsSpinning: (spinning) => set({ isSpinning: spinning }),
  setShowDoubleUp: (show) => set({ showDoubleUp: show }),
  setIsDeveloperMode: (mode) => set({ isDeveloperMode: mode }),
}));

export const Game: React.FC = () => {
  const {
    userCredit,
    betAmount,
    reelSymbols,
    lastWinnings,
    isSpinning,
    showDoubleUp,
    isDeveloperMode,
    setUserCredit,
    setBetAmount,
    setReelSymbols,
    setLastWinnings,
    setIsSpinning,
    setShowDoubleUp,
    setIsDeveloperMode,
  } = useGameStore();
  const [message, setMessage] = useState('게임이 로드되었습니다!');
  const connectedWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  // const { getJettonWalletAddress } = useRpc();
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
      
      // 사용자의 CSPIN 지갑 주소 계산 (RPC 사용)
      const rpc = useRpc();
      const jettonWalletAddressStr = await rpc.getJettonWalletAddress(CSPIN_TOKEN_ADDRESS, connectedWallet.account.address);
      if (!jettonWalletAddressStr) {
        throw new Error('Failed to get jetton wallet address');
      }
      const userJettonWalletAddress = jettonWalletAddressStr;

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

          {/** Visual test checklist */}
          <div className="bg-black/20 rounded-md p-4 mb-4">
            <h3 className="text-yellow-300 font-semibold mb-2">MVP 테스트 체크리스트</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-200">
              <li>✅ 지갑 연결 UI 표시 (@tonconnect/ui-react)</li>
              <li>✅ 지갑 연결/연결 해제 (TON Connect 프로토콜)</li>
              <li>✅ 크레딧 표시 및 갱신 (Zustand 상태 관리)</li>
              <li>✅ SPIN 클릭 시 서버 호출 + 로컬 모킹 (/api/spin)</li>
              <li>✅ 릴 애니메이션 (PixiJS v8 렌더링)</li>
              <li>✅ PoC CSPIN 입금 로직 통합 (ton-core 페이로드)</li>
              <li>✅ `/api/spin` 서버 로직 구현 (Cloudflare Workers)</li>
              <li>✅ Provably Fair 완전 구현 (클라이언트/서버 시드)</li>
              <li>✅ 미니게임(더블업) 구현 (50% 확률)</li>
              <li>✅ 상금 수령 기능 구현 (/api/collect-winnings)</li>
              <li>✅ 인출 요청 기능 (/api/initiate-withdrawal)</li>
              <li>✅ Buffer polyfill 적용 (브라우저 호환성)</li>
              <li>❌ 다국어 지원 (i18n) - 7개 언어 (ko, en, ja, zh-CN, zh-TW, ru, ar)</li>
              <li>❌ 사운드 효과 (BGM, 스핀 사운드, 당첨 효과음)</li>
              <li>❌ 잭팟 시 10초 비디오 재생 (전체 화면)</li>
              <li>❌ 물리 엔진 기반 애니메이션 (릴 회전)</li>
              <li>❌ 베팅 조절 버튼 (+/- 10 CSPIN 단위)</li>
              <li>❌ RTP 95% 검증 및 통계</li>
              <li>❌ 네온사인 스타일 완전 구현</li>
              <li>❌ 우주 테마 배경 (은하수, 별자리)</li>
              <li>❌ 당첨 시각 효과 (라인, 심볼 하이라이트)</li>
            </ul>
            <div className="mt-3 flex space-x-2">
              <button onClick={async () => {
                // Wallet connect test
                if (connectedWallet) alert('지갑이 연결되어 있습니다: ' + connectedWallet.account.address);
                else alert('지갑 미연결 - 우상단 TonConnect 버튼을 눌러 연결하세요');
              }} className="bg-indigo-600 px-3 py-1 rounded text-sm">지갑 연결 테스트</button>
              <button onClick={() => setShowReel(s => !s)} className="bg-gray-600 px-3 py-1 rounded text-sm">{showReel ? '릴 숨기기' : '릴 보이기'}</button>
              <button onClick={async () => {
                const password = prompt('개발자 모드 비밀번호를 입력하세요:');
                if (password) {
                  await toggleDeveloperMode(password);
                  alert(isDeveloperMode ? '개발자 모드가 활성화되었습니다.' : '개발자 모드가 비활성화되었습니다.');
                }
              }} className={`px-3 py-1 rounded text-sm ${isDeveloperMode ? 'bg-red-600' : 'bg-green-600'}`}>{isDeveloperMode ? '개발자 모드 OFF' : '개발자 모드 ON'}</button>
              {isDeveloperMode && (
                <button onClick={async () => {
                  // 잭팟 강제 실행
                  setIsSpinning(true);
                  setMessage('잭팟 강제 실행 중...');
                  try {
                    const testWallet = connectedWallet?.account.address || 'test-wallet-with-credit';
                    const resp = await fetch('/api/spin', { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify({ 
                        walletAddress: testWallet, 
                        betAmount: betAmount, 
                        clientSeed: 'jackpot-force-' + Date.now(),
                        forceJackpot: true // 개발자 모드에서만 사용
                      }) 
                    });
                    const result = await resp.json();
                    if (result.success) {
                      setReelSymbols(result.reelSymbols);
                      setLastWinnings(result.winnings);
                      setUserCredit(result.newCredit);
                      if (result.isJackpot) {
                        setMessage('🎉 JACKPOT! 🎉');
                        playJackpotVideo();
                      } else {
                        setMessage(`당첨: ${result.winnings} CSPIN`);
                      }
                    } else {
                      setMessage('스핀 실패: ' + result.error);
                    }
                  } catch (e) {
                    setMessage('스핀 오류: ' + String(e));
                  } finally {
                    setIsSpinning(false);
                  }
                }} className="bg-yellow-600 px-3 py-1 rounded text-sm">잭팟 강제</button>
              )}
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
                onClick={handleDeposit}
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