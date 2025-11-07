/**/**

 * 입금 컴포넌트 - Material-UI * 입금 컴포넌트

 * TON Connect로 Jetton Transfer 트랜잭션 생성 * TON Connect로 Jetton Transfer 트랜잭션 생성

 */ * MVP v1 로직 기반으로 재구현

 */

import { useState } from 'react';

import {import { useState } from 'react';

  Dialog,import { useTonConnectUI } from '@tonconnect/ui-react';

  DialogTitle,import { Address, beginCell, toNano, TonClient, JettonMaster } from '@ton/ton';

  DialogContent,import { verifyDeposit } from '@/api/client';

  DialogActions,import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS, GAME_JETTON_WALLET } from '@/constants';

  TextField,import { logger } from '@/utils/logger';

  Button,import { useLanguage } from '@/hooks/useLanguage';

  Alert,import { DebugLogModal } from './DebugLogModal';

  CircularProgress,

  Box,interface DepositProps {

  Typography,  walletAddress: string;

  InputAdornment,  onSuccess: () => void;

} from '@mui/material';}

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { useTonConnectUI } from '@tonconnect/ui-react';/**

import { Address, beginCell, toNano, TonClient, JettonMaster } from '@ton/ton'; * Jetton Transfer Payload 구성 (TEP-74 표준 준수)

import { verifyDeposit } from '@/api/client'; * forward_ton_amount = 1 nanoton (MVP 검증된 값)

import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS } from '@/constants'; * - Jetton Wallet 간 메시지 전달에 필요한 최소 비용

import { logger } from '@/utils/logger'; * - TON 표준 준수: 1 nanoton이면 충분

import { useLanguage } from '@/hooks/useLanguage'; * 

 * @see https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md

interface DepositProps { */

  walletAddress: string;function buildJettonTransferPayload(

  onSuccess: () => void;  amount: bigint,

}  destination: Address,

  responseTo: Address

/**): string {

 * Jetton Transfer Payload 구성 (TEP-74 표준 준수)  const cell = beginCell()

 */    .storeUint(0xf8a7ea5, 32)      // Jetton transfer opcode (TEP-74 표준)

function buildJettonTransferPayload(    .storeUint(0, 64)              // query_id:uint64

  amount: bigint,    .storeCoins(amount)            // amount:(VarUInteger 16)

  destination: Address,    .storeAddress(destination)     // destination:MsgAddress

  responseTo: Address    .storeAddress(responseTo)      // response_destination:MsgAddress

): string {    .storeBit(0)                   // custom_payload:(Maybe ^Cell) = none

  const cell = beginCell()    .storeCoins(BigInt(1))         // ✅ forward_ton_amount = 1 nanoton (MVP 검증값)

    .storeUint(0xf8a7ea5, 32)    .storeBit(0)                   // forward_payload:(Either Cell ^Cell) = none

    .storeUint(0, 64)    .endCell();

    .storeCoins(amount)  return cell.toBoc().toString('base64');

    .storeAddress(destination)}

    .storeAddress(responseTo)

    .storeBit(0)export function Deposit({ walletAddress, onSuccess }: DepositProps) {

    .storeCoins(BigInt(1))  const { t } = useLanguage();

    .storeBit(0)  const [tonConnectUI] = useTonConnectUI();

    .endCell();  const [amount, setAmount] = useState('10');

  return cell.toBoc().toString('base64');  const [isLoading, setIsLoading] = useState(false);

}  const [error, setError] = useState<string | null>(null);

  const [showDebugLog, setShowDebugLog] = useState(false);

