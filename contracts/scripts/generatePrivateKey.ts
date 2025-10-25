#!/usr/bin/env node

/**
 * 니모닉에서 프라이빗 키 생성 스크립트
 * 
 * 사용법:
 *   npx ts-node scripts/generatePrivateKey.ts
 */

import { mnemonicToPrivateKey } from '@ton/crypto';
import { Address } from '@ton/core';
import { WalletContractV4 } from '@ton/ton';

async function generatePrivateKey() {
    console.log('🔑 프라이빗 키 생성 중...\n');

    const mnemonic = 'bamboo release expand income shiver gift bounce cargo course kiss goat cram pledge relax rib furnace squirrel sugar find daughter load proof please speed';

    try {
        // 1. 니모닉을 프라이빗 키로 변환
        const mnemonicArray = mnemonic.split(' ');
        console.log(`✅ 니모닉 단어 수: ${mnemonicArray.length}\n`);

        const keyPair = await mnemonicToPrivateKey(mnemonicArray);

        // 2. 프라이빗 키 출력
        const privateKeyHex = keyPair.secretKey.toString('hex');
        const publicKeyHex = keyPair.publicKey.toString('hex');

        console.log('📋 생성된 키 정보:');
        console.log('─────────────────────────────────────────────────────\n');
        console.log(`✅ 프라이빗 키 (Private Key):`);
        console.log(`   ${privateKeyHex}\n`);

        console.log(`✅ 퍼블릭 키 (Public Key):`);
        console.log(`   ${publicKeyHex}\n`);

        // 3. 지갑 주소 생성
        const wallet = WalletContractV4.create({
            publicKey: keyPair.publicKey,
            workchain: 0,
        });

        const walletAddress = wallet.address;

        console.log('✅ 지갑 주소:');
        console.log(`   테스트넷: ${walletAddress.toString({ testOnly: true })}`);
        console.log(`   메인넷: ${walletAddress.toString()}\n`);

        // 4. .env.local에 추가할 내용 출력
        console.log('📝 .env.local에 추가할 내용:');
        console.log('─────────────────────────────────────────────────────\n');

        console.log('***REMOVED***프라이빗 키 (니모닉에서 파생됨)');
        console.log(`DEPLOYER_PRIVATE_KEY=${privateKeyHex}\n`);

        console.log('***REMOVED***테스트넷/메인넷 주소');
        console.log(`DEPLOYER_WALLET_ADDRESS_TESTNET=${walletAddress.toString({ testOnly: true })}`);
        console.log(`DEPLOYER_WALLET_ADDRESS_MAINNET=${walletAddress.toString()}\n`);

        console.log('─────────────────────────────────────────────────────\n');

        console.log('📋 사용 설명서:');
        console.log(`1. 위의 "프라이빗 키 (Private Key)" 값을 복사`);
        console.log(`2. .env.local 파일의 DEPLOYER_PRIVATE_KEY에 붙여넣기`);
        console.log(`3. npm run check-env로 검증\n`);

    } catch (error) {
        console.error('❌ 오류:', error);
        process.exit(1);
    }
}

generatePrivateKey();
