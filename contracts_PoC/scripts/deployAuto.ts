import { toNano } from '@ton/core';
import { CSPINWithdrawalAuto } from '../wrappers/CSPINWithdrawalAuto';
import { NetworkProvider } from '@ton/blueprint';
import { Address } from '@ton/core';

export async function run(provider: NetworkProvider) {
    console.log('\n🚀 CSPINWithdrawalAuto 자동화 컨트랙트 배포\n');

    // Jetton Master Address (CSPIN)
    const jettonMasterAddress = Address.parse('EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV');
    
    // Game's Jetton Wallet Address
    const gameJettonWalletAddress = Address.parse('EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs');
    
    // 이 컨트랙트의 Jetton Wallet 주소를 계산해야 함
    // 배포 후 확인하여 UpdateContractWallet 메시지로 업데이트
    const placeholderJettonWallet = Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');

    const cspinWithdrawalAuto = provider.open(await CSPINWithdrawalAuto.fromInit(
        provider.sender().address!,
        jettonMasterAddress,
        gameJettonWalletAddress,
        placeholderJettonWallet
    ));

    console.log('📋 배포 정보:');
    console.log('   - Owner:', provider.sender().address);
    console.log('   - Jetton Master:', jettonMasterAddress);
    console.log('   - Game Jetton Wallet:', gameJettonWalletAddress);
    console.log('   - 컨트랙트 주소:', cspinWithdrawalAuto.address);
    console.log('   - 초기 TON:', '0.5');
    
    console.log('\n⚠️  주의: 배포 후 이 컨트랙트의 Jetton Wallet 주소를 확인해야 합니다');
    console.log('   Jetton Wallet 주소 계산 방법:');
    console.log('   https://tonscan.org/jetton/' + jettonMasterAddress);
    console.log('   위 페이지에서 컨트랙트 주소로 검색\n');

    await cspinWithdrawalAuto.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(cspinWithdrawalAuto.address);

    console.log('\n✅ 배포 완료!');
    console.log('\n📌 다음 단계:');
    console.log('   1. 이 컨트랙트의 Jetton Wallet 주소 확인');
    console.log('   2. UpdateContractWallet 메시지로 업데이트');
    console.log('   3. 게임 백엔드에서 Jetton 전송 테스트\n');
}
