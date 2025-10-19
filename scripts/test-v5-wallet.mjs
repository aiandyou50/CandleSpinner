import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';

async function testV5Wallet(mnemonicString) {
  try {
    console.log('🔍 텔레그램 Wallet(V5) 검증 테스트\n');

    const mnemonic = mnemonicString.trim().split(/\s+/);
    console.log(`입력된 단어 수: ${mnemonic.length}`);
    console.log(`니모닉: ${mnemonicString}\n`);

    if (mnemonic.length !== 24) {
      console.log('❌ 24단어가 아닙니다!');
      return;
    }

    const keyPair = await mnemonicToPrivateKey(mnemonic);

    // V5R1 월렛 생성 (텔레그램 Wallet 최신 버전)
    const wallet = WalletContractV5R1.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });

    console.log('✅ V5 변환 성공!');
    console.log('프라이빗 키:', keyPair.secretKey.toString('hex'));
    console.log('월렛 주소:', wallet.address.toString());
    console.log('User-friendly 주소:', wallet.address.toString({ urlSafe: true, bounceable: true }));

  } catch (error) {
    console.log('❌ 변환 실패:', error.message);
  }
}

// 테스트할 니모닉을 여기에 입력하세요
const testMnemonicString = process.argv[2];
if (testMnemonicString) {
  testV5Wallet(testMnemonicString);
} else {
  console.log('사용법: node scripts/test-v5-wallet.mjs "니모닉 단어들"');
}