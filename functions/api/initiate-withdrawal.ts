const TonWeb = require('tonweb');

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
      const cspinMasterContract = env.CSPIN_MASTER_CONTRACT || 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';

      if (!gameWalletPrivateKey) {
        throw new Error('게임 월렛 프라이빗 키가 설정되지 않았습니다.');
      }

      // TonWeb 초기화
      const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
        apiKey: env.TONCENTER_API_KEY || undefined
      }));

      // 게임 월렛 키페어 생성
      const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSecretKey(TonWeb.utils.hexToBytes(gameWalletPrivateKey));
      const wallet = tonweb.wallet.create({ publicKey: keyPair.publicKey });

      // 수신자 주소
      const recipientAddress = new TonWeb.utils.Address(walletAddress);

      // CSPIN 마스터 컨트랙트 주소
      const cspinMasterAddress = new TonWeb.utils.Address(cspinMasterContract);

      // CSPIN Jetton Minter 생성
      const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonweb.provider, {
        address: cspinMasterAddress
      });

      // 게임 월렛의 CSPIN Jetton 월렛 주소 계산
      const gameJettonWalletAddress = await jettonMinter.getJettonWalletAddress(wallet.address);

      // Jetton 월렛 인스턴스 생성
      const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider, {
        address: gameJettonWalletAddress
      });

      // Jetton 전송
      const transfer = jettonWallet.transfer(
        keyPair.secretKey,
        recipientAddress,
        TonWeb.utils.toNano(withdrawalAmount.toString()),
        null, // query_id
        TonWeb.utils.toNano('0.01'), // forward_ton_amount
        wallet.address // response_destination
      );

      await transfer.send();

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

    } catch (blockchainError: any) {
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

  } catch (error: any) {
    console.error('Initiate withdrawal error:', error);
    return new Response(JSON.stringify({
      error: '인출 요청 처리 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