export function Deposit({ walletAddress, onSuccess }: DepositProps) {

  const { t } = useLanguage();  const handleDeposit = async () => {

  const [tonConnectUI] = useTonConnectUI();    try {

  const [open, setOpen] = useState(false);      setIsLoading(true);

  const [amount, setAmount] = useState('10');      setError(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);      const depositAmount = parseFloat(amount);

      if (isNaN(depositAmount) || depositAmount <= 0) {

  const handleOpen = () => {        throw new Error('잘못된 금액입니다');

    setOpen(true);      }

    setError(null);

  };      logger.info('=== Deposit 시작 ===');

      logger.info(`입금 금액: ${depositAmount} CSPIN`);

  const handleClose = () => {      logger.info(`사용자 지갑: ${walletAddress}`);

    if (!isLoading) {      logger.info(`게임 TON 지갑: ${GAME_WALLET_ADDRESS}`);

      setOpen(false);      logger.info(`게임 Jetton 지갑: ${GAME_JETTON_WALLET}`);

      setError(null);      logger.info(`CSPIN Token Master: ${CSPIN_TOKEN_ADDRESS}`);

    }

  };      // ✅ 사용자의 CSPIN Jetton Wallet 주소를 동적으로 계산

      logger.info('사용자의 Jetton Wallet 계산 중...');

  const handleDeposit = async () => {      

    try {      // TonClient 생성 (Jetton Wallet 주소 계산용)

      setIsLoading(true);      const tonClient = new TonClient({

      setError(null);        endpoint: 'https://toncenter.com/api/v2/jsonRPC',

      });

      const depositAmount = parseFloat(amount);

      if (isNaN(depositAmount) || depositAmount <= 0) {      const userAddress = Address.parse(walletAddress);

        throw new Error(t.errors.invalidAmount || '잘못된 금액입니다');      const masterAddress = Address.parse(CSPIN_TOKEN_ADDRESS);

      }      const jettonMaster = tonClient.open(JettonMaster.create(masterAddress));

      

      logger.info('=== Deposit 시작 ===');      const userJettonWalletAddress = await jettonMaster.getWalletAddress(userAddress);

      logger.info(`입금 금액: ${depositAmount} CSPIN`);      const userJettonWalletRaw = userJettonWalletAddress.toString({ 

        urlSafe: true, 

      // 사용자의 CSPIN Jetton Wallet 주소 계산        bounceable: true  // ✅ Jetton Transfer는 bounceable 주소 사용 필수!

      const tonClient = new TonClient({      });

        endpoint: 'https://toncenter.com/api/v2/jsonRPC',

      });      logger.info(`✅ 사용자 Jetton Wallet: ${userJettonWalletRaw}`);



      const userAddress = Address.parse(walletAddress);      // 입금 금액 계산 (nano 단위)

      const masterAddress = Address.parse(CSPIN_TOKEN_ADDRESS);      const amountNano = BigInt(Math.floor(depositAmount * 1_000_000_000));

      const jettonMaster = tonClient.open(JettonMaster.create(masterAddress));      logger.debug(`nano 단위 금액: ${amountNano.toString()}`);

      

      const userJettonWalletAddress = await jettonMaster.getWalletAddress(userAddress);      // ✅ 백엔드 API를 통한 CSPIN 잔액 확인 (TonCenter API Key 사용)

      const userJettonWalletRaw = userJettonWalletAddress.toString({       logger.info('CSPIN 잔액 확인 중...');

        urlSafe: true,       try {

        bounceable: true        const balanceResponse = await fetch('/api/check-balance', {

      });          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

      logger.info(`✅ 사용자 Jetton Wallet: ${userJettonWalletRaw}`);          body: JSON.stringify({ jettonWalletAddress: userJettonWalletRaw }),

        });

      // 잔액 확인

      try {        const balanceData = await balanceResponse.json() as {

        const balanceResponse = await fetch('/api/check-balance', {          success?: boolean;

          method: 'POST',          balance?: string;

          headers: { 'Content-Type': 'application/json' },          balanceCSPIN?: number;

          body: JSON.stringify({ jettonWalletAddress: userJettonWalletRaw }),          error?: string;

        });          message?: string;

        };

        const balanceData = await balanceResponse.json() as {

          success?: boolean;        logger.debug('잔액 확인 응답:', balanceData);

          balance?: string;

          balanceCSPIN?: number;        // Jetton Wallet이 초기화되지 않은 경우

          error?: string;        if (balanceData.error === 'Jetton Wallet not initialized') {

        };          throw new Error(

            `❌ CSPIN 토큰을 보유하고 있지 않습니다.\n\n` +

        if (balanceData.error === 'Jetton Wallet not initialized') {            `먼저 CSPIN 토큰을 구매하거나 받아야 합니다.\n` +

          throw new Error(            `현재 잔액: 0 CSPIN\n\n` +

            `❌ CSPIN 토큰을 보유하고 있지 않습니다.\n\n` +            `💡 CSPIN 토큰 구매 방법:\n` +

            `먼저 CSPIN 토큰을 구매하거나 받아야 합니다.`            `1. DEX(탈중앙화 거래소)에서 구매\n` +

          );            `2. 다른 사용자에게서 전송 받기`

        }          );

        }

        if (!balanceResponse.ok || !balanceData.success) {

          throw new Error(balanceData.error || '잔액 확인 실패');        if (!balanceResponse.ok || !balanceData.success) {

        }          throw new Error(balanceData.error || '잔액 확인 실패');

        }

        const currentBalance = Number(balanceData.balance || 0);

        const balanceCSPIN = balanceData.balanceCSPIN || 0;        const currentBalance = Number(balanceData.balance || 0);

        const amountNano = BigInt(Math.floor(depositAmount * 1_000_000_000));        const balanceCSPIN = balanceData.balanceCSPIN || 0;



        if (currentBalance < Number(amountNano)) {        logger.info(`현재 CSPIN 잔액: ${balanceCSPIN} CSPIN`);

          throw new Error(

            `❌ CSPIN 잔액이 부족합니다.\n\n` +        if (currentBalance < Number(amountNano)) {

            `필요: ${depositAmount} CSPIN\n` +          throw new Error(

            `현재: ${balanceCSPIN} CSPIN`            `❌ CSPIN 잔액이 부족합니다.\n\n` +

          );            `필요: ${depositAmount} CSPIN\n` +

        }            `현재: ${balanceCSPIN} CSPIN\n` +

            `부족: ${depositAmount - balanceCSPIN} CSPIN`

        logger.info('✅ CSPIN 잔액 충분');          );

      } catch (balanceError) {        }

        if (balanceError instanceof Error) {

          if (balanceError.message.includes('부족') || balanceError.message.includes('보유하고 있지 않습니다')) {        logger.info('✅ CSPIN 잔액 충분');

            throw balanceError;      } catch (balanceError) {

          }        logger.error('잔액 확인 실패:', balanceError);

        }

        logger.warn('⚠️ 잔액 확인 실패, 트랜잭션은 계속 진행');        if (balanceError instanceof Error) {

      }          // 잔액 부족이나 토큰 미보유 에러는 사용자에게 명확히 표시

          if (balanceError.message.includes('부족') || balanceError.message.includes('보유하고 있지 않습니다')) {

      // 트랜잭션 생성            throw balanceError;

      const amountNano = BigInt(Math.floor(depositAmount * 1_000_000_000));          }

      const gameWalletAddress = Address.parse(GAME_WALLET_ADDRESS);        }

      const responseAddress = Address.parse(walletAddress);

        // 기타 네트워크 에러는 경고만 표시하고 진행

      const payloadBase64 = buildJettonTransferPayload(        logger.warn('⚠️ 잔액 확인 실패, 트랜잭션은 계속 진행 (지갑에서 최종 검증)');

        amountNano,      }

        gameWalletAddress,

        responseAddress      // 주소 파싱 및 변환

      );      // ✅ destination: 게임의 TON 지갑 주소 (MVP 검증된 방식)

      //    - Jetton Transfer의 destination은 수신자의 TON 지갑 주소

      const transaction = {      //    - Jetton Wallet 컨트랙트가 자동으로 수신자의 Jetton Wallet을 찾아 전송

        validUntil: Math.floor(Date.now() / 1000) + 300,      let gameWalletAddress: Address;

        messages: [      let responseAddress: Address;

          {      

            address: userJettonWalletRaw,      try {

            amount: toNano('0.2').toString(),        gameWalletAddress = Address.parse(GAME_WALLET_ADDRESS);  // ✅ 게임의 TON 지갑

            payload: payloadBase64,        responseAddress = Address.parse(walletAddress);

          },        

        ],        logger.debug('파싱된 게임 TON 지갑:', gameWalletAddress.toString());

      };        logger.debug('파싱된 응답 지갑 (사용자):', responseAddress.toString());

      } catch (err) {

      logger.debug('트랜잭션 전송...');        logger.error('주소 파싱 오류:', err);

      const result = await tonConnectUI.sendTransaction(transaction);        throw new Error('주소 형식이 올바르지 않습니다');

      logger.info('트랜잭션 결과:', result);      }



      // 백엔드 검증      // Jetton Transfer 페이로드 생성

      try {      // destination: 게임의 TON 지갑 (UQBFPDdSlPgq...)

        await verifyDeposit({       // response_destination: 사용자 지갑 (잉여 TON 반환용)

          walletAddress,       const payloadBase64 = buildJettonTransferPayload(

          txHash: result.boc,        amountNano,

          amount: depositAmount        gameWalletAddress,  // ✅ 게임의 TON 지갑 (MVP 검증 방식)

        });        responseAddress

        logger.info('=== Deposit 완료 ===');      );

        alert(`✅ ${depositAmount} CSPIN ${t.deposit.success || '입금 성공'}`);      logger.debug(`페이로드 생성 완료 (base64): ${payloadBase64.substring(0, 50)}...`);

        handleClose();

        onSuccess();      // TON Connect 트랜잭션

      } catch (verifyError) {      // ✅ 사용자의 Jetton Wallet으로 메시지 전송 (MVP 검증 방식)

        logger.error('입금 검증 실패:', verifyError);      // - address: 사용자의 Jetton Wallet (메시지를 받는 컨트랙트)

        alert(      // - payload 내부의 destination: 게임의 TON 지갑 (실제 토큰 수신자의 TON 주소)

          `⚠️ 트랜잭션은 전송되었으나 검증에 실패했습니다.\n\n` +      // - Jetton Wallet 컨트랙트가 자동으로 destination의 Jetton Wallet을 찾아 전송

          `${depositAmount} CSPIN이 블록체인에 전송되었습니다.\n` +      // - 전체 비용: 0.2 TON (MVP 검증된 안전한 값)

          `잠시 후 크레딧이 자동으로 업데이트될 수 있습니다.`      const transaction = {

        );        validUntil: Math.floor(Date.now() / 1000) + 300, // 5분

        handleClose();        messages: [

        onSuccess();          {

      }            address: userJettonWalletRaw, // ✅ 사용자의 Jetton Wallet 주소

    } catch (err) {            amount: toNano('0.2').toString(), // ✅ 0.2 TON (MVP 검증값)

      logger.error('Deposit 실패:', err);            payload: payloadBase64,

      setError(err instanceof Error ? err.message : t.errors.depositFailed || '입금 실패');          },

    } finally {        ],

      setIsLoading(false);      };

    }

  };      logger.debug('트랜잭션 전송:', {

        validUntil: transaction.validUntil,

  return (        currentTime: Math.floor(Date.now() / 1000),

    <>        timeDiff: transaction.validUntil - Math.floor(Date.now() / 1000),

      <Button        address: userJettonWalletRaw,

        variant="contained"        amount: transaction.messages[0]?.amount || '0',

        color="success"      });

        size="large"

        fullWidth      const result = await tonConnectUI.sendTransaction(transaction);

        startIcon={<AccountBalanceWalletIcon />}      logger.info('트랜잭션 결과:', result);

        onClick={handleOpen}      

        sx={{ py: 1.5 }}      // 트랜잭션 해시

      >      const txHash = result.boc;

        {t.buttons.deposit || '입금'}

      </Button>      // 백엔드에 입금 확인 요청 (입금 금액 포함)

      logger.info('백엔드 입금 확인 요청...');

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>      logger.info('Request payload:', { walletAddress, txHash: txHash.substring(0, 50), amount: depositAmount });

        <DialogTitle>      

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>      try {

            <AccountBalanceWalletIcon color="success" />        await verifyDeposit({ 

            <Typography variant="h6">{t.deposit.title || '💰 CSPIN 입금'}</Typography>          walletAddress, 

          </Box>          txHash,

        </DialogTitle>          amount: depositAmount  // ✅ 입금 금액 전달

        });

        <DialogContent>        logger.info('=== Deposit 완료 ===');

          <Box sx={{ pt: 2 }}>        alert(`✅ ${t.deposit.success}\n\n${depositAmount} CSPIN`);

            <TextField        onSuccess();

              label={t.deposit.amount || '입금 금액'}      } catch (verifyError) {

              type="number"        logger.error('입금 검증 실패:', verifyError);

              value={amount}        // ⚠️ 검증 실패해도 트랜잭션은 이미 전송됨

              onChange={(e) => setAmount(e.target.value)}        alert(

              fullWidth          `⚠️ 트랜잭션은 전송되었으나 검증에 실패했습니다.\n\n` +

              InputProps={{          `${depositAmount} CSPIN이 블록체인에 전송되었습니다.\n` +

                endAdornment: <InputAdornment position="end">CSPIN</InputAdornment>,          `잠시 후 크레딧이 자동으로 업데이트될 수 있습니다.\n\n` +

              }}          `문제가 지속되면 관리자에게 문의하세요.`

              disabled={isLoading}        );

              autoFocus        onSuccess(); // 크레딧 새로고침 시도

            />      }

    } catch (err) {

            {error && (      logger.error('Deposit 실패:', err);

              <Alert severity="error" sx={{ mt: 2 }}>      setError(err instanceof Error ? err.message : t.deposit.error);

                {error}    } finally {

              </Alert>      setIsLoading(false);

            )}    }

  };

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>

              💡 트랜잭션 수수료: ~0.2 TON  return (

            </Typography>    <>

          </Box>      <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">

        </DialogContent>        <h3 className="text-2xl font-bold text-white mb-4">💰 {t.deposit.title}</h3>

        

        <DialogActions>        <div className="space-y-4">

          <Button onClick={handleClose} disabled={isLoading}>          <div>

            {t.buttons.cancel || '취소'}            <label className="block text-sm text-gray-300 mb-2">{t.deposit.amount}</label>

          </Button>            <input

          <Button              type="number"

            onClick={handleDeposit}              value={amount}

            variant="contained"              onChange={(e) => setAmount(e.target.value)}

            color="success"              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"

            disabled={isLoading}              placeholder="10"

            startIcon={isLoading ? <CircularProgress size={20} /> : null}            />

          >          </div>

            {isLoading ? (t.deposit.processing || '처리 중...') : (t.buttons.deposit || '입금')}

          </Button>          <button

        </DialogActions>            onClick={handleDeposit}

      </Dialog>            disabled={isLoading}

    </>            className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-bold text-white hover:shadow-lg transition disabled:opacity-50"

  );          >

}            {isLoading ? t.deposit.processing : t.buttons.deposit}

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
