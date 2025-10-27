import { Address, toNano } from '@ton/core';
import { compile, NetworkProvider } from '@ton/blueprint';
import { CSPINWithdrawal } from '../build/CSPINWithdrawal/CSPINWithdrawal_CSPINWithdrawal';

export async function run(provider: NetworkProvider) {
    const network = provider.network();
    const isTestnet = network === 'testnet';

    console.log('\n🚀 CSPINWithdrawal 스마트 컨트랙트 배포');
    console.log(`📍 네트워크: ${isTestnet ? 'Testnet' : 'Mainnet'}\n`);

    // 배포 정보 입력
    const ownerAddress = await provider.ui().input('관리자 주소 (Owner):');
    const jettonMaster = await provider.ui().input('CSPIN Jetton Master:');
    const gameJettonWallet = await provider.ui().input('게임 Jetton Wallet:');

    console.log('\n📝 배포 정보:');
    console.log(`   Owner: ${ownerAddress}`);
    console.log(`   Jetton Master: ${jettonMaster}`);
    console.log(`   Game Jetton Wallet: ${gameJettonWallet}\n`);

    // 컨트랙트 생성
    const cspinWithdrawal = provider.open(
        await CSPINWithdrawal.fromInit(
            Address.parse(ownerAddress),
            Address.parse(jettonMaster),
            Address.parse(gameJettonWallet)
        )
    );

    // 배포
    console.log('🚀 배포 중...');
    await cspinWithdrawal.send(
        provider.sender(),
        {
            value: toNano('0.1'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(cspinWithdrawal.address);

    console.log('\n✅ 배포 완료!\n');
    console.log('📊 컨트랙트 정보:');
    console.log(`   주소: ${cspinWithdrawal.address.toString()}`);
    console.log(`   네트워크: ${isTestnet ? 'Testnet' : 'Mainnet'}`);
    console.log(`   시간: ${new Date().toISOString()}\n`);

    if (isTestnet) {
        console.log('🔗 Tonscan:');
        console.log(`   https://testnet.tonscan.org/address/${cspinWithdrawal.address.toString()}\n`);
    } else {
        console.log('🔗 Tonscan:');
        console.log(`   https://tonscan.org/address/${cspinWithdrawal.address.toString()}\n`);
    }

    // Get 메서드 테스트
    try {
        console.log('🔍 컨트랙트 정보 조회 중...');
        const info = await cspinWithdrawal.getContractInfo();
        console.log(`   Owner: ${info.owner.toString()}`);
        console.log(`   Jetton Master: ${info.jettonMaster.toString()}`);
        console.log(`   Game Jetton Wallet: ${info.gameJettonWallet.toString()}\n`);
    } catch (e) {
        console.log('   (컨트랙트가 아직 활성화되지 않았습니다)\n');
    }
}
