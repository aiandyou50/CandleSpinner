import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';

async function mnemonicToPrivateKeyHex() {
  // 니모닉을 입력받음
  const mnemonicInput = process.argv.slice(2).join(' ');

  if (!mnemonicInput) {
    console.log('❌ 사용법: node scripts/mnemonic-to-key.mjs "니모닉 단어들을 공백으로 구분해서 입력"');
    console.log('');
    console.log('예시: node scripts/mnemonic-to-key.mjs "drink cart act person castle cereal fine brave cheap cherry decade cliff paddle portion usual side chaos funny wrestle doll unit assume twenty camp"');
    process.exit(1);
  }

  try {
    console.log('🔄 니모닉을 프라이빗 키로 변환 중...\n');

    // 니모닉을 배열로 변환
    const mnemonic = mnemonicInput.trim().split(/\s+/);

    if (mnemonic.length !== 24) {
      console.log('❌ 니모닉은 24개의 단어여야 합니다.');
      process.exit(1);
    }

    // 니모닉에서 프라이빗 키 생성
    const keyPair = await mnemonicToPrivateKey(mnemonic);

    // V4 월렛 컨트랙트 생성 (주소 검증용)
    const wallet = WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });

    console.log('✅ 변환 완료!\n');

    console.log('🔑 프라이빗 키 (GAME_WALLET_PRIVATE_KEY로 설정):');
    console.log(keyPair.secretKey.toString('hex'));
    console.log('');

    console.log('🔓 퍼블릭 키:');
    console.log(keyPair.publicKey.toString('hex'));
    console.log('');

    console.log('🏠 월렛 주소 (확인용):');
    console.log(wallet.address.toString());
    console.log('');

    console.log('⚠️  Cloudflare Pages 환경 변수에 프라이빗 키를 설정하세요!');
    console.log('GAME_WALLET_PRIVATE_KEY =', keyPair.secretKey.toString('hex'));

  } catch (error) {
    console.error('❌ 변환 실패:', error.message);
    console.log('');
    console.log('💡 가능한 원인:');
    console.log('- 니모닉 단어가 올바르지 않음');
    console.log('- 단어 순서가 맞지 않음');
    console.log('- BIP39 표준 단어가 아님');
  }
}

mnemonicToPrivateKeyHex();