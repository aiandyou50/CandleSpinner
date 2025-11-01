/**
 * 인출 컴포넌트
 */

import { useState } from 'react';
import { withdraw as withdrawApi } from '@/api/client';

interface WithdrawProps {
  walletAddress: string;
  currentCredit: number;
  onSuccess: () => void;
}

export function Withdraw({ walletAddress, currentCredit, onSuccess }: WithdrawProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        throw new Error('Invalid amount');
      }

      if (withdrawAmount > currentCredit) {
        throw new Error('Insufficient credit');
      }

      const result = await withdrawApi({ walletAddress, amount: withdrawAmount });

      alert(`Successfully withdrew ${withdrawAmount} CSPIN!\nTx: ${result.txHash}`);
      setAmount('');
      onSuccess();
    } catch (err) {
      console.error('Withdraw failed:', err);
      setError(err instanceof Error ? err.message : 'Withdraw failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-4">Withdraw CSPIN</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Amount (Available: {currentCredit} CSPIN)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={currentCredit}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="0"
          />
        </div>

        <button
          onClick={handleWithdraw}
          disabled={isLoading || currentCredit === 0}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl font-bold text-white hover:shadow-lg transition disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Withdraw'}
        </button>

        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}
      </div>
    </div>
  );
}
