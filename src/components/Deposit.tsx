/**
 * 입금 컴포넌트
 * TON Connect로 Jetton Transfer 트랜잭션 생성
 * MVP v1 로직 기반으로 재구현
 */

import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/ton';
import { verifyDeposit } from '@/api/client';
import { GAME_WALLET_ADDRESS, CSPIN_JETTON_WALLET, CSPIN_TOKEN_ADDRESS } from '@/constants';
import { logger } from '@/utils/logger';
import { DebugLogModal } from './DebugLogModal';

interface DepositProps {
  walletAddress: string;
  onSuccess: () => void;
}

/**
 * Jetton Transfer Payload 구성 (TEP-74 표준 준수)
 * forward_ton_amount = 0.005 TON (5,000,000 nanoton)
 * - Jetton Wallet 간 메시지 전달 비용
 * - 알림(notification) 전송 비용
 * - 최소 권장값: 0.05 TON이지만 0.005 TON으로 최적화
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
    .storeCoins(toNano('0.005'))   // ✅ forward_ton_amount = 0.005 TON (5,000,000 nanoton)
    .storeBit(0)                   // forward_payload:(Either Cell ^Cell) = none
    .endCell();
  return cell.toBoc().toString('base64');
}

export function Deposit({ walletAddress, onSuccess }: DepositProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [amount, setAmount] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugLog, setShowDebugLog] = useState(false);

  const handleDeposit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        throw new Error('잘못된 금액입니다');
      }

      logger.info('=== Deposit 시작 ===');
      logger.info(`입금 금액: ${depositAmount} CSPIN`);
      logger.info(`사용자 지갑: ${walletAddress}`);
      logger.info(`게임 지갑: ${GAME_WALLET_ADDRESS}`);
      logger.info(`CSPIN Token Master: ${CSPIN_TOKEN_ADDRESS}`);
      logger.info(`CSPIN Jetton Wallet: ${CSPIN_JETTON_WALLET}`);

      // Jetton Wallet 주소 확인
      if (!CSPIN_JETTON_WALLET || CSPIN_JETTON_WALLET.length === 0) {
        const errorMsg = 
          '❌ 입금 기능이 아직 설정되지 않았습니다.\n\n' +
          '관리자가 VITE_CSPIN_JETTON_WALLET 환경변수를 설정해야 합니다.';
        
        logger.error('Jetton Wallet 주소 미설정');
        throw new Error(errorMsg);
      }

      // 주소 파싱 및 변환
      let gameWalletAddress: Address;
      let responseAddress: Address;
      
      try {
        gameWalletAddress = Address.parse(GAME_WALLET_ADDRESS);
        responseAddress = Address.parse(walletAddress);
        
        logger.debug('파싱된 게임 지갑 (기본):', gameWalletAddress.toString());
        logger.debug('파싱된 응답 지갑 (기본):', responseAddress.toString());
      } catch (err) {
        logger.error('주소 파싱 오류:', err);
        throw new Error('주소 형식이 올바르지 않습니다');
      }

      // Jetton Transfer 페이로드 생성 (MVP v1 방식)
      const amountNano = BigInt(Math.floor(depositAmount * 1_000_000_000));
      logger.debug(`nano 단위 금액: ${amountNano.toString()}`);

      const payloadBase64 = buildJettonTransferPayload(
        amountNano,
        gameWalletAddress,
        responseAddress
      );
      logger.debug(`페이로드 생성 완료 (base64): ${payloadBase64.substring(0, 50)}...`);

      // ✅ TON Connect는 raw format (non-bounceable, URL-safe) 주소 요구
      // ⚠️ 임시: Jetton Wallet 주소 검증 및 변환
      let jettonWalletRaw: string;
      
      try {
        // 먼저 주소 파싱 시도
        const jettonAddr = Address.parse(CSPIN_JETTON_WALLET);
        jettonWalletRaw = jettonAddr.toString({ urlSafe: true, bounceable: false });
        
        logger.info('TON Connect 주소 형식:', {
          original: CSPIN_JETTON_WALLET,
          converted: jettonWalletRaw,
        });
      } catch (addrError) {
        logger.error('Jetton Wallet 주소 파싱 실패:', addrError);
        
        // ⚠️ 긴급 대안: 사용자의 Jetton Wallet을 동적으로 계산해야 함
        // 현재는 게임 지갑 주소를 사용 (임시)
        throw new Error(
          'CSPIN Jetton Wallet 주소가 올바르지 않습니다.\n' +
          '관리자에게 문의하세요.\n' +
          `오류: ${addrError instanceof Error ? addrError.message : String(addrError)}`
        );
      }

      // TON Connect 트랜잭션
      // - 전체 비용: 0.055 TON
      //   * 0.05 TON: Jetton Wallet 컨트랙트 실행 비용
      //   * 0.005 TON: forward_ton_amount (메시지 전달 비용)
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5분
        messages: [
          {
            address: jettonWalletRaw, // ✅ raw format 사용
            amount: toNano('0.055').toString(), // ✅ 0.05 + 0.005 = 0.055 TON
            payload: payloadBase64,
          },
        ],
      };

      logger.debug('트랜잭션 전송:', {
        validUntil: transaction.validUntil,
        currentTime: Math.floor(Date.now() / 1000),
        timeDiff: transaction.validUntil - Math.floor(Date.now() / 1000),
        address: jettonWalletRaw,
        amount: transaction.messages[0]?.amount || '0',
      });

      const result = await tonConnectUI.sendTransaction(transaction);
      logger.info('트랜잭션 결과:', result);
      
      // 트랜잭션 해시
      const txHash = result.boc;

      // 백엔드에 입금 확인 요청
      logger.info('백엔드 입금 확인 요청...');
      await verifyDeposit({ walletAddress, txHash });

      logger.info('=== Deposit 완료 ===');
      alert(`${depositAmount} CSPIN 입금이 완료되었습니다!`);
      onSuccess();
    } catch (err) {
      logger.error('Deposit 실패:', err);
      setError(err instanceof Error ? err.message : '입금에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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

          {/* 디버그 로그 버튼 */}
          <button
            onClick={() => setShowDebugLog(true)}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-white transition"
          >
            🐛 디버그 로그 보기
          </button>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
        </div>
      </div>

      {/* 디버그 로그 모달 */}
      <DebugLogModal isOpen={showDebugLog} onClose={() => setShowDebugLog(false)} />
    </>
  );
}
