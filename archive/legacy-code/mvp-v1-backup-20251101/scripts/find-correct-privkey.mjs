#!/usr/bin/env node

/**
 * 모든 가능한 derivation path 탐색
 * 테스트넷 주소와 매칭되는 프라이빗 키 찾기
 */

import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV5R1, WalletContractV4 } from '@ton/ton';
import { Address } from '@ton/core';

const targetTestnetAddress = '0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g';
const mnemonic = 'bamboo release expand income shiver gift bounce cargo course kiss goat cram pledge relax rib furnace squirrel sugar find daughter load proof please speed';

console.log('🔍 모든 Derivation Path 탐색\n');
console.log(`목표 주소: ${targetTestnetAddress}\n`);

async function findCorrectPrivateKey() {
    const mnemonicArray = mnemonic.split(' ');
    let found = false;

    try {
        // 기본 키 쌍 생성
        const keyPair = await mnemonicToPrivateKey(mnemonicArray);
        const privateKeyHex = keyPair.secretKey.toString('hex');
        const publicKey = keyPair.publicKey;

        console.log('📋 생성된 키 정보:\n');
        console.log(`Private Key (64 bytes):`);
        console.log(`${privateKeyHex}\n`);

        // 1. W5 (WalletV5R1) - 다양한 workchain 시도
        console.log('='.repeat(60));
        console.log('1️⃣  WalletContractV5R1 (W5) - 다양한 Workchain\n');

        for (const workchain of [0, -1]) {
            const wallet = WalletContractV5R1.create({
                publicKey,
                workchain,
            });

            const bounceable = wallet.address.toString({ bounceable: true });
            const nonBounceable = wallet.address.toString({ bounceable: false });

            console.log(`Workchain: ${workchain}`);
            console.log(`  Bounceable (EQ...):     ${bounceable}`);
            console.log(`  Non-Bounceable (UQ/0Q): ${nonBounceable}`);

            if (nonBounceable === targetTestnetAddress) {
                console.log(`  ✅ MATCH FOUND!\n`);
                found = true;
                console.log('🎉 올바른 프라이빗 키:\n');
                console.log(privateKeyHex);
                console.log();
                return privateKeyHex;
            }
            console.log();
        }

        // 2. W4 (WalletV4) - 다양한 workchain
        console.log('='.repeat(60));
        console.log('2️⃣  WalletContractV4 (W4) - 다양한 Workchain\n');

        for (const workchain of [0, -1]) {
            const wallet = WalletContractV4.create({
                publicKey,
                workchain,
            });

            const bounceable = wallet.address.toString({ bounceable: true });
            const nonBounceable = wallet.address.toString({ bounceable: false });

            console.log(`Workchain: ${workchain}`);
            console.log(`  Bounceable (EQ...):     ${bounceable}`);
            console.log(`  Non-Bounceable (UQ/0Q): ${nonBounceable}`);

            if (nonBounceable === targetTestnetAddress) {
                console.log(`  ✅ MATCH FOUND!\n`);
                found = true;
                console.log('🎉 올바른 프라이빗 키:\n');
                console.log(privateKeyHex);
                console.log();
                return privateKeyHex;
            }
            console.log();
        }



        // 결과
        console.log('='.repeat(60));
        console.log('\n📊 탐색 결과:\n');

        if (found) {
            console.log('✅ 올바른 프라이빗 키를 찾았습니다!');
        } else {
            console.log('❌ 제공된 니모닉으로는 테스트넷 주소를 생성할 수 없습니다.\n');
            console.log('가능한 원인:');
            console.log('1. 니모닉이 다른 지갑입니다');
            console.log('2. 테스트넷 주소가 다른 derivation path에서 생성됨');
            console.log('3. 지갑 버전이 W5/W4/W3가 아닙니다\n');

            console.log('생성된 주소들 (참고용):');
            console.log(`메인넷 (WC0): UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC`);

            const w5_wc0 = WalletContractV5R1.create({ publicKey, workchain: 0 });
            console.log(`W5 WC0:       ${w5_wc0.address.toString({ bounceable: false })}`);

            const w5_wc_minus1 = WalletContractV5R1.create({ publicKey, workchain: -1 });
            console.log(`W5 WC-1:      ${w5_wc_minus1.address.toString({ bounceable: false })}`);

            console.log('\n💡 해결 방법:');
            console.log('1. 지갑 애플리케이션에서 테스트넷 주소의 니모닉 다시 확인');
            console.log('2. 또는 프라이빗 키를 직접 export해서 사용');
            console.log('3. 또는 니모닉 기반 배포 방법 사용');
        }

    } catch (error) {
        console.error(`❌ 오류: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}

findCorrectPrivateKey().catch(error => {
    console.error(`❌ 실패: ${error.message}`);
    process.exit(1);
});
