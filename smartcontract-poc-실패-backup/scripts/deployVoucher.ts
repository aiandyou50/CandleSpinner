import { Address, toNano } from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { NetworkProvider } from '@ton/blueprint';
import { CSPINWithdrawalVoucher } from '../wrappers/CSPINWithdrawalVoucher_CSPINWithdrawalVoucher';

export async function run(provider: NetworkProvider) {
    const network = provider.network();
    const isTestnet = network === 'testnet';

    console.log('\n🚀 CSPINWithdrawalVoucher (Signed Voucher 보안 활성화) 배포');
    console.log(`📍 네트워크: ${isTestnet ? 'Testnet' : 'Mainnet'}\n`);

    // 환경 변수에서 니모닉 확인 (Blueprint Mnemonic 배포자용)
    let mnemonic = process.env.WALLET_MNEMONIC;
    let keyPair: any;
    let publicKeyInt: bigint;

    if (mnemonic) {
        // 환경 변수에 니모닉이 있으면 사용
        console.log('✅ 환경 변수에서 니모닉 로드됨\n');
        keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
        publicKeyInt = BigInt('0x' + keyPair.publicKey.toString('hex'));
    } else {
        // 없으면 입력 요청
        console.log('🔐 Owner 지갑 니모닉을 입력하세요:');
        mnemonic = await provider.ui().input('니모닉 24단어 (공백으로 구분):');
        keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
        publicKeyInt = BigInt('0x' + keyPair.publicKey.toString('hex'));
        
        // Blueprint가 사용할 수 있도록 환경 변수 설정
        process.env.WALLET_MNEMONIC = mnemonic;
        process.env.WALLET_VERSION = 'v5r1';
    }

    console.log(`✅ Public Key: ${keyPair.publicKey.toString('hex').substring(0, 32)}...`);

    // 배포 정보 입력
    const ownerAddress = await provider.ui().input('Owner 주소 (Enter: sender 주소 사용):');
    const actualOwner = ownerAddress || provider.sender().address?.toString();
    
    if (!actualOwner) {
        console.error('❌ Owner 주소를 확인할 수 없습니다.');
        return;
    }

    const jettonMaster = await provider.ui().input('CSPIN Jetton Master (기본: EQBZ6nHf...):') || 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';
    const gameJettonWallet = await provider.ui().input('게임 Jetton Wallet (기본: EQAjtIv...):') || 'EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs';
    const maxWithdraw = await provider.ui().input('최대 단일 인출 (기본: 1000000 CSPIN):') || '1000000';

    console.log('\n📝 배포 정보:');
    console.log(`   Owner: ${actualOwner}`);
    console.log(`   Owner Public Key: ${keyPair.publicKey.toString('hex').substring(0, 32)}...`);
    console.log(`   Jetton Master: ${jettonMaster}`);
    console.log(`   Game Jetton Wallet: ${gameJettonWallet}`);
    console.log(`   Max Single Withdraw: ${maxWithdraw} CSPIN\n`);

    // 컨트랙트 초기화 (ownerPublicKey 포함)
    const contract = provider.open(
        await CSPINWithdrawalVoucher.fromInit(
            Address.parse(actualOwner),
            publicKeyInt,
            Address.parse(jettonMaster),
            Address.parse(gameJettonWallet),
            BigInt(maxWithdraw) * 1_000_000_000n
        )
    );

    const contractAddress = contract.address;
    console.log(`📍 컨트랙트 주소: ${contractAddress.toString()}\n`);

    // 배포
    console.log('🚀 배포 중...');
    await contract.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(contractAddress);

    console.log('\n✅ 배포 완료!\n');
    console.log('📊 컨트랙트 정보:');
    console.log(`   주소: ${contractAddress.toString()}`);
    console.log(`   네트워크: ${isTestnet ? 'Testnet' : 'Mainnet'}`);
    console.log(`   시간: ${new Date().toISOString()}\n`);

    if (isTestnet) {
        console.log('🔗 Tonscan:');
        console.log(`   https://testnet.tonscan.org/address/${contractAddress.toString()}\n`);
    } else {
        console.log('🔗 Tonscan:');
        console.log(`   https://tonscan.org/address/${contractAddress.toString()}\n`);
    }

    console.log('📋 다음 단계:');
    console.log('   1. UpdateContractWallet 실행 (Contract Jetton Wallet 설정)');
    console.log('   2. Contract Jetton Wallet에 CSPIN 충전');
    console.log('   3. 백엔드 .env 파일에 니모닉 설정');
    console.log('   4. Unpause 실행\n');
    
    console.log('🔐 보안:');
    console.log('   ✅ 서명 검증 활성화됨');
    console.log('   ✅ Owner 공개키로 바우처 검증\n');
}
