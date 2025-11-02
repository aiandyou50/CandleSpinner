/**
 * Jetton Wallet 주소 계산 스크립트
 * 게임 지갑의 CSPIN Jetton Wallet 주소를 계산합니다
 */

import { TonClient, Address } from '@ton/ton';
import { JettonMaster } from '@ton/ton';

async function calculateJettonWallet() {
  try {
    console.log('=== Jetton Wallet 주소 계산 시작 ===\n');

    // 설정
    const GAME_WALLET = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';
    const JETTON_MASTER = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';

    console.log('입력:');
    console.log('  게임 지갑:', GAME_WALLET);
    console.log('  Jetton Master:', JETTON_MASTER);
    console.log();

    // TonClient 초기화
    const client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC'
    });

    // 주소 파싱
    const gameWalletAddr = Address.parse(GAME_WALLET);
    const jettonMasterAddr = Address.parse(JETTON_MASTER);

    console.log('파싱된 주소:');
    console.log('  게임 지갑 (bounceable):', gameWalletAddr.toString({ bounceable: true }));
    console.log('  게임 지갑 (non-bounceable):', gameWalletAddr.toString({ bounceable: false }));
    console.log();

    // JettonMaster 컨트랙트 열기
    const jettonMaster = client.open(JettonMaster.create(jettonMasterAddr));

    // Jetton Wallet 주소 계산
    console.log('Jetton Wallet 주소 계산 중...\n');
    const jettonWalletAddr = await jettonMaster.getWalletAddress(gameWalletAddr);

    console.log('=== 결과 ===');
    console.log('Jetton Wallet 주소 (bounceable):', jettonWalletAddr.toString({ bounceable: true, urlSafe: true }));
    console.log('Jetton Wallet 주소 (non-bounceable):', jettonWalletAddr.toString({ bounceable: false, urlSafe: true }));
    console.log('\n.env에 추가할 내용:');
    console.log(`VITE_CSPIN_JETTON_WALLET=${jettonWalletAddr.toString({ bounceable: true, urlSafe: true })}`);

  } catch (error) {
    console.error('오류 발생:', error.message);
    console.error(error);
    process.exit(1);
  }
}

calculateJettonWallet();
