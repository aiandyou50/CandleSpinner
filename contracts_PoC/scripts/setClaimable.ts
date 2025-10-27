import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { CSPINWithdrawalSecure } from '../build/CSPINWithdrawalSecure/CSPINWithdrawalSecure_CSPINWithdrawalSecure';

export async function run(provider: NetworkProvider) {
    const contractAddress = await provider.ui().input('컨트랙트 주소:');
    const userAddress = await provider.ui().input('사용자 주소:');
    const amount = await provider.ui().input('금액 (CSPIN):');
    
    const contract = provider.open(
        CSPINWithdrawalSecure.fromAddress(Address.parse(contractAddress))
    );

    console.log('\n💰 Claimable 금액 설정 중...');
    console.log(`   사용자: ${userAddress}`);
    console.log(`   금액: ${amount} CSPIN\n`);
    
    await contract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'SetClaimable',
            user: Address.parse(userAddress),
            amount: BigInt(Number(amount) * 1000000000)  // CSPIN to nanoCSPIN
        }
    );

    console.log('✅ 설정 완료!');
    console.log(`🎉 ${userAddress}가 ${amount} CSPIN을 인출할 수 있습니다.\n`);
}
