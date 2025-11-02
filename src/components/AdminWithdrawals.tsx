/**
 * 관리자 인출 관리 대시보드
 * 대기 중인 인출 목록 표시 및 일괄 처리
 */

import { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano, TonClient, JettonMaster } from '@ton/ton';
import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS } from '@/constants';

interface Withdrawal {
  id: string;
  walletAddress: string;
  amount: number;
  status: string;
  requestedAt: string;
  estimatedProcessTime: string;
}

export function AdminWithdrawals() {
  const [tonConnectUI] = useTonConnectUI();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  // 대기 중인 인출 목록 조회
  const fetchPendingWithdrawals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/pending-withdrawals');
      const data = await response.json() as { 
        success: boolean; 
        withdrawals: Withdrawal[];
        count: number;
      };
      
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWithdrawals();
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchPendingWithdrawals, 30000);
    return () => clearInterval(interval);
  }, []);

  // 개별 인출 처리
  const handleProcessWithdrawal = async (withdrawal: Withdrawal) => {
    try {
      setProcessing(withdrawal.id);
      
      console.log('🔄 인출 처리 시작:', withdrawal);
      
      // 1. TonClient로 게임 Jetton Wallet 주소 계산
      const tonClient = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      });

      const gameAddress = Address.parse(GAME_WALLET_ADDRESS);
      const masterAddress = Address.parse(CSPIN_TOKEN_ADDRESS);
      const jettonMaster = tonClient.open(JettonMaster.create(masterAddress));
      
      const gameJettonWalletAddress = await jettonMaster.getWalletAddress(gameAddress);
      const gameJettonWalletRaw = gameJettonWalletAddress.toString({ 
        urlSafe: true, 
        bounceable: true
      });

      console.log('✅ 게임 Jetton Wallet:', gameJettonWalletRaw);

      // 2. Jetton Transfer Payload 생성
      const amountNano = BigInt(Math.floor(withdrawal.amount * 1_000_000_000));
      const userAddress = Address.parse(withdrawal.walletAddress);

      const payload = beginCell()
        .storeUint(0xf8a7ea5, 32)      // Jetton transfer opcode
        .storeUint(0, 64)              // query_id
        .storeCoins(amountNano)        // amount
        .storeAddress(userAddress)     // ✅ 사용자에게 보내라!
        .storeAddress(userAddress)     // response_destination
        .storeBit(0)                   // custom_payload
        .storeCoins(BigInt(1))         // forward_ton_amount
        .storeBit(0)                   // forward_payload
        .endCell();

      const payloadBase64 = payload.toBoc().toString('base64');

      // 3. TON Connect 트랜잭션 (관리자 지갑으로 서명)
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: gameJettonWalletRaw,  // 게임 Jetton Wallet
            amount: toNano('0.2').toString(),  // 게임이 네트워크 Fee 부담
            payload: payloadBase64,
          },
        ],
      };

      console.log('📤 트랜잭션 전송:', transaction);

      const result = await tonConnectUI.sendTransaction(transaction);
      const txHash = result.boc;

      console.log('✅ 트랜잭션 성공:', txHash);

      // 4. 백엔드에 처리 완료 표시
      const markResponse = await fetch('/api/admin/mark-processed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          withdrawalId: withdrawal.id,
          txHash 
        }),
      });

      if (!markResponse.ok) {
        throw new Error('처리 완료 표시 실패');
      }

      console.log('✅ 처리 완료 표시 성공');

      alert(`${withdrawal.amount} CSPIN 인출이 처리되었습니다!\nTX: ${txHash.substring(0, 10)}...`);
      
      // 목록 새로고침
      await fetchPendingWithdrawals();
      
    } catch (error) {
      console.error('❌ 인출 처리 실패:', error);
      alert(`인출 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setProcessing(null);
    }
  };

  // 일괄 처리
  const handleBatchProcess = async () => {
    if (!confirm(`${withdrawals.length}건의 인출을 일괄 처리하시겠습니까?`)) {
      return;
    }

    for (const withdrawal of withdrawals) {
      await handleProcessWithdrawal(withdrawal);
      // 각 트랜잭션 사이 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    alert('모든 인출 처리가 완료되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">
              🏦 인출 관리 대시보드
            </h2>
            <button
              onClick={fetchPendingWithdrawals}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition disabled:opacity-50"
            >
              {isLoading ? '로딩 중...' : '🔄 새로고침'}
            </button>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm">대기 중</p>
              <p className="text-2xl font-bold text-white">{withdrawals.length}건</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm">총 금액</p>
              <p className="text-2xl font-bold text-white">
                {withdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(2)} CSPIN
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm">예상 비용</p>
              <p className="text-2xl font-bold text-white">
                {(withdrawals.length * 0.2).toFixed(2)} TON
              </p>
            </div>
          </div>

          {/* 일괄 처리 버튼 */}
          {withdrawals.length > 0 && (
            <button
              onClick={handleBatchProcess}
              disabled={isLoading || processing !== null}
              className="w-full mb-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl font-bold text-white hover:shadow-lg transition disabled:opacity-50"
            >
              🚀 모두 처리 ({withdrawals.length}건)
            </button>
          )}

          {/* 인출 목록 */}
          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl">📭 대기 중인 인출이 없습니다</p>
              </div>
            ) : (
              withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg">
                        {withdrawal.amount} CSPIN
                      </p>
                      <p className="text-gray-400 text-sm font-mono">
                        {withdrawal.walletAddress.substring(0, 8)}...
                        {withdrawal.walletAddress.substring(withdrawal.walletAddress.length - 6)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">
                        대기 중
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-400">
                      <p>요청 시간: {new Date(withdrawal.requestedAt).toLocaleString('ko-KR')}</p>
                      <p className="mt-1">ID: {withdrawal.id.substring(0, 16)}...</p>
                    </div>
                    <button
                      onClick={() => handleProcessWithdrawal(withdrawal)}
                      disabled={processing !== null}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg text-white font-semibold hover:shadow-lg transition disabled:opacity-50"
                    >
                      {processing === withdrawal.id ? '처리 중...' : '✅ 처리'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 안내 */}
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <p className="text-sm text-blue-200">
              💡 <strong>처리 방법:</strong>
            </p>
            <ul className="text-xs text-blue-300 mt-2 space-y-1 ml-4">
              <li>• 관리자 TON Connect 지갑 연결 필요</li>
              <li>• 각 인출 처리 시 0.2 TON 네트워크 수수료 발생</li>
              <li>• 게임 Jetton Wallet에서 사용자에게 자동 전송</li>
              <li>• 처리 완료 후 대기열에서 자동 제거</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
