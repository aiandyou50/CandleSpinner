import { TonClient, Address } from '@ton/ton';
import { CSPINWithdrawalVoucher } from '../wrappers/CSPINWithdrawalVoucher';

async function checkContract() {
    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC'
    });

    const contractAddress = Address.parse('EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc');
    
    console.log('🔍 컨트랙트 상태 확인 중...\n');
    console.log(`📍 컨트랙트: ${contractAddress.toString()}\n`);

    // 컨트랙트 상태 확인
    const state = await client.getContractState(contractAddress);
    console.log(`✅ 컨트랙트 상태: ${state.state}`);
    console.log(`💰 잔액: ${state.balance} nanoTON\n`);

    if (state.state === 'active') {
        try {
            // contractInfo 호출 (Tact는 get fun을 get_camelCase로 변환)
            const result = await client.runMethod(contractAddress, 'contractInfo');
            
            console.log('📊 컨트랙트 정보:');
            console.log(result.stack);
            
            // Stack에서 값 파싱
            const owner = result.stack.readAddress();
            const jettonMaster = result.stack.readAddress();
            const gameJettonWallet = result.stack.readAddress();
            const contractJettonWallet = result.stack.readAddress();
            const maxSingleWithdraw = result.stack.readBigNumber();
            const paused = result.stack.readBoolean();
            
            console.log(`\n✅ Owner: ${owner.toString()}`);
            console.log(`✅ Jetton Master: ${jettonMaster.toString()}`);
            console.log(`✅ Game Jetton Wallet: ${gameJettonWallet.toString()}`);
            console.log(`✅ Contract Jetton Wallet: ${contractJettonWallet.toString()}`);
            console.log(`✅ 최대 인출: ${maxSingleWithdraw.toString()} CSPIN`);
            console.log(`✅ 일시정지: ${paused ? '예' : '아니오'}`);
            
            if (contractJettonWallet.toString() !== 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') {
                console.log('\n✅✅ UpdateContractWallet 성공! 컨트랙트가 Jetton Wallet을 인식하고 있습니다!');
            } else {
                console.log('\n⚠️ 경고: Contract Jetton Wallet이 설정되지 않았습니다.');
            }
            
        } catch (error: any) {
            console.log(`\n❌ Get Method 호출 실패: ${error.message}`);
            console.log('💡 컨트랙트가 아직 초기화되지 않았거나 메서드가 없을 수 있습니다.');
        }
    } else {
        console.log('❌ 컨트랙트가 활성화되지 않았습니다.');
    }
}

checkContract().catch(console.error);
