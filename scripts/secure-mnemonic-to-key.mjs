import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV3R2 } from '@ton/ton';
import * as fs from 'fs';
import * as path from 'path';

async function secureMnemonicToKey() {
  console.log('🔐 보안 모드로 니모닉 변환을 시작합니다...\n');

  // 임시 파일에 니모닉 입력 받기 (터미널 히스토리에 남지 않음)
  const tempFile = path.join(process.cwd(), 'temp_mnemonic.txt');

  console.log('📝 메모장이나 텍스트 편집기에서 temp_mnemonic.txt 파일을 열어 니모닉을 입력하세요.');
  console.log('파일이 생성되면 Enter를 눌러 계속 진행하세요...\n');

  // 파일이 생성될 때까지 대기
  while (!fs.existsSync(tempFile)) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  try {
    // 파일에서 니모닉 읽기
    const mnemonicText = fs.readFileSync(tempFile, 'utf8').trim();
    const mnemonic = mnemonicText.split(/\s+/);

    console.log(`📝 입력된 니모닉 단어 수: ${mnemonic.length}`);
    console.log(`📝 첫 3단어: ${mnemonic.slice(0, 3).join(' ')}...`);
    console.log(`📝 마지막 3단어: ${mnemonic.slice(-3).join(' ')}`);
    console.log('');

    if (mnemonic.length !== 24) {
      throw new Error(`니모닉은 24개의 단어여야 합니다. 현재 ${mnemonic.length}개 입력됨.`);
    }

    // 변환 수행
    const keyPair = await mnemonicToPrivateKey(mnemonic);
    const wallet = WalletContractV3R2.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });

    console.log('\n✅ 변환 완료! (터미널에만 표시됨)\n');

    console.log('🔑 프라이빗 키 (GAME_WALLET_PRIVATE_KEY):');
    console.log(keyPair.secretKey.toString('hex'));
    console.log('');

    console.log('🏠 월렛 주소 확인:');
    console.log(wallet.address.toString());
    console.log('');

    console.log('⚠️  중요: 이 키를 안전하게 백업하세요!');
    console.log('⚠️  작업 완료 후 temp_mnemonic.txt 파일을 삭제하세요!');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    // 임시 파일 즉시 삭제
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
      console.log('\n🗑️  임시 파일이 자동으로 삭제되었습니다.');
    }
  }
}

secureMnemonicToKey();