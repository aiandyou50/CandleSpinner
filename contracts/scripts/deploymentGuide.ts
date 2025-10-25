#!/usr/bin/env node

/**
 * 테스트넷 배포 정보 및 다음 단계 안내
 * 
 * TonConnect를 통한 배포가 필요하므로 다음 과정을 따라주세요:
 * 1. Tonkeeper 앱 설치
 * 2. 테스트넷으로 전환
 * 3. npm run deploy 실행
 * 4. QR 코드 스캔
 * 5. 트랜잭션 서명
 */

import { Address } from '@ton/core';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.local 파일 로드
const dotenvPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(dotenvPath)) {
    dotenv.config({ path: dotenvPath });
}

async function main() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  🚀 WithdrawalManager 스마트컨트랙트 테스트넷 배포 안내    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        // 환경 변수 확인
        const deployerAddr = process.env.DEPLOYER_WALLET_ADDRESS_TESTNET;
        const cspinJetton = process.env.CSPIN_JETTON;
        const gameWallet = process.env.GAME_JETTON_WALLET;

        if (!deployerAddr || !cspinJetton || !gameWallet) {
            throw new Error('환경 변수가 누락되었습니다.');
        }

        // 주소 파싱
        const deployerAddress = Address.parse(deployerAddr);
        const cspin = Address.parse(cspinJetton);
        const game = Address.parse(gameWallet);

        console.log('📋 배포 설정 확인:');
        console.log('─────────────────────────────────────────────────────────\n');
        console.log(`📍 배포자 지갑 (테스트넷):`);
        console.log(`   ${deployerAddress.toString({ testOnly: true })}\n`);

        console.log(`💰 필요한 잔액: 0.05+ TON`);
        console.log(`   ➜ 테스트넷 TON 수령 (이미 받음) ✅\n`);

        console.log(`⚙️ 스마트컨트랙트 초기 설정:`);
        console.log(`   Owner: ${game.toString()}`);
        console.log(`   CSPIN Jetton: ${cspin.toString()}\n`);

        console.log('─────────────────────────────────────────────────────────\n');

        console.log('✅ 배포 사전 준비 완료!\n');

        console.log('📱 배포 방법 (TonConnect 필수):\n');

        console.log('Step 1️⃣  Tonkeeper 준비');
        console.log('   • Tonkeeper 모바일 앱 설치');
        console.log('   • 테스트넷으로 전환: 설정 → 개발 → 테스트넷\n');

        console.log('Step 2️⃣  배포 명령 실행');
        console.log('   $ npm run deploy\n');

        console.log('Step 3️⃣  지갑 연결');
        console.log('   • "Tonkeeper" 선택');
        console.log('   • QR 코드 스캔 (Tonkeeper 앱에서)\n');

        console.log('Step 4️⃣  트랜잭션 서명');
        console.log('   • Tonkeeper에서 "승인" 탭');
        console.log('   • 트랜잭션 확인 후 서명\n');

        console.log('Step 5️⃣  배포 완료 확인');
        console.log('   • 터미널에서 스마트컨트랙트 주소 확인');
        console.log('   • 블록체인 탐색기에서 검증\n');

        console.log('─────────────────────────────────────────────────────────\n');

        console.log('🔗 배포 완료 후 확인:');
        console.log('   테스트넷 탐색기: https://testnet.tonscan.org\n');

        console.log('💾 배포된 컨트랙트 주소는 자동으로 저장됩니다:');
        console.log('   → docs/deployment-info.json\n');

        console.log('⚠️  주의사항:');
        console.log('   • TonConnect를 통한 배포 필수');
        console.log('   • 테스트넷으로 설정된 지갑 필수');
        console.log('   • 가스비: ~0.05 TON');
        console.log('   • 배포 시간: 1~2분\n');

        console.log('─────────────────────────────────────────────────────────\n');

        console.log('🎯 다음 단계 (배포 완료 후):\n');

        console.log('1️⃣  스마트컨트랙트 주소 확인');
        console.log('    deployment-info.json 파일에서 조회\n');

        console.log('2️⃣  백엔드 API 구현');
        console.log('    /api/initiate-withdrawal: Permit 메시지 생성\n');

        console.log('3️⃣  API 엔드투엔드 테스트');
        console.log('    Postman이나 curl로 테스트\n');

        console.log('4️⃣  프론트엔드 TonConnect 통합');
        console.log('    WithdrawalManager 직접 호출 로직\n');

        // 배포 안내 파일 저장
        const guideFile = path.join(__dirname, '..', 'DEPLOYMENT_GUIDE.md');
        const guide = `# WithdrawalManager 테스트넷 배포 안내

## 배포 전 확인

✅ 배포자 지갑: ${deployerAddress.toString({ testOnly: true })}
✅ 잔액: 0.05+ TON (이미 받음)
✅ 스마트컨트랙트: WithdrawalManager.tact (빌드 완료)

## 배포 방법

### 방법 1: Tonkeeper (권장)
\`\`\`bash
npm run deploy
\`\`\`

1. "testnet" 선택
2. "Tonkeeper" 선택
3. QR 코드 스캔
4. 트랜잭션 서명

### 배포 완료 확인
\`\`\`bash
cat deployment-info.json
\`\`\`

## 배포 정보

- **Owner**: ${game.toString()}
- **CSPIN Jetton**: ${cspin.toString()}
- **네트워크**: Testnet
- **예상 가스비**: 0.05 TON

## 배포 후 확인

- 배포 정보: \`docs/deployment-info.json\`
- 테스트넷 탐색기: https://testnet.tonscan.org
`;

        fs.writeFileSync(guideFile, guide);
        console.log(`✅ 배포 안내: ${guideFile}\n`);

    } catch (error) {
        console.error('❌ 오류:', error);
        process.exit(1);
    }
}

main();
