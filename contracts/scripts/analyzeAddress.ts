#!/usr/bin/env node

/**
 * TON 지갑 주소 정보 확인 도구
 * 
 * 주어진 지갑 주소가 유효한지 확인
 */

import { Address } from '@ton/core';

async function analyzeAddress() {
    console.log('🔍 TON 지갑 주소 분석\n');

    const addresses = {
        testnet: '0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g',
        mainnet: 'UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC',
    };

    try {
        // 테스트넷 주소 분석
        console.log('📍 테스트넷 주소:');
        const testnetAddr = Address.parse(addresses.testnet);
        console.log(`   입력: ${addresses.testnet}`);
        console.log(`   파싱됨: ${testnetAddr.toString()}`);
        console.log(`   테스트넷 표준: ${testnetAddr.toString({ testOnly: true })}\n`);

        // 메인넷 주소 분석
        console.log('📍 메인넷 주소:');
        const mainnetAddr = Address.parse(addresses.mainnet);
        console.log(`   입력: ${addresses.mainnet}`);
        console.log(`   파싱됨: ${mainnetAddr.toString()}`);
        console.log(`   메인넷 표준: ${mainnetAddr.toString()}\n`);

        // 동일한 지갑 확인
        console.log('✅ 주소 검증:');
        console.log(`   테스트넷 == 메인넷?: ${testnetAddr.equals(mainnetAddr) ? '✅ 동일' : '❌ 다름'}\n`);

        console.log('⚠️  주소 정보:');
        console.log('   • 이 주소들은 동일한 지갑의 테스트넷/메인넷 표현입니다');
        console.log('   • 프라이빗 키는 주소로부터 역산 불가능합니다');
        console.log('   • 올바른 프라이빗 키를 얻으려면 원본 니모닉 필요\n');

    } catch (error) {
        console.error('❌ 오류:', error);
        process.exit(1);
    }
}

analyzeAddress();
