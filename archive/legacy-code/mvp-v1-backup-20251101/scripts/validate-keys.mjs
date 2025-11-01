import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function validateKeys() {
  console.log('🔐 Private Key Validation Script\n');

  // 1. 환경 변수 로드
  const envPath = path.join(__dirname, '..', 'contracts', '.env.local');
  console.log(`📂 Reading: ${envPath}\n`);

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });

  const { DEPLOYER_MNEMONIC, DEPLOYER_PRIVATE_KEY, DEPLOYER_WALLET_ADDRESS_TESTNET } = env;

  // 2. 프라이빗 키 형식 확인
  console.log('📋 Private Key Format Check:');
  console.log(`  Stored Key: ${DEPLOYER_PRIVATE_KEY?.substring(0, 16)}...${DEPLOYER_PRIVATE_KEY?.substring(-16)}`);
  console.log(`  Length: ${DEPLOYER_PRIVATE_KEY?.length} (expected: 128)\n`);

  if (DEPLOYER_PRIVATE_KEY?.length !== 128) {
    console.error(`❌ INVALID: Private key should be 128 hex characters (64 bytes)\n`);
  } else {
    console.log(`✅ Valid format\n`);
  }

  // 3. 니모닉에서 프라이빗 키 생성
  console.log('🔑 Generating Private Key from Mnemonic:');
  try {
    const mnemonic = DEPLOYER_MNEMONIC.split(' ');
    const keyPair = await mnemonicToPrivateKey(mnemonic);
    const generatedPrivateKey = keyPair.secretKey.toString('hex');
    
    console.log(`  Generated: ${generatedPrivateKey.substring(0, 16)}...${generatedPrivateKey.substring(-16)}`);
    console.log(`  Length: ${generatedPrivateKey.length}\n`);

    // 4. 프라이빗 키 비교
    console.log('🔍 Private Key Comparison:');
    if (generatedPrivateKey === DEPLOYER_PRIVATE_KEY) {
      console.log(`✅ MATCH: Generated key matches stored key\n`);
    } else {
      console.warn(`⚠️  MISMATCH: Keys are different!\n`);
      console.log(`  Stored:    ${DEPLOYER_PRIVATE_KEY}`);
      console.log(`  Generated: ${generatedPrivateKey}\n`);
    }

    // 5. 지갑 주소 생성 및 비교
    console.log('🏠 Wallet Address Generation:');
    const wallet = WalletContractV5R1.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });

    const generatedAddr = wallet.address.toString({ bounceable: false });
    console.log(`  Generated: ${generatedAddr}`);
    console.log(`  Stored:    ${DEPLOYER_WALLET_ADDRESS_TESTNET}\n`);

    if (generatedAddr === DEPLOYER_WALLET_ADDRESS_TESTNET) {
      console.log(`✅ MATCH: Generated address matches stored address\n`);
    } else {
      console.warn(`⚠️  MISMATCH: Addresses are different!\n`);
      console.log(`  This could indicate:\n`);
      console.log(`  1. Different mnemonic/private key\n`);
      console.log(`  2. Different wallet version\n`);
      console.log(`  3. Different workchain\n`);
    }

    // 6. 최종 결과 요약
    console.log('📊 Summary:');
    console.log('┌─ Private Key Validation ─────────────┐');
    console.log(`│ Format:      ${DEPLOYER_PRIVATE_KEY?.length === 128 ? '✅ Valid' : '❌ Invalid'}${' '.repeat(20)}`);
    console.log(`│ Consistency: ${generatedPrivateKey === DEPLOYER_PRIVATE_KEY ? '✅ Match' : '⚠️  Mismatch'}${' '.repeat(19)}`);
    console.log(`│ Address:     ${generatedAddr === DEPLOYER_WALLET_ADDRESS_TESTNET ? '✅ Match' : '⚠️  Mismatch'}${' '.repeat(19)}`);
    console.log('└─────────────────────────────────────┘');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

validateKeys().catch(error => {
  console.error(`❌ Validation failed: ${error.message}`);
  process.exit(1);
});
