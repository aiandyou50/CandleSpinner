import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV3R2 } from '@ton/ton';

async function generateWallet() {
  try {
    console.log('🎲 새로운 TON 월렛 생성 중...\n');

    // 새로운 니모닉 생성 (24단어)
    const mnemonic = await mnemonicNew(24);
    console.log('📝 니모닉 (반드시 안전하게 백업하세요!):');
    console.log(mnemonic.join(' '));
    console.log('');

    // 니모닉에서 프라이빗 키 생성
    const keyPair = await mnemonicToPrivateKey(mnemonic);

    // V3R2 월렛 컨트랙트 생성 (텔레그램 Wallet 호환)
    const wallet = WalletContractV3R2.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });

    console.log('🔑 프라이빗 키 (GAME_WALLET_PRIVATE_KEY로 설정):');
    console.log(keyPair.secretKey.toString('hex'));
    console.log('');

    console.log('🔓 퍼블릭 키:');
    console.log(keyPair.publicKey.toString('hex'));
    console.log('');

    console.log('🏠 월렛 주소 (CSPIN 토큰 충전용):');
    console.log(wallet.address.toString());
    console.log('');

    console.log('⚠️  보안 주의사항:');
    console.log('1. 니모닉과 프라이빗 키를 절대 공개하지 마세요!');
    console.log('2. 안전한 곳에 백업하세요');
    console.log('3. 이 월렛에 CSPIN 토큰을 충전한 후 게임에 사용하세요');
    console.log('4. 테스트 완료 후 실제 운영 시 별도 월렛 생성 권장');

  } catch (error) {
    console.error('월렛 생성 실패:', error);
  }
}

generateWallet();