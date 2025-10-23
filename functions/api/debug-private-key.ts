/**
 * GET /api/debug-private-key
 * 
 * 환경변수의 개인키 형식 검증
 * - hex format인지 확인
 * - mnemonic인지 확인
 * - 개인키로부터 게임 지갑 주소 생성 가능한지 확인
 */

import { keyPairFromSecretKey } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';

export async function onRequestGet(context: any) {
  const env = context.env;

  try {
    const gameWalletPrivateKey = env.GAME_WALLET_PRIVATE_KEY;
    const gameWalletAddress = env.GAME_WALLET_ADDRESS;

    const result: any = {
      hasPrivateKey: !!gameWalletPrivateKey,
      hasGameWalletAddress: !!gameWalletAddress,
      privateKeyLength: gameWalletPrivateKey?.length || 0,
      gameWalletAddress,
      issues: []
    };

    if (!gameWalletPrivateKey) {
      result.issues.push('❌ GAME_WALLET_PRIVATE_KEY 환경 변수 미설정');
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 개인키 형식 분석
    console.log(`[디버그] 개인키 길이: ${gameWalletPrivateKey.length}`);
    console.log(`[디버그] 개인키 처음 50자: ${gameWalletPrivateKey.substring(0, 50)}`);

    // 1. Hex 형식인가?
    if (!/^[0-9a-fA-F]*$/.test(gameWalletPrivateKey)) {
      result.issues.push('⚠️ Hex 형식이 아님 (0-9, a-f만 포함해야 함)');
      result.format = 'UNKNOWN (not hex)';
      
      // Mnemonic일 수도?
      if (gameWalletPrivateKey.includes(' ')) {
        result.format = 'POSSIBLY_MNEMONIC (contains spaces)';
        result.issues.push('🔴 MNEMONIC 형식으로 보임. Hex format의 개인키가 필요합니다!');
      }
    } else {
      result.format = 'HEX';

      // 2. 길이 확인 (개인키는 32바이트 = 64 hex characters)
      if (gameWalletPrivateKey.length !== 128) {
        result.issues.push(`⚠️ 개인키 길이 오류: ${gameWalletPrivateKey.length}자 (128자여야 함)`);
      } else {
        result.privateKeyLength_bytes = 64;
        result.privateKeyFormat = '✅ 정상적인 길이 (64 bytes = 128 hex characters)';
      }

      // 3. 실제로 키페어를 생성할 수 있는가?
      try {
        const keyPair = keyPairFromSecretKey(Buffer.from(gameWalletPrivateKey, 'hex'));
        result.keyPairCreated = true;
        result.publicKeyLength = keyPair.publicKey.length;
        result.publicKeyLength_hex = keyPair.publicKey.toString('hex').length;

        // 4. 게임 지갑 주소 생성 가능한가?
        try {
          const gameWallet = WalletContractV5R1.create({
            publicKey: keyPair.publicKey,
            workchain: 0
          });

          const derivedAddress = gameWallet.address.toString();
          result.derivedWalletAddress = derivedAddress;
          result.addressMatches = derivedAddress === gameWalletAddress;

          if (!result.addressMatches) {
            result.issues.push(
              `⚠️ 개인키로부터 생성된 주소와 환경변수 주소 불일치!\n` +
              `생성된 주소: ${derivedAddress}\n` +
              `환경변수: ${gameWalletAddress}`
            );
          } else {
            result.verification = '✅ 개인키와 지갑 주소가 일치합니다! (V5R1 - Telegram TON Wallet)';
          }
        } catch (walletError) {
          result.walletCreationError = walletError instanceof Error ? walletError.message : String(walletError);
          result.issues.push(`🔴 지갑 생성 실패: ${result.walletCreationError}`);
        }
      } catch (keyError) {
        result.keyPairCreated = false;
        result.keyPairError = keyError instanceof Error ? keyError.message : String(keyError);
        result.issues.push(`🔴 키페어 생성 실패: ${result.keyPairError}`);
      }
    }

    // 최종 판정
    if (result.issues.length === 0) {
      result.status = '✅ 모든 검증 통과!';
    } else {
      result.status = '⚠️ 문제 있음';
    }

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[디버그] 오류:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
