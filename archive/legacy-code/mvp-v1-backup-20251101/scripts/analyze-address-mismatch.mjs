import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';
import { Address } from '@ton/ton';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 테스트넷 주소에 매칭되는 올바른 니모닉/프라이빗 키 찾기
 * 
 * 문제 상황:
 * - 메인넷 주소: UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC ✅ (현재 프라이빗 키와 매칭)
 * - 테스트넷 주소: 0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g ❌ (프라이빗 키와 불일치)
 * 
 * 가능성:
 * 1. 제공된 니모닉이 메인넷 주소 생성용이고, 테스트넷 주소는 다른 니모닉에서 생성됨
 * 2. 테스트넷 주소의 올바른 프라이빗 키가 필요
 */

async function reverseAddressToFindNemonic() {
  console.log('🔍 Reverse Address Lookup\n');

  const targetTestnetAddr = '0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g';
  const targetMainnetAddr = 'UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC';

  console.log('📋 Target Addresses:');
  console.log(`  Mainnet:  ${targetMainnetAddr} ✅`);
  console.log(`  Testnet:  ${targetTestnetAddr} ❌\n`);

  // 1. 환경 변수 로드
  const envPath = path.join(__dirname, '..', 'contracts', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });

  const { DEPLOYER_MNEMONIC, DEPLOYER_PRIVATE_KEY } = env;

  // 2. 현재 프라이빗 키로 생성되는 주소 확인
  console.log('🔐 Current Private Key Analysis:');
  try {
    const mnemonic = DEPLOYER_MNEMONIC.split(' ');
    const keyPair = await mnemonicToPrivateKey(mnemonic);

    // 메인넷 주소 생성
    const mainnetWallet = WalletContractV5R1.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });

    const mainnetAddr = mainnetWallet.address.toString({ bounceable: false });
    console.log(`  Generated Mainnet: ${mainnetAddr}`);
    console.log(`  Matches Target:    ${mainnetAddr === targetMainnetAddr ? '✅ YES' : '❌ NO'}\n`);

    // 테스트넷 (workchain -1) 주소 시도
    const testnetWallet = WalletContractV5R1.create({
      publicKey: keyPair.publicKey,
      workchain: -1,
    });

    const testnetAddrNegative = testnetWallet.address.toString({ bounceable: false });
    console.log(`  Generated Testnet (WC-1): ${testnetAddrNegative}`);
    console.log(`  Matches Target:           ${testnetAddrNegative === targetTestnetAddr ? '✅ YES' : '❌ NO'}\n`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }

  // 3. 결론 및 권장사항
  console.log('📊 Analysis Result:');
  console.log(`┌─────────────────────────────────────┐`);
  console.log(`│ 상황: 프라이빗 키 불일치 확인됨      │`);
  console.log(`│                                   │`);
  console.log(`│ 원인 분석:                        │`);
  console.log(`│ 1. 제공된 니모닉으로 생성된 주소   │`);
  console.log(`│    → 메인넷: UQC2DJ8... ✅ 일치    │`);
  console.log(`│    → 테스트넷: 0QB_... ❌ 불일치   │`);
  console.log(`│                                   │`);
  console.log(`│ 2. 테스트넷 주소(0QB_...)는       │`);
  console.log(`│    다른 니모닉/프라이빗 키에서     │`);
  console.log(`│    생성되었을 가능성 높음         │`);
  console.log(`└─────────────────────────────────────┘\n`);

  console.log('✅ 권장 해결 방법:');
  console.log(`\n옵션 A: 테스트넷 주소의 올바른 니모닉 찾기`);
  console.log(`  1. 지갑 애플리케이션 확인`);
  console.log(`  2. 0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g 주소의 니모닉 확인`);
  console.log(`  3. 그 니모닉으로 프라이빗 키 생성`);
  console.log(`  4. .env.local에 업데이트`);
  
  console.log(`\n옵션 B: 테스트넷 주소의 프라이빗 키 직접 export`);
  console.log(`  1. 지갑 설정에서 "Export Private Key" 또는 "View Secret"`);
  console.log(`  2. 프라이빗 키 복사`);
  console.log(`  3. .env.local DEPLOYER_PRIVATE_KEY에 입력`);

  console.log(`\n옵션 C: 메인넷 주소로 테스트 수행`);
  console.log(`  1. 메인넷 주소가 올바르게 생성됨 ✅`);
  console.log(`  2. 메인넷 환경 변수로 테스트넷 배포 (workchain 조정)`);
  console.log(`  3. 메인넷 배포 전에 테스트넷에서 완벽히 테스트`);
}

reverseAddressToFindNemonic().catch(error => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});
