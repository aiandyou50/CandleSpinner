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
        throw new Error('잘못된 금액입니다');
      }

      // 환경 변수에서 주소 가져오기
      const CSPIN_JETTON_WALLET = import.meta.env.VITE_CSPIN_JETTON_WALLET;
      const GAME_WALLET = import.meta.env.VITE_GAME_WALLET_ADDRESS;

      if (!CSPIN_JETTON_WALLET || !GAME_WALLET) {
        throw new Error('지갑 주소가 설정되지 않았습니다');
      }

      // 주소 유효성 검사
      let gameWalletAddress: Address;
      let responseAddress: Address;
      
      try {
        gameWalletAddress = Address.parse(GAME_WALLET);
        responseAddress = Address.parse(walletAddress);
      } catch (err) {
        console.error('Address parsing error:', err);
        throw new Error('주소 형식이 올바르지 않습니다');
      }

      // Jetton Transfer 메시지 생성
      const transferBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // op code: Jetton Transfer
        .storeUint(0, 64) // query_id
        .storeCoins(BigInt(Math.floor(depositAmount * 1_000_000_000))) // amount (nanoCSPIN)
        .storeAddress(gameWalletAddress) // destination
        .storeAddress(responseAddress) // response_destination
        .storeBit(0) // custom_payload
        .storeCoins(toNano('0.05')) // forward_ton_amount
        .storeBit(0) // forward_payload
        .endCell();

      // TON Connect로 트랜잭션 전송
      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000, // 5분
        messages: [
          {
            address: CSPIN_JETTON_WALLET,
            amount: toNano('0.1').toString(),
            payload: transferBody.toBoc().toString('base64'),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      
      // 트랜잭션 해시 추출
      const txHash = result.boc;

      // 백엔드에 입금 확인 요청
      await verifyDeposit({ walletAddress, txHash });

      alert(`${depositAmount} CSPIN 입금이 완료되었습니다!`);
      onSuccess();
    } catch (err) {
      console.error('Deposit failed:', err);
      setError(err instanceof Error ? err.message : '입금에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-4">💰 CSPIN 입금</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">금액 (CSPIN)</label>
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
          {isLoading ? '처리 중...' : '입금하기'}
        </button>

        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}
      </div>
    </div>
  );
}
