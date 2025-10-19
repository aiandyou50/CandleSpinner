const TonWeb = require('tonweb');

export async function onRequestGet() {
  try {
    // 새로운 니모닉 생성 (24단어)
    const mnemonic = TonWeb.mnemonic.generate(24);

    // 니모닉에서 키페어 생성
    const keyPair = TonWeb.mnemonic.mnemonicToKeyPair(mnemonic);

    // 월렛 생성
    const wallet = new TonWeb.wallet.create({ publicKey: keyPair.publicKey });

    return new Response(JSON.stringify({
      mnemonic: mnemonic.join(' '),
      privateKey: TonWeb.utils.bytesToHex(keyPair.secretKey),
      publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
      address: wallet.address.toString(true, true, true)
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