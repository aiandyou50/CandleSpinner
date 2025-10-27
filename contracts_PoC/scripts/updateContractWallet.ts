import { Address, toNano } from '@ton/core';
import { CSPINWithdrawalAuto } from '../wrappers/CSPINWithdrawalAuto';
import { NetworkProvider } from '@ton/blueprint';

/**
 * 컨트랙트의 Jetton Wallet 주소를 업데이트하는 스크립트
 * 
 * 사용 방법:
 * 1. 먼저 배포된 컨트랙트의 Jetton Wallet 주소를 확인
 * 2. 이 스크립트 실행
 * 
 * npx blueprint run updateContractWallet --mainnet
 */

export async function run(provider: NetworkProvider) {
    console.log('\n🔄 컨트랙트 Jetton Wallet 주소 업데이트\n');

    // 배포된 컨트랙트 주소 입력
    const contractAddressStr = await provider.ui().input('배포된 컨트랙트 주소를 입력하세요:');
    const contractAddress = Address.parse(contractAddressStr);

    // 컨트랙트의 Jetton Wallet 주소 입력
    const jettonWalletStr = await provider.ui().input('컨트랙트의 Jetton Wallet 주소를 입력하세요:');
    const jettonWalletAddress = Address.parse(jettonWalletStr);

    console.log('\n📋 업데이트 정보:');
    console.log('   - 컨트랙트:', contractAddress);
    console.log('   - 새 Jetton Wallet:', jettonWalletAddress);
    console.log('   - Owner:', provider.sender().address);

    const confirm = await provider.ui().input('\n계속하시겠습니까? (yes/no)');
    if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ 취소됨');
        return;
    }

    // 컨트랙트 연결
    const cspinWithdrawalAuto = provider.open(
        CSPINWithdrawalAuto.fromAddress(contractAddress)
    );

    // UpdateContractWallet 메시지 전송
    await cspinWithdrawalAuto.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'UpdateContractWallet',
            newWallet: jettonWalletAddress
        }
    );

    console.log('\n✅ 업데이트 완료!');
    console.log('\n📌 다음 단계:');
    console.log('   1. Tonscan에서 트랜잭션 확인');
    console.log('   2. contractInfo Get 메서드로 업데이트 확인');
    console.log('   3. 게임 백엔드에서 테스트 전송\n');
}
