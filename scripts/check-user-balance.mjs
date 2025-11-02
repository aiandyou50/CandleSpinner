/**
 * 사용자의 CSPIN Jetton Wallet 잔액 확인
 * 
 * 목적: 트랜잭션 실패 원인 확인
 */

import { TonClient, Address, JettonMaster } from '@ton/ton';

const USER_WALLET = 'UQCsBJHqi3TtqOFiEP2caPEGQvMnpwz4sz6E760UjOQaKFD_';
const CSPIN_MASTER = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';

console.log('=== CSPIN Jetton Wallet 잔액 확인 ===\n');
console.log(`사용자 지갑: ${USER_WALLET}`);
console.log(`CSPIN Token Master: ${CSPIN_MASTER}\n`);

async function checkBalance() {
  try {
    const client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    });

    const userAddress = Address.parse(USER_WALLET);
    const masterAddress = Address.parse(CSPIN_MASTER);
    
    // 1. 사용자의 Jetton Wallet 주소 계산
    const jettonMaster = client.open(JettonMaster.create(masterAddress));
    const userJettonWalletAddress = await jettonMaster.getWalletAddress(userAddress);
    
    console.log('📍 사용자의 Jetton Wallet:');
    console.log(`  Bounceable: ${userJettonWalletAddress.toString({ bounceable: true, urlSafe: true })}`);
    console.log(`  Non-bounceable: ${userJettonWalletAddress.toString({ bounceable: false, urlSafe: true })}\n`);

    // 2. Jetton Wallet 잔액 조회
    try {
      const jettonWallet = client.open({
        address: userJettonWalletAddress,
        async getBalance() {
          const result = await client.runMethod(userJettonWalletAddress, 'get_wallet_data');
          return result.stack;
        }
      });

      const balance = await jettonWallet.getBalance();
      console.log('💰 CSPIN 잔액:');
      console.log(`  ${balance} 나노CSPIN`);
      console.log(`  ${Number(balance) / 1_000_000_000} CSPIN\n`);

      // 3. TON 잔액 확인
      const tonBalance = await client.getBalance(userAddress);
      console.log('💎 TON 잔액:');
      console.log(`  ${tonBalance} 나노TON`);
      console.log(`  ${Number(tonBalance) / 1_000_000_000} TON\n`);

      // 4. 트랜잭션 요구사항
      console.log('📋 트랜잭션 요구사항:');
      console.log(`  입금 금액: 10 CSPIN (10,000,000,000 나노CSPIN)`);
      console.log(`  네트워크 비용: 0.03 TON (30,000,000 나노TON)`);
      console.log(`  총 필요: 10 CSPIN + 0.03 TON\n`);

      // 5. 충분한지 확인
      const hasEnoughCSPIN = Number(balance) >= 10_000_000_000;
      const hasEnoughTON = Number(tonBalance) >= 30_000_000;

      console.log('✅ 잔액 확인:');
      console.log(`  CSPIN: ${hasEnoughCSPIN ? '✅ 충분' : '❌ 부족'}`);
      console.log(`  TON: ${hasEnoughTON ? '✅ 충분' : '❌ 부족'}\n`);

      if (!hasEnoughCSPIN) {
        console.log('❌ CSPIN 잔액이 부족합니다!');
        console.log(`   현재: ${Number(balance) / 1_000_000_000} CSPIN`);
        console.log(`   필요: 10 CSPIN`);
        console.log(`   부족: ${(10_000_000_000 - Number(balance)) / 1_000_000_000} CSPIN\n`);
      }

      if (!hasEnoughTON) {
        console.log('❌ TON 잔액이 부족합니다!');
        console.log(`   현재: ${Number(tonBalance) / 1_000_000_000} TON`);
        console.log(`   필요: 0.03 TON`);
        console.log(`   부족: ${(30_000_000 - Number(tonBalance)) / 1_000_000_000} TON\n`);
      }

    } catch (balanceError) {
      console.error('❌ 잔액 조회 실패:', balanceError);
      console.log('\n💡 가능한 원인:');
      console.log('  1. Jetton Wallet이 아직 초기화되지 않음 (CSPIN을 한 번도 받지 않음)');
      console.log('  2. 네트워크 오류');
      console.log('  3. Jetton Master 주소가 잘못됨\n');
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

checkBalance();
