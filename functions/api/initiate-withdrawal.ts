import { Address, toNano, beginCell } from '@ton/core';
import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { keyPairFromSecretKey } from '@ton/crypto';

interface UserState {
  credit: number;
  canDoubleUp: boolean;
  pendingWinnings: number;
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const { walletAddress }: { walletAddress: string } = await request.json();

    // KV에서 사용자 상태 가져오기
    const stateKey = `user_${walletAddress}`;
    const stateData = await env.CREDIT_KV.get(stateKey);
    const state: UserState = stateData ? JSON.parse(stateData) : {
      credit: 0,
      canDoubleUp: false,
      pendingWinnings: 0
    };

    const withdrawalAmount = state.credit;

    if (withdrawalAmount <= 0) {
      return new Response(JSON.stringify({
        error: '인출할 수 있는 크레딧이 없습니다.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 실제 CSPIN 토큰 전송 로직
    try {
      // 환경 변수에서 게임 월렛 정보 가져오기
      const gameWalletPrivateKey = env.GAME_WALLET_PRIVATE_KEY;
      const cspinMasterContract = env.CSPIN_MASTER_CONTRACT || 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV'; // 기본값 제공

      if (!gameWalletPrivateKey || !cspinMasterContract) {
        throw new Error('게임 월렛 설정이 완료되지 않았습니다.');
      }

      // TON 클라이언트 초기화 (메인넷)
      const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: env.TONCENTER_API_KEY || undefined
      });

      // 게임 월렛 키페어 생성
      const keyPair = keyPairFromSecretKey(Buffer.from(gameWalletPrivateKey, 'hex'));
      const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0
      });

      const walletContract = client.open(wallet);
      const walletAddressObj = wallet.address;

      // 수신자 주소
      const recipientAddress = Address.parse(walletAddress);

      // CSPIN 마스터 컨트랙트 주소
      const cspinMasterAddress = Address.parse(cspinMasterContract);

      // 게임 월렛의 CSPIN Jetton 월렛 주소 계산
      const jettonWalletAddress = await client.runMethod(
        cspinMasterAddress,
        'get_wallet_address',
        [{
          type: 'slice',
          cell: beginCell().storeAddress(walletAddressObj).endCell()
        }]
      );

      const gameJettonWalletAddress = jettonWalletAddress.stack.readAddress();

      // Jetton 전송 메시지 생성
      const transferMessage = beginCell()
        .storeUint(0xf8a7ea5, 32) // op: transfer
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(withdrawalAmount.toString())) // amount
        .storeAddress(recipientAddress) // destination
        .storeAddress(walletAddressObj) // response_destination
        .storeBit(false) // custom_payload
        .storeCoins(toNano('0.01')) // forward_ton_amount
        .storeBit(false) // forward_payload
        .endCell();

      // 게임 월렛에서 Jetton 월렛으로 전송 메시지 전송
      const seqno = await walletContract.getSeqno();
      const transfer = walletContract.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
          internal({
            to: gameJettonWalletAddress,
            value: toNano('0.05'), // TON 수수료
            body: transferMessage
          })
        ]
      });

      // 트랜잭션 전송
      await walletContract.send(transfer);

      // KV에서 크레딧 차감
      state.credit = 0;
      state.canDoubleUp = false;
      state.pendingWinnings = 0;

      // KV에 상태 저장
      await env.CREDIT_KV.put(stateKey, JSON.stringify(state));

      return new Response(JSON.stringify({
        success: true,
        withdrawalAmount,
        newCredit: state.credit,
        message: `✅ 실제 CSPIN 토큰 ${withdrawalAmount}개가 ${walletAddress}로 전송되었습니다.`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (blockchainError) {
      console.error('Blockchain transfer error:', blockchainError);

      // 블록체인 오류 발생 시 크레딧을 유지하고 오류 반환
      return new Response(JSON.stringify({
        error: `블록체인 전송 실패: ${blockchainError.message}`,
        withdrawalAmount: 0,
        newCredit: state.credit
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Initiate withdrawal error:', error);
    return new Response(JSON.stringify({
      error: '인출 요청 처리 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}