import { Address, toNano, beginCell, SendMode } from '@ton/core';
import { compile, NetworkProvider } from '@ton/blueprint';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient, WalletContractV5R1, internal } from '@ton/ton';
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
    
    console.log('\n⚠️  니모닉 입력 (배포용):');
    const mnemonic = await provider.ui().input('니모닉 (24단어, 공백으로 구분):');

    console.log('\n📝 배포 정보:');
    console.log(`   Owner: ${ownerAddress}`);
    console.log(`   Jetton Master: ${jettonMaster}`);
    console.log(`   Game Jetton Wallet: ${gameJettonWallet}\n`);

    // 니모닉에서 키 생성
    const mnemonicArray = mnemonic.split(' ');
    const keyPair = await mnemonicToPrivateKey(mnemonicArray);

    // 클라이언트 생성
    const client = new TonClient({
        endpoint: isTestnet 
            ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
            : 'https://toncenter.com/api/v2/jsonRPC',
    });

    // 지갑 생성
    const wallet = WalletContractV5R1.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });

    const contract = client.open(wallet);
    
    // 지갑 주소 확인
    const walletAddress = contract.address.toString({
        urlSafe: true,
        bounceable: false,
        testOnly: isTestnet
    });
    
    console.log(`💼 배포 지갑: ${walletAddress}`);
    
    // 잔액 확인
    const balance = await contract.getBalance();
    console.log(`💰 잔액: ${balance / 1000000000n} TON\n`);
    
    if (balance < toNano('0.2')) {
        console.log('❌ TON이 부족합니다. 최소 0.2 TON 필요');
        return;
    }

    // 컨트랙트 생성
    const cspinWithdrawal = client.open(
        await CSPINWithdrawalSecure.fromInit(
            Address.parse(ownerAddress),
            Address.parse(jettonMaster),
            Address.parse(gameJettonWallet)
        )
    );

    const contractAddress = cspinWithdrawal.address.toString({
        urlSafe: true,
        bounceable: true,
        testOnly: isTestnet
    });

    console.log('🚀 배포 중...');
    console.log(`📍 컨트랙트 주소: ${contractAddress}\n`);

    // 배포 트랜잭션 전송
    const seqno = await contract.getSeqno();
    
    await contract.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
        messages: [internal({
            to: cspinWithdrawal.address,
            value: toNano('0.1'),
            init: cspinWithdrawal.init,
            body: beginCell()
                .storeUint(0x946a98b6, 32) // Deploy op
                .storeUint(0, 64)
                .endCell()
        })]
    });

    console.log('⏳ 배포 트랜잭션 전송 완료. 블록체인 확인 중...');
    
    // 배포 확인 (최대 30초 대기)
    let deployed = false;
    for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const state = await client.getContractState(cspinWithdrawal.address);
        if (state.state === 'active') {
            deployed = true;
            break;
        }
        process.stdout.write('.');
    }
    
    console.log('\n');

    if (deployed) {
        console.log('✅ 배포 완료!\n');
        console.log('📊 컨트랙트 정보:');
        console.log(`   주소: ${contractAddress}`);
        console.log(`   네트워크: ${isTestnet ? 'Testnet' : 'Mainnet'}`);
        console.log(`   Owner: ${ownerAddress}`);
        console.log(`   Jetton Master: ${jettonMaster}`);
        console.log(`   Game Wallet: ${gameJettonWallet}\n`);
        
        console.log('🔗 Tonscan:');
        console.log(`   https://${isTestnet ? 'testnet.' : ''}tonscan.org/address/${contractAddress}\n`);
        
        console.log('⚠️ 중요: 컨트랙트 주소를 복사하세요!');
        console.log(`   ${contractAddress}\n`);
    } else {
        console.log('⚠️  배포 트랜잭션은 전송되었으나 확인에 시간이 걸립니다.');
        console.log('   Tonscan에서 직접 확인하세요:');
        console.log(`   https://${isTestnet ? 'testnet.' : ''}tonscan.org/address/${contractAddress}\n`);
    }
}
