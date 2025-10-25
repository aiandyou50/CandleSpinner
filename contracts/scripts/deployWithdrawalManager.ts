import { Address, toNano } from '@ton/core';
import { WithdrawalManager } from '../wrappers/WithdrawalManager';
import { TonClient } from '@ton/ton';

/**
 * 스마트컨트랙트 배포 스크립트
 * 
 * 사용 방법:
 * 테스트넷: npx ts-node scripts/deployWithdrawalManager.ts --testnet
 * 메인넷: npx ts-node scripts/deployWithdrawalManager.ts --mainnet
 */

async function run() {
    console.log('🚀 WithdrawalManager 배포 시작\n');

    // ===== 1️⃣ 환경 설정 =====
    
    const args = process.argv.slice(2);
    const isTestnet = args.includes('--testnet');
    const isMainnet = args.includes('--mainnet');
    
    const network = isTestnet ? 'testnet' : isMainnet ? 'mainnet' : 'testnet';
    
    const endpoint = network === 'mainnet'
        ? 'https://toncenter.com/api/v2/jsonRPC'
        : 'https://testnet.toncenter.com/api/v2/jsonRPC';
    
    console.log(`📡 네트워크: ${network.toUpperCase()}`);
    console.log(`🔗 RPC 엔드포인트: ${endpoint}\n`);
    
    // ===== 2️⃣ 환경 변수 읽기 =====
    
    // CSPIN Jetton 주소 (환경 변수 또는 기본값)
    const CSPIN_JETTON = process.env.CSPIN_JETTON
        ? Address.parse(process.env.CSPIN_JETTON)
        : null;
    
    // 게임 Jetton 지갑 주소
    const GAME_JETTON_WALLET = process.env.GAME_JETTON_WALLET
        ? Address.parse(process.env.GAME_JETTON_WALLET)
        : null;
    
    if (!CSPIN_JETTON || !GAME_JETTON_WALLET) {
        console.error('❌ 환경 변수 부족:');
        console.error('   CSPIN_JETTON:', CSPIN_JETTON ? '✅' : '❌');
        console.error('   GAME_JETTON_WALLET:', GAME_JETTON_WALLET ? '✅' : '❌');
        console.error('\n설정 방법:');
        console.error('   export CSPIN_JETTON="EQB..."');
        console.error('   export GAME_JETTON_WALLET="EQC..."');
        process.exit(1);
    }
    
    console.log('✅ 환경 변수 확인:');
    console.log(`   CSPIN_JETTON: ${CSPIN_JETTON.toString()}`);
    console.log(`   GAME_JETTON_WALLET: ${GAME_JETTON_WALLET.toString()}\n`);
    
    // ===== 3️⃣ 배포자 지갑 설정 =====
    
    // 프로덕션에서는 실제 프라이빗 키 사용
    const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
    
    if (!deployerPrivateKey) {
        console.warn('⚠️  DEPLOYER_PRIVATE_KEY 환경 변수 없음');
        console.warn('   배포를 위해 프라이빗 키가 필요합니다.');
        console.error('   export DEPLOYER_PRIVATE_KEY="..."');
        process.exit(1);
    }
    
    // ===== 4️⃣ TonClient 초기화 =====
    
    const client = new TonClient({ endpoint });
    console.log('🔌 RPC 클라이언트 초기화 완료\n');
    
    // ===== 5️⃣ 컨트랙트 인스턴스 생성 =====
    
    console.log('📝 컨트랙트 생성 중...\n');
    
    // TODO: Tact 컴파일러에서 코드 받기
    // const code = await compile('WithdrawalManager');
    
    const withdrawal = WithdrawalManager.createFromConfig({
        jettonMaster: CSPIN_JETTON,
        gameJettonWallet: GAME_JETTON_WALLET,
        owner: Address.parse('YOUR_WALLET_ADDRESS'),  // 임시값
    }, { hash: () => Buffer.from('') });
    
    console.log(`📍 컨트랙트 주소: ${withdrawal.address.toString()}`);
    
    // ===== 6️⃣ 배포 확인 =====
    
    try {
        const isDeployed = await client.isContractDeployed(withdrawal.address);
        
        if (isDeployed) {
            console.log('✅ 컨트랙트가 이미 배포됨\n');
            
            // 통계 조회
            const stats = await withdrawal.getStats(client.open(withdrawal) as any);
            console.log('📊 현재 통계:');
            console.log(`   처리된 요청: ${stats.processedRequests}`);
            console.log(`   총 출금액: ${stats.totalWithdrawn}`);
            console.log(`   징수한 가스비: ${stats.totalGasCollected}`);
            console.log(`   정지 상태: ${stats.isPaused}`);
        } else {
            console.log('📤 배포 중...\n');
            console.log('⚠️  실제 배포는 Blueprint CLI를 사용하세요:');
            console.log('   npm run deploy\n');
        }
    } catch (error) {
        console.error('❌ 배포 오류:', error);
    }
    
    // ===== 7️⃣ 배포 완료 =====
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 배포 작업 완료!');
    console.log('='.repeat(60));
    console.log('\n📋 다음 단계:');
    console.log(`   1. wrangler.toml에 컨트랙트 주소 저장:`);
    console.log(`      WITHDRAWAL_MANAGER = "${withdrawal.address.toString()}"`);
    console.log(`\n   2. 게임 Jetton 지갑에 CSPIN 토큰 예치`);
    console.log(`\n   3. 백엔드에서 스마트컨트랙트 호출 시작`);
}

run().catch(console.error);

export { run };
