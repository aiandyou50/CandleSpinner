/**
 * 사용자의 CSPIN Jetton Wallet 주소 계산
 * 
 * 목적: 사용자가 트랜잭션을 보낼 정확한 주소 찾기
 */

import { TonClient, Address, JettonMaster } from '@ton/ton';

const client = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
});

// 사용자 지갑 주소 (예시 - 실제로는 TON Connect에서 받음)
const USER_WALLET = process.argv[2] || 'UQCsQJHqi3TtqOFiEP2caPEGQvMnpwz4sz6E760UjOQaKOSE';
const CSPIN_MASTER = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';

console.log('=== 사용자의 Jetton Wallet 계산 ===\n');
console.log('입력:');
console.log(`  사용자 지갑: ${USER_WALLET}`);
console.log(`  Jetton Master: ${CSPIN_MASTER}\n`);

async function calculateUserJettonWallet() {
  try {
    const userAddress = Address.parse(USER_WALLET);
    const masterAddress = Address.parse(CSPIN_MASTER);
    
    const jettonMaster = client.open(JettonMaster.create(masterAddress));
    const userJettonWalletAddress = await jettonMaster.getWalletAddress(userAddress);
    
    console.log('=== 결과 ===');
    console.log(`사용자의 Jetton Wallet (bounceable): ${userJettonWalletAddress.toString({ bounceable: true, urlSafe: true })}`);
    console.log(`사용자의 Jetton Wallet (non-bounceable): ${userJettonWalletAddress.toString({ bounceable: false, urlSafe: true })}`);
    
    console.log('\n✅ 트랜잭션에 사용할 주소:');
    console.log(`  transaction.messages[0].address = "${userJettonWalletAddress.toString({ bounceable: false, urlSafe: true })}"`);
    
    console.log('\n📝 Payload 내용:');
    console.log('  - destination: 게임 운영 지갑 (UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd)');
    console.log('  - response_destination: 사용자 지갑');
    console.log('  - amount: 입금할 CSPIN 수량\n');
    
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

calculateUserJettonWallet();
