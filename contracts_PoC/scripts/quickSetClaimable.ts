import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { CSPINWithdrawalSecure } from '../build/CSPINWithdrawalSecure/CSPINWithdrawalSecure_CSPINWithdrawalSecure';

export async function run(provider: NetworkProvider) {
    console.log('\n💰 빠른 SetClaimable 실행\n');
    
    // 하드코딩된 값 사용
    const contractAddress = 'EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg';
    const userAddress = '0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g';
    const amount = 100; // CSPIN

    console.log(`📍 컨트랙트: ${contractAddress}`);
    console.log(`👤 사용자: ${userAddress}`);
    console.log(`💎 금액: ${amount} CSPIN\n`);

    const contract = provider.open(
        CSPINWithdrawalSecure.fromAddress(Address.parse(contractAddress))
    );

    await contract.send(
        provider.sender(),
        { value: toNano('0.05') },
        {
            $$type: 'SetClaimable',
            user: Address.parse(userAddress),
            amount: BigInt(amount * 1_000_000_000) // CSPIN to nanoCSPIN
        }
    );

    console.log('✅ SetClaimable 트랜잭션 전송 완료!');
    console.log('⏳ Tonkeeper에서 승인해주세요...\n');
}
