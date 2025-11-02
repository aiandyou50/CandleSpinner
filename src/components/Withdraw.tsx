/**
 * 인출 컴포넌트
 * 입금의 역방향: 게임 → 사용자
 * 백엔드 RPC 대신 프론트엔드 TON Connect 사용 (더 안정적)
 */

import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano, TonClient, JettonMaster } from '@ton/ton';
import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS } from '@/constants';
import { logger } from '@/utils/logger';
import { DebugLogModal } from './DebugLogModal';

interface WithdrawProps {
  walletAddress: string;
  currentCredit: number;
  onSuccess: () => void;
}

/**
 * Jetton Transfer Payload 생성 (TEP-74 표준)
 * 입금과 동일, destination만 게임 → 사용자로 변경
 */
function buildJettonTransferPayload(
  amount: bigint,
  destination: Address,  // ← 게임 TON 지갑
  responseTo: Address    // ← 사용자 TON 지갑
): string {
  const cell = beginCell()
    .storeUint(0xf8a7ea5, 32)      // Jetton transfer opcode
    .storeUint(0, 64)              // query_id
    .storeCoins(amount)            // amount
    .storeAddress(destination)     // ✅ 게임 TON 지갑 (인출 목적지)
    .storeAddress(responseTo)      // 사용자 지갑 (응답)
    .storeBit(0)                   // custom_payload
    .storeCoins(BigInt(1))         // forward_ton_amount: 1 nanoton
    .storeBit(0)                   // forward_payload
    .endCell();
  return cell.toBoc().toString('base64');
}

export function Withdraw({ walletAddress, currentCredit, onSuccess }: WithdrawProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugLog, setShowDebugLog] = useState(false);

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info('=== 인출 시작 (프론트엔드 방식) ===');
      logger.info(`사용자 지갑: ${walletAddress}`);
      logger.info(`현재 크레딧: ${currentCredit} CSPIN`);

      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        logger.error('❌ 잘못된 금액:', amount);
        throw new Error('잘못된 금액입니다');
      }

      logger.info(`인출 금액: ${withdrawAmount} CSPIN`);

      if (withdrawAmount > currentCredit) {
        logger.error(`❌ 크레딧 부족: 필요 ${withdrawAmount}, 보유 ${currentCredit}`);
        throw new Error('크레딧이 부족합니다');
      }

      // ✅ 프론트엔드 TON Connect 방식으로 구현
      logger.info('사용자 Jetton Wallet 계산 중...');
      
      const tonClient = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      });

      const userAddress = Address.parse(walletAddress);
      const masterAddress = Address.parse(CSPIN_TOKEN_ADDRESS);
      const jettonMaster = tonClient.open(JettonMaster.create(masterAddress));
      
      const userJettonWalletAddress = await jettonMaster.getWalletAddress(userAddress);
      const userJettonWalletRaw = userJettonWalletAddress.toString({ 
        urlSafe: true, 
        bounceable: true
      });

      logger.info(`✅ 사용자 Jetton Wallet: ${userJettonWalletRaw}`);

      const amountNano = BigInt(Math.floor(withdrawAmount * 1_000_000_000));
      logger.debug(`nano 단위 금액: ${amountNano.toString()}`);

      const gameWalletAddress = Address.parse(GAME_WALLET_ADDRESS);
      const responseAddress = Address.parse(walletAddress);

      const payloadBase64 = buildJettonTransferPayload(
        amountNano,
        gameWalletAddress,  // ✅ 게임 TON 지갑 (인출 목적지)
        responseAddress
      );

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: userJettonWalletRaw,  // 사용자 Jetton Wallet
            amount: toNano('0.2').toString(),
            payload: payloadBase64,
          },
        ],
      };

      logger.info('트랜잭션 전송 중...');
      logger.debug('Transaction:', transaction);

      const result = await tonConnectUI.sendTransaction(transaction);
      logger.info('✅ 트랜잭션 전송 성공:', result);
      
      const txHash = result.boc;
      logger.info(`트랜잭션 해시: ${txHash}`);

      // 백엔드에 크레딧 차감 요청
      logger.info('백엔드 크레딧 차감 요청...');
      const confirmResponse = await fetch('/api/withdraw-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, amount: withdrawAmount, txHash }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json() as { error?: string };
        throw new Error(errorData.error || '크레딧 차감 실패');
      }

      const confirmData = await confirmResponse.json();
      logger.info('✅ 크레딧 차감 완료:', confirmData);

      logger.info('=== 인출 완료 ===');
      alert(`${withdrawAmount} CSPIN 인출이 완료되었습니다!`);
      setAmount('');
      onSuccess();
    } catch (err) {
      logger.error('❌ 인출 실패:', err);
      
      if (err instanceof Error) {
        logger.error('오류 메시지:', err.message);
        logger.error('오류 스택:', err.stack);
      }
      
      console.error('Withdraw failed:', err);
      setError(err instanceof Error ? err.message : 'Withdraw failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-4">💸 CSPIN 인출</h3>
        
        {/* 안내 메시지 */}
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-sm text-yellow-200">
            ℹ️ 인출 시 네트워크 수수료 <strong>0.2 TON</strong>이 필요합니다.
          </p>
          <p className="text-xs text-yellow-300 mt-1">
            지갑에 충분한 TON이 있는지 확인해주세요.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              금액 (보유: {currentCredit} CSPIN)
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
            {isLoading ? '처리 중...' : '인출하기'}
          </button>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          {/* 디버그 로그 버튼 */}
          <button
            onClick={() => setShowDebugLog(true)}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white text-sm transition"
          >
            🐛 디버그 로그 보기
          </button>
        </div>
      </div>

      {/* 디버그 로그 모달 */}
      <DebugLogModal 
        isOpen={showDebugLog}
        onClose={() => setShowDebugLog(false)}
      />
    </>
  );
}
