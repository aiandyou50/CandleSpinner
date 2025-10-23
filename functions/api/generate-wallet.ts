import '../_bufferPolyfill';
import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';

export async function onRequestGet() {
  try {
    // 새로운 니모닉 생성 (24단어)
    const mnemonic = await mnemonicNew(24);

    // 니모닉에서 프라이빗 키 생성
    const keyPair = await mnemonicToPrivateKey(mnemonic);

    // V5R1 월렛 컨트랙트 생성 (Telegram TON Wallet)
    const wallet = WalletContractV5R1.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });

    return new Response(JSON.stringify({
      mnemonic: mnemonic.join(' '),
      privateKey: keyPair.secretKey.toString('hex'),
      publicKey: keyPair.publicKey.toString('hex'),
      address: wallet.address.toString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: '월렛 생성 실패: ' + (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}