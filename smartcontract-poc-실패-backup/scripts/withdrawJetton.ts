import { toNano, Address } from '@ton/core';
import { CSPINWithdrawalVoucher } from '../wrappers/CSPINWithdrawalVoucher_CSPINWithdrawalVoucher';
import type { WithdrawJetton } from '../wrappers/CSPINWithdrawalVoucher_CSPINWithdrawalVoucher';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    // 컨트랙트 주소 입력
    const contractAddressStr = await ui.input('배포된 컨트랙트 주소를 입력하세요');
    const contractAddress = Address.parse(contractAddressStr);

    // 회수할 CSPIN 양 입력
    const amountStr = await ui.input('회수할 CSPIN 수량을 입력하세요 (예: 100000)');
    const amount = BigInt(amountStr) * 1_000_000_000n; // CSPIN to nanoCSPIN

    // 받을 주소 입력 (보통 Owner)
    const recipientStr = await ui.input('받을 주소를 입력하세요 (Owner 주소 권장)');
    const recipient = Address.parse(recipientStr);

    // 컨트랙트 인스턴스 생성
    const contract = provider.open(CSPINWithdrawalVoucher.fromAddress(contractAddress));

    ui.write(`📋 WithdrawJetton 정보:`);
    ui.write(`   - 컨트랙트: ${contractAddress}`);
    ui.write(`   - 회수할 CSPIN: ${amountStr}`);
    ui.write(`   - 받을 주소: ${recipient}`);

    const confirm = await ui.input('계속하시겠습니까? (yes/no)');
    if (confirm.toLowerCase() !== 'yes') {
        ui.write('취소되었습니다.');
        return;
    }

    ui.write('🔄 WithdrawJetton 전송...');

    // WithdrawJetton 메시지 전송
    const withdrawMsg: WithdrawJetton = {
        $$type: 'WithdrawJetton',
        amount: amount,
        recipient: recipient
    };

    await contract.send(
        provider.sender(),
        {
            value: toNano('0.15'), // 가스비
        },
        withdrawMsg as any // 타입 캐스팅
    );

    ui.write('✅ 메시지 전송 완료!');
    ui.write('⏳ 블록체인 처리 대기 중 (10초)...');
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    ui.write('');
    ui.write('✅ WithdrawJetton 완료!');
    ui.write('');
    ui.write('🔗 Tonscan으로 확인:');
    ui.write(`   https://tonscan.org/address/${contractAddress}`);
    ui.write('');
    ui.write('📌 다음 단계:');
    ui.write('   받는 주소의 Jetton Wallet에서 CSPIN 잔액 확인');
}
