import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { CSPINWithdrawalVoucher } from '../wrappers/CSPINWithdrawalVoucher_CSPINWithdrawalVoucher';

export async function run(provider: NetworkProvider) {
    const contractAddress = await provider.ui().input('컨트랙트 주소:');
    
    const contract = provider.open(
        CSPINWithdrawalVoucher.fromAddress(Address.parse(contractAddress))
    );

    console.log('\n⏸️  컨트랙트 일시정지 중...');
    
    await contract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        { $$type: 'Pause' }
    );

    console.log('✅ 일시정지 완료!');
    console.log('⚠️  모든 인출이 중지되었습니다.\n');
}
