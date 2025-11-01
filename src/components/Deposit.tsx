/**
 * 입금 컴포넌트
 * TON Connect로 Jetton Transfer 트랜잭션 생성
 * MVP v1 로직 기반으로 재구현
 */

import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/ton';
import { verifyDeposit } from '@/api/client';
import { GAME_WALLET_ADDRESS, CSPIN_JETTON_WALLET } from '@/constants';

interface DepositProps {
  walletAddress: string;
  onSuccess: () => void;
}

/**
 * Jetton Transfer Payload 구성 (TEP-74 표준 준수)
 * MVP v1 방식: forward_ton_amount = 1 nanoton
 * 
 * @see https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
 */
function buildJettonTransferPayload(
  amount: bigint,
  destination: Address,
  responseTo: Address
): string {
  const cell = beginCell()
    .storeUint(0xf8a7ea5, 32)      // Jetton transfer opcode (TEP-74 표준)
    .storeUint(0, 64)              // query_id:uint64
    .storeCoins(amount)            // amount:(VarUInteger 16)
    .storeAddress(destination)     // destination:MsgAddress
    .storeAddress(responseTo)      // response_destination:MsgAddress
    .storeBit(0)                   // custom_payload:(Maybe ^Cell) = none
    .storeCoins(BigInt(1))         // ✅ forward_ton_amount = 1 nanoton (MVP v1 표준)
    .storeBit(0)                   // forward_payload:(Either Cell ^Cell) = none
    .endCell();
  return cell.toBoc().toString('base64');
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

      console.log('=== Deposit 시작 ===');
      console.log('입금 금액:', depositAmount, 'CSPIN');
      console.log('사용자 지갑:', walletAddress);
      console.log('게임 지갑:', GAME_WALLET_ADDRESS);
      console.log('CSPIN Jetton Wallet:', CSPIN_JETTON_WALLET);

      // 주소 파싱 (MVP v1 방식: raw format, non-bounceable)
      let gameWalletAddress: Address;
      let responseAddress: Address;
      
      try {
        gameWalletAddress = Address.parse(GAME_WALLET_ADDRESS);
        responseAddress = Address.parse(walletAddress);
        
        console.log('파싱된 게임 지갑:', gameWalletAddress.toString());
        console.log('파싱된 응답 지갑:', responseAddress.toString());
      } catch (err) {
        console.error('주소 파싱 오류:', err);
        throw new Error('주소 형식이 올바르지 않습니다');
      }

      // Jetton Transfer 페이로드 생성 (MVP v1 방식)
      const amountNano = BigInt(Math.floor(depositAmount * 1_000_000_000));
      console.log('nano 단위 금액:', amountNano.toString());

      const payloadBase64 = buildJettonTransferPayload(
        amountNano,
        gameWalletAddress,
        responseAddress
      );
      console.log('페이로드 생성 완료 (base64):', payloadBase64.substring(0, 50) + '...');

      // TON Connect 트랜잭션 (MVP v1 방식)
      // ✅ validUntil: 현재 시간 + 5분 (300초)
      // ✅ 주소: raw format (non-bounceable)
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5분
        messages: [
          {
            address: CSPIN_JETTON_WALLET,
            amount: toNano('0.05').toString(), // ✅ 0.05 TON으로 감소
            payload: payloadBase64,
          },
        ],
      };

      console.log('트랜잭션 전송:', {
        validUntil: transaction.validUntil,
        currentTime: Math.floor(Date.now() / 1000),
        timeDiff: transaction.validUntil - Math.floor(Date.now() / 1000),
        address: CSPIN_JETTON_WALLET,
        amount: transaction.messages[0]?.amount || '0',
      });

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('트랜잭션 결과:', result);
      
      // 트랜잭션 해시
      const txHash = result.boc;

      // 백엔드에 입금 확인 요청
      console.log('백엔드 입금 확인 요청...');
      await verifyDeposit({ walletAddress, txHash });

      console.log('=== Deposit 완료 ===');
      alert(`${depositAmount} CSPIN 입금이 완료되었습니다!`);
      onSuccess();
    } catch (err) {
      console.error('Deposit 실패:', err);
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
