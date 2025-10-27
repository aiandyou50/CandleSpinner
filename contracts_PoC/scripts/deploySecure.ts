import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { CSPINWithdrawalSecure } from '../build/CSPINWithdrawalSecure/CSPINWithdrawalSecure_CSPINWithdrawalSecure';

export async function run(provider: NetworkProvider) {
    const network = provider.network();
    const isTestnet = network === 'testnet';

    console.log('\n🚀 CSPINWithdrawalSecure 스마트 컨트랙트 배포 (보안 강화 버전)');
    console.log(`📍 네트워크: ${isTestnet ? 'Testnet' : 'Mainnet'}\n`);

    console.log('🔒 보안 기능:');
    console.log('   ✅ 긴급 정지 (Pause/Unpause)');
    console.log('   ✅ 게임 Jetton Wallet 업데이트');
    console.log('   ✅ 최대 인출 제한 (1,000,000 CSPIN)');
    console.log('   ✅ TON 인출 기능 (최소 0.1 TON 유지)\n');

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
        await CSPINWithdrawalSecure.fromInit(
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

    // 컨트랙트 정보 조회
    try {
        console.log('🔍 컨트랙트 상태 확인 중...');
        const info = await cspinWithdrawal.getContractInfo();
        const isPaused = await cspinWithdrawal.getIsPaused();
        
        console.log(`   Owner: ${info.owner.toString()}`);
        console.log(`   Jetton Master: ${info.jettonMaster.toString()}`);
        console.log(`   Game Jetton Wallet: ${info.gameJettonWallet.toString()}`);
        console.log(`   Paused: ${isPaused ? '일시정지됨' : '활성화됨'}`);
        console.log(`   최대 인출: ${Number(info.maxSingleWithdraw) / 1000000000} CSPIN\n`);
    } catch (e) {
        console.log('   (컨트랙트가 아직 활성화되지 않았습니다)\n');
    }

    // 관리자 명령어 안내
    console.log('🎛️  관리자 명령어:');
    console.log('   일시정지: npx blueprint run pauseContract --testnet');
    console.log('   재개: npx blueprint run unpauseContract --testnet\n');

    // 프론트엔드 설정 안내
    console.log('💻 프론트엔드 설정:');
    console.log(`   frontend-poc/index.html 파일에서`);
    console.log(`   CONTRACT_ADDRESS를 다음으로 변경:`);
    console.log(`   '${cspinWithdrawal.address.toString()}'\n`);
}
