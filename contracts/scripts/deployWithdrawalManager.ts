import { Address } from '@ton/core';
import * as path from 'path';
import * as fs from 'fs';

// .env.local 파일 로드
const dotenvPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(dotenvPath)) {
    require('dotenv').config({ path: dotenvPath });
}

/**
 * 배포 정보 검증 스크립트
 */

export async function run() {
    console.log('🚀 WithdrawalManager 배포 정보 검증\n');

    // 환경 변수 읽기
    const CSPIN_JETTON = Address.parse(process.env.CSPIN_JETTON!);
    const GAME_JETTON_WALLET = Address.parse(process.env.GAME_JETTON_WALLET!);
    const deployerWalletAddress = Address.parse(process.env.DEPLOYER_WALLET_ADDRESS_TESTNET!);

    console.log('✅ 환경 변수 확인:');
    console.log(`   CSPIN Jetton: ${CSPIN_JETTON.toString()}`);
    console.log(`   게임 지갑: ${GAME_JETTON_WALLET.toString()}`);
    console.log(`   배포자 지갑: ${deployerWalletAddress.toString()}\n`);

    // 빌드 결과 확인
    const codeFile = path.join(__dirname, '..', 'build', 'build.tact_WithdrawalManager.code.boc');
    const tsFile = path.join(__dirname, '..', 'build', 'build.tact_WithdrawalManager.ts');
    const abiFile = path.join(__dirname, '..', 'build', 'build.tact_WithdrawalManager.abi');

    if (!fs.existsSync(codeFile)) {
        console.error('❌ 코드 파일 없음:', codeFile);
        console.error('\n먼저 컴파일을 진행하세요: npm run build');
        process.exit(1);
    }

    console.log('✅ 스마트컨트랙트 빌드 완료:');
    console.log(`   코드 파일: ${path.basename(codeFile)}`);
    console.log(`   TypeScript 래퍼: ${path.basename(tsFile)}`);
    console.log(`   ABI 파일: ${path.basename(abiFile)}\n`);

    // 파일 크기 확인
    const codeSize = fs.statSync(codeFile).size;
    console.log('📊 빌드 정보:');
    console.log(`   코드 크기: ${codeSize} bytes\n`);

    console.log('📋 배포 준비 완료!\n');
    console.log('다음 단계:');
    console.log('   1. 🪙 Testnet TON을 배포자 지갑으로 전송');
    console.log(`      주소: ${deployerWalletAddress.toString()}`);
    console.log('      최소 0.05 TON 필요');
    console.log(`\n   2. 📤 배포 트랜잭션 전송`);
    console.log('      npm run deploy\n');
    console.log('   3. 🔍 배포 완료 확인');
    console.log('      wrangler.toml에 컨트랙트 주소 저장\n');
}
