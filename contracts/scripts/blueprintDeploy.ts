import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, beginCell, toNano } from '@ton/core';

/**
 * Blueprint 표준 배포 스크립트
 * 
 * 사용 방법:
 *   npx blueprint run blueprintDeploy --testnet
 *   npx blueprint run blueprintDeploy --mainnet
 */

export const run = async (provider: NetworkProvider) => {
    const network = provider.network();
    const networkName = network === 'testnet' ? 'Testnet' : 'Mainnet';

    console.log('\n🚀 WithdrawalManager 스마트컨트랙트 배포');
    console.log(`📍 네트워크: ${networkName}\n`);

    try {
        // 1. 배포자 정보
        const deployer = provider.sender();
        const deployerAddress = deployer.address;

        if (!deployerAddress) {
            throw new Error('❌ 배포자 주소를 얻을 수 없습니다');
        }

        console.log(`👛 배포자: ${deployerAddress.toString()}\n`);

        // 2. 환경 변수 로드
        const cspinJetton = process.env.CSPIN_JETTON;
        const gameWallet = process.env.GAME_JETTON_WALLET;

        if (!cspinJetton || !gameWallet) {
            throw new Error('❌ 환경 변수 누락: CSPIN_JETTON, GAME_JETTON_WALLET');
        }

        const ownerAddress = Address.parse(gameWallet);
        const cspinAddress = Address.parse(cspinJetton);

        console.log('⚙️  환경 변수:');
        console.log(`   CSPIN: ${cspinAddress.toString()}`);
        console.log(`   Owner: ${ownerAddress.toString()}\n`);

        // 3. 스마트컨트랙트 컴파일
        console.log('📦 스마트컨트랙트 컴파일 중...');
        const code = await compile('WithdrawalManager');
        console.log(`✅ 컴파일 완료 (${code.toBoc().length} bytes)\n`);

        // 4. 초기 데이터
        console.log('📝 초기 데이터 생성 중...');
        const initData = beginCell()
            .storeAddress(ownerAddress)
            .storeAddress(cspinAddress)
            .storeBit(false)
            .endCell();
        console.log('✅ 초기 데이터 준비\n');

        // 5. 배포 트랜잭션 생성
        console.log('🚀 배포 진행 중...');
        const deployAmount = toNano('0.05');

        // 배포 메시지 전송
        await deployer.send({
            to: deployerAddress,
            init: {
                code,
                data: initData,
            },
            value: deployAmount,
        });

        console.log('✅ 배포 완료!\n');
        console.log('📊 배포 정보:');
        console.log(`   - 네트워크: ${networkName}`);
        console.log(`   - 배포자: ${deployerAddress.toString()}`);
        console.log(`   - 배포 비용: 0.05 TON`);
        console.log(`   - 시간: ${new Date().toISOString()}\n`);

    } catch (error) {
        console.error(`\n❌ 배포 실패: ${error instanceof Error ? error.message : String(error)}\n`);
        throw error;
    }
};
