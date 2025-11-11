/**
 * 입금 컴포넌트
 * TON Connect로 Jetton Transfer 트랜잭션 생성
 * MVP v1 로직 기반으로 재구현
 */

import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano, TonClient, JettonMaster } from '@ton/ton';
import { verifyDeposit } from '@/api/client';
import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS, GAME_JETTON_WALLET } from '@/constants';
import { logger } from '@/utils/logger';
import { useLanguage } from '@/hooks/useLanguage';
import { DebugLogModal } from './DebugLogModal';

interface DepositProps {
  walletAddress: string;
  onSuccess: () => void;
}

/**
 * Jetton Transfer Payload 구성 (TEP-74 표준 준수)
 * forward_ton_amount = 1 nanoton (MVP 검증된 값)
 * - Jetton Wallet 간 메시지 전달에 필요한 최소 비용
 * - TON 표준 준수: 1 nanoton이면 충분
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
    .storeCoins(BigInt(1))         // ✅ forward_ton_amount = 1 nanoton (MVP 검증값)
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
  const { t } = useLanguage();

  const handleDeposit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        throw new Error(t.errors.invalidAmount);
      }

      logger.info('=== Deposit 시작 ===');
      logger.info(`입금 금액: ${depositAmount} CSPIN`);
      logger.info(`사용자 지갑: ${walletAddress}`);
      logger.info(`게임 TON 지갑: ${GAME_WALLET_ADDRESS}`);
      logger.info(`게임 Jetton 지갑: ${GAME_JETTON_WALLET}`);
      logger.info(`CSPIN Token Master: ${CSPIN_TOKEN_ADDRESS}`);

      // ✅ 사용자의 CSPIN Jetton Wallet 주소를 동적으로 계산
      logger.info('사용자의 Jetton Wallet 계산 중...');
      
      // TonClient 생성 (Jetton Wallet 주소 계산용)
      const tonClient = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      });

      const userAddress = Address.parse(walletAddress);
      const masterAddress = Address.parse(CSPIN_TOKEN_ADDRESS);
      const jettonMaster = tonClient.open(JettonMaster.create(masterAddress));
      
      const userJettonWalletAddress = await jettonMaster.getWalletAddress(userAddress);
      const userJettonWalletRaw = userJettonWalletAddress.toString({ 
        urlSafe: true, 
        bounceable: true  // ✅ Jetton Transfer는 bounceable 주소 사용 필수!
      });

      logger.info(`✅ 사용자 Jetton Wallet: ${userJettonWalletRaw}`);

      // 입금 금액 계산 (nano 단위)
      const amountNano = BigInt(Math.floor(depositAmount * 1_000_000_000));
      logger.debug(`nano 단위 금액: ${amountNano.toString()}`);

      // ✅ 백엔드 API를 통한 CSPIN 잔액 확인 (TonCenter API Key 사용)
      logger.info('CSPIN 잔액 확인 중...');
      try {
        const balanceResponse = await fetch('/api/check-balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jettonWalletAddress: userJettonWalletRaw }),
        });

        const balanceData = await balanceResponse.json() as {
          success?: boolean;
          balance?: string;
          balanceCSPIN?: number;
          error?: string;
          message?: string;
        };

        logger.debug('잔액 확인 응답:', balanceData);

        // Jetton Wallet이 초기화되지 않은 경우
        if (balanceData.error === 'Jetton Wallet not initialized') {
          throw new Error(
            `❌ CSPIN 토큰을 보유하고 있지 않습니다.\n\n` +
            `먼저 CSPIN 토큰을 구매하거나 받아야 합니다.\n` +
            `현재 잔액: 0 CSPIN\n\n` +
            `💡 CSPIN 토큰 구매 방법:\n` +
            `1. DEX(탈중앙화 거래소)에서 구매\n` +
            `2. 다른 사용자에게서 전송 받기`
          );
        }

        if (!balanceResponse.ok || !balanceData.success) {
          throw new Error(balanceData.error || '잔액 확인 실패');
        }

        const currentBalance = Number(balanceData.balance || 0);
        const balanceCSPIN = balanceData.balanceCSPIN || 0;

        logger.info(`현재 CSPIN 잔액: ${balanceCSPIN} CSPIN`);

        if (currentBalance < Number(amountNano)) {
          throw new Error(
            `❌ CSPIN 잔액이 부족합니다.\n\n` +
            `필요: ${depositAmount} CSPIN\n` +
            `현재: ${balanceCSPIN} CSPIN\n` +
            `부족: ${depositAmount - balanceCSPIN} CSPIN`
          );
        }

        logger.info('✅ CSPIN 잔액 충분');
      } catch (balanceError) {
        logger.error('잔액 확인 실패:', balanceError);

        if (balanceError instanceof Error) {
          // 잔액 부족이나 토큰 미보유 에러는 사용자에게 명확히 표시
          if (balanceError.message.includes('부족') || balanceError.message.includes('보유하고 있지 않습니다')) {
            throw balanceError;
          }
        }

        // 기타 네트워크 에러는 경고만 표시하고 진행
        logger.warn('⚠️ 잔액 확인 실패, 트랜잭션은 계속 진행 (지갑에서 최종 검증)');
      }

      // 주소 파싱 및 변환
      // ✅ destination: 게임의 TON 지갑 주소 (MVP 검증된 방식)
      //    - Jetton Transfer의 destination은 수신자의 TON 지갑 주소
      //    - Jetton Wallet 컨트랙트가 자동으로 수신자의 Jetton Wallet을 찾아 전송
      let gameWalletAddress: Address;
      let responseAddress: Address;
      
      try {
        gameWalletAddress = Address.parse(GAME_WALLET_ADDRESS);  // ✅ 게임의 TON 지갑
        responseAddress = Address.parse(walletAddress);
        
        logger.debug('파싱된 게임 TON 지갑:', gameWalletAddress.toString());
        logger.debug('파싱된 응답 지갑 (사용자):', responseAddress.toString());
      } catch (err) {
        logger.error('주소 파싱 오류:', err);
        throw new Error('주소 형식이 올바르지 않습니다');
      }

      // Jetton Transfer 페이로드 생성
      // destination: 게임의 TON 지갑 (UQBFPDdSlPgq...)
      // response_destination: 사용자 지갑 (잉여 TON 반환용)
      const payloadBase64 = buildJettonTransferPayload(
        amountNano,
        gameWalletAddress,  // ✅ 게임의 TON 지갑 (MVP 검증 방식)
        responseAddress
      );
      logger.debug(`페이로드 생성 완료 (base64): ${payloadBase64.substring(0, 50)}...`);

      // TON Connect 트랜잭션
      // ✅ 사용자의 Jetton Wallet으로 메시지 전송 (MVP 검증 방식)
      // - address: 사용자의 Jetton Wallet (메시지를 받는 컨트랙트)
      // - payload 내부의 destination: 게임의 TON 지갑 (실제 토큰 수신자의 TON 주소)
      // - Jetton Wallet 컨트랙트가 자동으로 destination의 Jetton Wallet을 찾아 전송
      // - 전체 비용: 0.05 TON (TON 표준 권장값, 0.2 TON에서 절감)
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5분
        messages: [
          {
            address: userJettonWalletRaw, // ✅ 사용자의 Jetton Wallet 주소
            amount: toNano('0.05').toString(), // ✅ 0.05 TON (표준 권장값, 기존 0.2에서 75% 절감)
            payload: payloadBase64,
          },
        ],
      };

      logger.debug('트랜잭션 전송:', {
        validUntil: transaction.validUntil,
        currentTime: Math.floor(Date.now() / 1000),
        timeDiff: transaction.validUntil - Math.floor(Date.now() / 1000),
        address: userJettonWalletRaw,
        amount: transaction.messages[0]?.amount || '0',
      });

      const result = await tonConnectUI.sendTransaction(transaction);
      logger.info('트랜잭션 결과:', result);
      
      // 트랜잭션 해시
      const txHash = result.boc;

      // 백엔드에 입금 확인 요청 (금액 포함)
      logger.info('백엔드 입금 확인 요청...');
      logger.debug('verifyDeposit 파라미터:', { walletAddress, txHashLength: txHash.length, amount: depositAmount });
      
      const depositResult = await verifyDeposit({ walletAddress, txHash, amount: depositAmount });
      
      logger.info('입금 검증 완료:', depositResult);
      logger.info('=== Deposit 완료 ===');
  alert(`✅ ${t.deposit.success}\n${depositAmount} CSPIN`);
      onSuccess();
    } catch (err) {
      logger.error('Deposit 실패:', err);
  setError(err instanceof Error ? err.message : t.deposit.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-4">💰 {t.deposit.title}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">{t.deposit.amount}</label>
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
            {isLoading ? t.deposit.processing : t.buttons.deposit}
          </button>

          {/* 디버그 로그 버튼 */}
          <button
            onClick={() => setShowDebugLog(true)}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-white transition"
          >
            🐛 {t.buttons.debugLog}
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
