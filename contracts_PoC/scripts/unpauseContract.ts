import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { CSPINWithdrawalSecure } from '../build/CSPINWithdrawalSecure/CSPINWithdrawalSecure_CSPINWithdrawalSecure';

export async function run(provider: NetworkProvider) {
    const contractAddress = await provider.ui().input('컨트랙트 주소:');
    
    const contract = provider.open(
        CSPINWithdrawalSecure.fromAddress(Address.parse(contractAddress))
    );

    console.log('\n▶️  컨트랙트 재개 중...');
    
    await contract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        'unpause'
    );

    console.log('✅ 재개 완료!');
    console.log('🎉 인출이 다시 가능합니다.\n');
}
