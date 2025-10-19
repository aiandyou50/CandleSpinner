import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV3R2 } from '@ton/ton';

async function testV3WalletWithIndex(mnemonicString, accountIndex = 0) {
  try {
    console.log(`🔍 텔레그램 Wallet(V3) 계정 ${accountIndex}번 검증 테스트\n`);

    const mnemonic = mnemonicString.trim().split(/\s+/);
    console.log(`입력된 단어 수: ${mnemonic.length}`);
    console.log(`니모닉: ${mnemonicString}\n`);

    if (mnemonic.length !== 24) {
      console.log('❌ 24단어가 아닙니다!');
      return;
    }

    // HD wallet 파생 경로: m/44'/607'/0'/accountIndex'
    const derivationPath = `m/44'/607'/${accountIndex}'/0'`;
    console.log(`파생 경로: ${derivationPath}`);

    const keyPair = await mnemonicToPrivateKey(mnemonic, derivationPath);

    // V3R2 월렛 생성 (텔레그램 Wallet 표준)
    const wallet = WalletContractV3R2.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });

    console.log('✅ V3 변환 성공!');
    console.log('프라이빗 키:', keyPair.secretKey.toString('hex'));
    console.log('월렛 주소:', wallet.address.toString());
    console.log('User-friendly 주소:', wallet.address.toString({ urlSafe: true, bounceable: true }));

  } catch (error) {
    console.log('❌ 변환 실패:', error.message);
  }
}

// 명령줄 인수 처리
const mnemonicString = process.argv[2];
const accountIndex = parseInt(process.argv[3]) || 0;

if (mnemonicString) {
  testV3WalletWithIndex(mnemonicString, accountIndex);
} else {
  console.log('사용법: node scripts/test-v3-account.mjs "니모닉 단어들" [계정인덱스]');
  console.log('예시: node scripts/test-v3-account.mjs "word1 word2 ..." 0');
}