import { Address, TonClient } from '@ton/ton';
import { beginCell } from '@ton/core';

async function getJettonWalletAddress() {
    console.log('\n🔍 Jetton Wallet 주소 계산\n');

    const isTestnet = false; // 메인넷
    const endpoint = isTestnet 
        ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
        : 'https://toncenter.com/api/v2/jsonRPC';

    const client = new TonClient({ endpoint });

    // 컨트랙트의 Jetton Wallet 주소 계산
    const jettonMasterStr = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';
    const contractAddressStr = 'EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc'; // 새로 배포된 Voucher 컨트랙트

    const jettonMaster = Address.parse(jettonMasterStr);
    const contractAddress = Address.parse(contractAddressStr);

    console.log('📋 입력 정보:');
    console.log('   Jetton Master:', jettonMasterStr);
    console.log('   컨트랙트:', contractAddressStr);
    console.log('');

    try {
        // get_wallet_address 메서드 호출
        const result = await client.runMethod(
            jettonMaster,
            'get_wallet_address',
            [{
                type: 'slice',
                cell: beginCell().storeAddress(contractAddress).endCell()
            }]
        );

        const jettonWalletAddress = result.stack.readAddress();

        console.log('✅ 계산 완료!');
        console.log('');
        console.log('📍 컨트랙트의 CSPIN Jetton Wallet 주소:');
        console.log('   ', jettonWalletAddress.toString());
        console.log('');
        console.log('🔗 Tonscan:');
        console.log('   https://tonscan.org/address/' + jettonWalletAddress.toString());
        console.log('');
        console.log('📌 이 주소를 사용하여:');
        console.log('   1. update-contract-wallet.ps1 실행');
        console.log('   2. 위 Jetton Wallet 주소 입력');
        console.log('   3. 컨트랙트가 자신의 Jetton Wallet을 인식하게 됨\n');

    } catch (error) {
        console.log('❌ 오류:', error);
        console.log('');
        console.log('💡 참고:');
        console.log('   - 메인넷 Jetton Master를 테스트넷에서 조회하면 실패합니다');
        console.log('   - 테스트넷에는 별도의 Jetton이 필요합니다');
        console.log('   - 또는 메인넷에 직접 배포하세요\n');
    }
}

getJettonWalletAddress();
