import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';

async function checkContractBalance() {
    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    });

    const contractAddress = Address.parse('EQA4Un24XvK12YDl-di6cgCkSHdZxIXMXIZjnA9vpDmqxIWI');

    try {
        console.log('💰 컨트랙트 TON 잔고 확인:\n');
        
        const balance = await client.getBalance(contractAddress);
        console.log('  주소:', contractAddress.toString());
        console.log('  TON 잔고:', Number(balance) / 1e9, 'TON');
        
        if (Number(balance) < 100_000_000n) {  // 0.1 TON
            console.log('\n❌ TON 잔고 부족!');
            console.log('  필요: 0.1 TON (JettonTransfer 전송용)');
            console.log('  현재:', Number(balance) / 1e9, 'TON');
            console.log('\n💡 해결책:');
            console.log('  컨트랙트에 TON을 전송하세요!');
            console.log('  최소 0.5 TON 권장 (여러 번 인출 가능)');
        } else {
            console.log('\n✅ TON 잔고 충분!');
        }

    } catch (error: any) {
        console.error('❌ 오류:', error.message);
    }
}

checkContractBalance();
