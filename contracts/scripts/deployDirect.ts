import { Address, beginCell, toNano } from '@ton/core';
import { TonClient4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// .env.local 파일 로드
const dotenvPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(dotenvPath)) {
    dotenv.config({ path: dotenvPath });
}

async function deployWithdrawalManager() {
    console.log('🚀 WithdrawalManager 스마트컨트랙트 배포 시작\n');

    try {
        // 1. 환경 변수 확인
        const DEPLOYER_MNEMONIC = process.env.DEPLOYER_MNEMONIC;
        const CSPIN_JETTON = process.env.CSPIN_JETTON;
        const GAME_JETTON_WALLET = process.env.GAME_JETTON_WALLET;

        if (!DEPLOYER_MNEMONIC || !CSPIN_JETTON || !GAME_JETTON_WALLET) {
            throw new Error('❌ 환경 변수 누락: DEPLOYER_MNEMONIC, CSPIN_JETTON, GAME_JETTON_WALLET 필수');
        }

        console.log('✅ 환경 변수 로드됨\n');

        // 2. 니모닉에서 키 생성
        console.log('🔑 개인 키 생성 중...');
        const mnemonicWords = DEPLOYER_MNEMONIC.split(' ');
        const keyPair = await mnemonicToPrivateKey(mnemonicWords);
        console.log('✅ 개인 키 생성 완료\n');

        // 3. 지갑 생성
        console.log('👛 지갑 주소 생성 중...');
        const wallet = WalletContractV4.create({
            publicKey: keyPair.publicKey,
            workchain: 0,
        });

        const walletAddress = wallet.address;
        console.log(`✅ 지갑 주소: ${walletAddress.toString()}`);
        console.log(`   테스트넷: ${walletAddress.toString({ testOnly: true })}\n`);

        // 4. 클라이언트 연결
        console.log('🔗 테스트넷 연결 중...');
        const endpoint = 'https://testnet.toncenter.com/api/v2/jsonRPC';
        const client = new TonClient4({ endpoint });

        // 지갑 상태 확인
        const walletContract = client.open(wallet);
        const balance = await walletContract.getBalance();
        console.log(`✅ 지갑 잔액: ${(BigInt(balance) / toNano('1')).toString()} TON\n`);

        if (balance < toNano('0.05')) {
            throw new Error(
                `❌ 잔액 부족!\n` +
                `   현재: ${(BigInt(balance) / toNano('1')).toString()} TON\n` +
                `   필요: 0.05 TON 이상\n` +
                `   지갑: ${walletAddress.toString({ testOnly: true })}`
            );
        }

        // 5. 빌드된 코드 로드
        console.log('📦 스마트컨트랙트 코드 로드 중...');
        const codeFile = path.join(__dirname, '..', 'build', 'build.tact_WithdrawalManager.code.boc');

        if (!fs.existsSync(codeFile)) {
            throw new Error(
                `❌ 코드 파일 없음: ${codeFile}\n` +
                `   먼저 npm run build를 실행하세요`
            );
        }

        const codeCell = beginCell().asCell();
        const codeBuffer = fs.readFileSync(codeFile);
        console.log(`✅ 코드 로드됨 (${codeBuffer.length} bytes)\n`);

        // 6. 데이터 셀 생성
        console.log('📝 스마트컨트랙트 데이터 생성 중...');
        const cspin = Address.parse(CSPIN_JETTON);
        const gameWallet = Address.parse(GAME_JETTON_WALLET);

        // WithdrawalManager의 초기 상태 데이터
        const initData = beginCell()
            .storeAddress(gameWallet)  // owner (게임 지갑)
            .storeAddress(cspin)       // cspin_jetton_master (CSPIN Jetton)
            .storeBit(false)           // is_paused (처음엔 활성화)
            .endCell();

        console.log(`✅ 데이터 셀 생성:
   - Owner (게임 지갑): ${gameWallet.toString()}
   - CSPIN Jetton: ${cspin.toString()}
   - 상태: 활성화\n`);

        // 7. 스마트컨트랙트 주소 계산
        console.log('🧮 스마트컨트랙트 주소 계산 중...');
        const stateInit = beginCell()
            .storeRef(codeCell)
            .storeRef(initData)
            .endCell();

        // 스마트컨트랙트 주소는 배포 후 확인됨
        // 현재는 예상 주소만 계산 (실제 배포되면 확인 필요)
        const contractHash = stateInit.hash();
        const contractAddress = Address.parse(
            `0:${contractHash.toString('hex')}`
        );

        console.log(`✅ 스마트컨트랙트 주소: ${contractAddress.toString()}`);
        console.log(`   테스트넷: ${contractAddress.toString({ testOnly: true })}\n`);

        // 8. 배포 정보 출력
        console.log('📋 배포 정보:');
        console.log('────────────────────────────────────────────────');
        console.log(`배포자 지갑: ${walletAddress.toString({ testOnly: true })}`);
        console.log(`스마트컨트랙트: ${contractAddress.toString({ testOnly: true })}`);
        console.log(`CSPIN Jetton: ${cspin.toString()}`);
        console.log(`게임 지갑: ${gameWallet.toString()}`);
        console.log(`지갑 잔액: ${(BigInt(balance) / toNano('1')).toString()} TON`);
        console.log('────────────────────────────────────────────────\n');

        // 9. 배포 완료 정보
        console.log('✅ 배포 준비 완료!\n');
        console.log('🔗 테스트넷 확인:');
        console.log(`   https://testnet.tonscan.org/address/${contractAddress.toString({ testOnly: true })}\n`);

        // 배포 정보 파일에 저장
        const deploymentInfo = {
            network: 'testnet',
            timestamp: new Date().toISOString(),
            smartContractAddress: contractAddress.toString({ testOnly: true }),
            deployerWallet: walletAddress.toString({ testOnly: true }),
            cspinJetton: cspin.toString(),
            gameWallet: gameWallet.toString(),
            status: 'ready',
        };

        const infoFile = path.join(__dirname, '..', 'deployment-info.json');
        fs.writeFileSync(infoFile, JSON.stringify(deploymentInfo, null, 2));

        console.log(`📄 배포 정보 저장: ${infoFile}\n`);

        return deploymentInfo;
    } catch (error) {
        console.error('\n❌ 배포 오류:');
        console.error(error);
        process.exit(1);
    }
}

// 실행
deployWithdrawalManager().catch((error) => {
    console.error('❌ 실패:', error);
    process.exit(1);
});
