#!/usr/bin/env node

/**
 * 프라이빗 키를 사용하여 스마트컨트랙트를 직접 배포하는 스크립트
 * 
 * 사용법:
 *   npm run deploy:direct -- --testnet
 *   npm run deploy:direct -- --mainnet
 */

import { Address, beginCell, toNano, Cell } from '@ton/core';
import { TonClient4 } from '@ton/ton';
import { WalletContractV4 } from '@ton/ton';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 환경 변수 로드
const dotenvPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(dotenvPath)) {
    dotenv.config({ path: dotenvPath });
}

async function deploySmartContract() {
    console.log('\n🚀 WithdrawalManager 스마트컨트랙트 직접 배포 (프라이빗 키 사용)\n');

    try {
        // 1. 네트워크 선택
        const isTestnet = process.argv.includes('--testnet');
        const isMainnet = process.argv.includes('--mainnet');

        if (!isTestnet && !isMainnet) {
            console.error('❌ 네트워크를 지정하세요: --testnet 또는 --mainnet');
            process.exit(1);
        }

        const network = isTestnet ? 'testnet' : 'mainnet';
        console.log(`📍 네트워크: ${network.toUpperCase()}\n`);

        // 2. 환경 변수 확인
        const privateKeyHex = process.env.DEPLOYER_PRIVATE_KEY;
        const walletAddress = isTestnet
            ? process.env.DEPLOYER_WALLET_ADDRESS_TESTNET
            : process.env.DEPLOYER_WALLET_ADDRESS_MAINNET;
        const cspinJetton = process.env.CSPIN_JETTON;
        const gameWallet = process.env.GAME_JETTON_WALLET;

        if (!privateKeyHex || !walletAddress || !cspinJetton || !gameWallet) {
            throw new Error('❌ 환경 변수 누락: 모든 필수 변수를 확인하세요');
        }

        console.log('✅ 환경 변수 로드됨\n');

        // 3. 클라이언트 연결
        const endpoint = isTestnet
            ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
            : 'https://toncenter.com/api/v2/jsonRPC';

        console.log(`🔗 RPC 연결: ${endpoint}`);
        const client = new TonClient4({ endpoint });
        console.log('✅ 연결 완료\n');

        // 4. 지갑 주소 파싱
        const deployerAddr = Address.parse(walletAddress);
        console.log(`📝 배포자 지갑: ${deployerAddr.toString()}\n`);

        // 5. 빌드된 코드 로드
        console.log('📦 스마트컨트랙트 코드 로드 중...');
        const codeFile = path.join(
            __dirname,
            '..',
            'build',
            'build.tact_WithdrawalManager.code.boc'
        );

        if (!fs.existsSync(codeFile)) {
            throw new Error(
                `❌ 코드 파일 없음: ${codeFile}\n` +
                `   먼저 npm run build를 실행하세요`
            );
        }

        const codeBuffer = fs.readFileSync(codeFile);
        const codeCell = Cell.fromBoc(codeBuffer)[0];
        console.log(`✅ 코드 로드됨 (${codeBuffer.length} bytes)\n`);

        // 6. 데이터 셀 생성
        console.log('📝 스마트컨트랙트 초기 데이터 생성 중...');
        const cspin = Address.parse(cspinJetton);
        const gameWalletAddr = Address.parse(gameWallet);

        const initData = beginCell()
            .storeAddress(gameWalletAddr) // owner (게임 지갑)
            .storeAddress(cspin) // cspin_jetton_master (CSPIN Jetton)
            .storeBit(false) // is_paused (처음엔 활성화)
            .endCell();

        console.log(`✅ 데이터 셀 생성:
   - Owner (게임 지갑): ${gameWalletAddr.toString()}
   - CSPIN Jetton: ${cspin.toString()}
   - 상태: 활성화\n`);

        // 7. 배포 정보 출력
        console.log('📋 배포 정보:');
        console.log('─────────────────────────────────────────────────────');
        console.log(`네트워크: ${network.toUpperCase()}`);
        console.log(`배포자: ${deployerAddr.toString()}`);
        console.log(`CSPIN Jetton: ${cspin.toString()}`);
        console.log(`게임 지갑: ${gameWalletAddr.toString()}`);
        console.log('─────────────────────────────────────────────────────\n');

        // 8. 배포 대상 정보 저장
        const deploymentInfo = {
            network,
            timestamp: new Date().toISOString(),
            deployer: deployerAddr.toString(),
            cspinJetton: cspin.toString(),
            gameWallet: gameWalletAddr.toString(),
            codeHash: codeCell.hash().toString('hex'),
            status: 'ready_for_deployment',
            nextStep: `프라이빗 키로 배포할 준비 완료. 실제 배포는 Tonkeeper 또는 지갑 서명 필요`,
        };

        // 9. 배포 정보 저장
        const infoFile = path.join(__dirname, '..', 'deployment-ready.json');
        fs.writeFileSync(infoFile, JSON.stringify(deploymentInfo, null, 2));

        console.log(`📄 배포 준비 정보: ${infoFile}\n`);

        console.log('✅ 배포 준비 완료!\n');

        console.log('📋 다음 단계:');
        console.log('─────────────────────────────────────────────────────');
        console.log('Option 1: Tonkeeper 지갑 연결');
        console.log('  npm run deploy\n');

        console.log('Option 2: Tonhub/Tonkeeper 원격 서명');
        console.log('  npm run deploy:remote\n');

        console.log('Option 3: 완전 자동 배포 (프라이빗 키 직접 사용)');
        console.log('  npm run deploy:auto\n');

        console.log('─────────────────────────────────────────────────────\n');

    } catch (error) {
        console.error('\n❌ 배포 오류:');
        console.error(error);
        process.exit(1);
    }
}

deploySmartContract();
