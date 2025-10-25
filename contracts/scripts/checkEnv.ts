#!/usr/bin/env node
/**
 * 배포 환경 확인 스크립트
 * 테스트넷/메인넷 배포 전에 환경 변수 확인
 */

import * as fs from 'fs';
import * as path from 'path';

// .env.local 파일 로드
const dotenvPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(dotenvPath)) {
    const dotenv = require('dotenv');
    dotenv.config({ path: dotenvPath });
}

function checkEnv() {
    console.log('\n🔍 배포 환경 확인 중...\n');
    
    // 필수 환경 변수
    const requiredEnv = [
        'CSPIN_JETTON',
        'GAME_JETTON_WALLET',
        'DEPLOYER_PRIVATE_KEY',
        'DEPLOYER_WALLET_ADDRESS_TESTNET',
        'DEPLOYER_WALLET_ADDRESS_MAINNET'
    ];
    
    let allValid = true;
    const results: { [key: string]: boolean } = {};
    
    console.log('📋 환경 변수 체크:');
    console.log('─'.repeat(60));
    
    for (const envVar of requiredEnv) {
        const value = process.env[envVar];
        const isValid = !!value;
        results[envVar] = isValid;
        
        const icon = isValid ? '✅' : '❌';
        const display = isValid 
            ? value.substring(0, 20) + '...' 
            : '(설정되지 않음)';
        
        console.log(`${icon} ${envVar}`);
        console.log(`   ${display}`);
        
        if (!isValid) allValid = false;
    }
    
    console.log('─'.repeat(60));
    
    // 파일 체크
    console.log('\n📁 파일 확인:');
    console.log('─'.repeat(60));
    
    const requiredFiles = [
        { path: '.env.local', description: '환경 변수 파일' },
        { path: 'sources/WithdrawalManager.tact', description: '스마트컨트랙트' },
        { path: 'wrappers/WithdrawalManager.ts', description: 'TypeScript 래퍼' },
        { path: 'scripts/deployWithdrawalManager.ts', description: '배포 스크립트' }
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(process.cwd(), file.path);
        const exists = fs.existsSync(filePath);
        const icon = exists ? '✅' : '❌';
        console.log(`${icon} ${file.description}: ${file.path}`);
        
        if (!exists) allValid = false;
    }
    
    console.log('─'.repeat(60));
    
    // npm 패키지 확인
    console.log('\n📦 npm 패키지 확인:');
    console.log('─'.repeat(60));
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const requiredPackages = [
            '@ton/blueprint',
            '@ton/core',
            '@ton/ton',
            '@ton/sandbox',
            'typescript'
        ];
        
        for (const pkg of requiredPackages) {
            const hasPkg = packageJson.devDependencies && packageJson.devDependencies[pkg];
            const icon = hasPkg ? '✅' : '❌';
            console.log(`${icon} ${pkg}: ${hasPkg || '(설치되지 않음)'}`);
            
            if (!hasPkg) allValid = false;
        }
    }
    
    console.log('─'.repeat(60));
    
    // 최종 결과
    console.log('\n🎯 최종 확인:');
    if (allValid) {
        console.log('✅ 모든 환경이 준비되었습니다!');
        console.log('\n📝 다음 명령어로 배포 시작:');
        console.log('   npm run deploy -- --testnet    (테스트넷)');
        console.log('   npm run deploy -- --mainnet    (메인넷)');
        return 0;
    } else {
        console.log('❌ 일부 환경이 준비되지 않았습니다.');
        console.log('\n🔧 해결 방법:');
        console.log('   1. .env.local 파일 확인');
        console.log('   2. npm install 실행');
        console.log('   3. 필수 환경 변수 설정');
        return 1;
    }
}

process.exit(checkEnv());
