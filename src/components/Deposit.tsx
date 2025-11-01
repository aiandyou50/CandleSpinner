/**
 * 입금 컴포넌트
 * TON Connect로 Jetton Transfer 트랜잭션 생성
 */

import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/ton';
import { verifyDeposit } from '@/api/client';

interface DepositProps {
  walletAddress: string;
  onSuccess: () => void;
}

export function Deposit({ walletAddress, onSuccess }: DepositProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [amount, setAmount] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        throw new Error('Invalid amount');
      }

      // CSPIN Jetton Master 주소 (환경 변수에서 가져오기)
      const CSPIN_MASTER = import.meta.env.VITE_CSPIN_TOKEN_ADDRESS || 'EQCsBJHqi3TtqOFiEP2c...';
      const GAME_WALLET = import.meta.env.VITE_GAME_WALLET_ADDRESS || 'UQBdBXl...';

      // Jetton Transfer 메시지 생성
      const transferBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // op code: Jetton Transfer
        .storeUint(0, 64) // query_id
        .storeCoins(BigInt(depositAmount * 1_000_000_000)) // amount (nanoCSPIN)
        .storeAddress(Address.parse(GAME_WALLET)) // destination
        .storeAddress(Address.parse(walletAddress)) // response_destination
        .storeBit(0) // custom_payload
        .storeCoins(toNano('0.05')) // forward_ton_amount
        .storeBit(0) // forward_payload
        .endCell();

      // TON Connect로 트랜잭션 전송
      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000, // 5분
        messages: [
          {
            address: CSPIN_MASTER, // Jetton Wallet 주소 (실제로는 derive 필요)
            amount: toNano('0.1').toString(),
            payload: transferBody.toBoc().toString('base64'),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      
      // 트랜잭션 해시 추출
      const txHash = result.boc; // 실제로는 BOC에서 추출 필요

      // 백엔드에 입금 확인 요청
      await verifyDeposit({ walletAddress, txHash });

      alert(`Successfully deposited ${depositAmount} CSPIN!`);
      onSuccess();
    } catch (err) {
      console.error('Deposit failed:', err);
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-4">Deposit CSPIN</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Amount (CSPIN)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="10"
          />
        </div>

        <button
          onClick={handleDeposit}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-bold text-white hover:shadow-lg transition disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Deposit'}
        </button>

        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}
      </div>
    </div>
  );
}
