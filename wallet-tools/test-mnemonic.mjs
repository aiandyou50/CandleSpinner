import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV3R2 } from '@ton/ton';

async function testMnemonic(mnemonicString) {
  try {
    console.log('🔍 니모닉 검증 테스트\n');

    const mnemonic = mnemonicString.trim().split(/\s+/);
    console.log(`입력된 단어 수: ${mnemonic.length}`);
    console.log(`니모닉: ${mnemonicString}\n`);

    if (mnemonic.length !== 24) {
      console.log('❌ 24단어가 아닙니다!');
      return;
    }

    const keyPair = await mnemonicToPrivateKey(mnemonic);
    const wallet = WalletContractV3R2.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });

    console.log('✅ 변환 성공!');
    console.log('프라이빗 키:', keyPair.secretKey.toString('hex'));
    console.log('월렛 주소:', wallet.address.toString());

  } catch (error) {
    console.log('❌ 변환 실패:', error.message);
  }
}

// 테스트할 니모닉을 여기에 입력하세요
const testMnemonicString = process.argv[2];
if (testMnemonicString) {
  testMnemonic(testMnemonicString);
} else {
  console.log('사용법: node scripts/test-mnemonic.mjs "니모닉 단어들"');
}