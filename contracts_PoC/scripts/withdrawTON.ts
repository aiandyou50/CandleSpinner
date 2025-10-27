import { toNano, Address } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { CSPINWithdrawalSecure } from '../build/CSPINWithdrawalSecure/CSPINWithdrawalSecure_CSPINWithdrawalSecure';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    
    const address = Address.parse(await ui.input('컨트랙트 주소'));
    const amountStr = await ui.input('인출할 TON 금액 (예: 0.5)');
    const amount = toNano(amountStr);
    
    const contract = provider.open(CSPINWithdrawalSecure.fromAddress(address));
    
    await contract.send(
        provider.sender(),
        { value: toNano('0.05') },
        {
            $$type: 'WithdrawTON',
            amount: amount
        }
    );
    
    ui.write('✅ TON 인출 요청 전송 완료!');
    ui.write(`💰 ${amountStr} TON이 Owner 지갑으로 전송됩니다`);
}
