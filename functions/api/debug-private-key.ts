/**
 * GET /api/debug-private-key
 * 
 * 환경변수의 개인키 형식 검증
 * - mnemonic인지 확인 (24 단어)
 * - BIP39 유효성 검증
 * - 니모닉으로부터 게임 지갑 주소 생성 가능한지 확인
 */

import { WalletContractV5R1 } from '@ton/ton';
import { isMnemonicValid, validateAndConvertMnemonic } from './mnemonic-utils';

export async function onRequestGet(context: any) {
  const env = context.env;

  try {
    const gameWalletMnemonic = env.GAME_WALLET_PRIVATE_KEY;
    const gameWalletAddress = env.GAME_WALLET_ADDRESS;

    const result: any = {
      hasMnemonic: !!gameWalletMnemonic,
      hasGameWalletAddress: !!gameWalletAddress,
      gameWalletAddress,
      issues: []
    };

    if (!gameWalletMnemonic) {
      result.issues.push('❌ GAME_WALLET_PRIVATE_KEY 환경 변수 미설정');
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 니모닉 형식 분석
    const mnemonic = gameWalletMnemonic.trim().split(/\s+/);
    result.mnemonicWordCount = mnemonic.length;
    result.mnemonicFirstWords = `${mnemonic.slice(0, 3).join(' ')}... (${mnemonic.length} words total)`;

    console.log(`[디버그] 니모닉 단어 수: ${mnemonic.length}`);

    // 1. 단어 수 확인 및 BIP39 유효성 검증
    const isValid = await isMnemonicValid(gameWalletMnemonic);
    
    if (mnemonic.length !== 24) {
      result.issues.push(`⚠️ 니모닉 단어 수 오류: ${mnemonic.length}개 (24개여야 함)`);
      result.format = 'INVALID_MNEMONIC_LENGTH';
      result.mnemonicValid = false;
    } else if (!isValid) {
      result.format = 'MNEMONIC_24_WORDS';
      result.issues.push('⚠️ 유효하지 않은 니모닉: BIP39 검증 실패');
      result.mnemonicValid = false;
    } else {
      result.format = 'MNEMONIC_24_WORDS';
      result.mnemonicValid = true;
      result.mnemonicValidation = '✅ BIP39 검증 통과';

      // 2. 실제로 키페어를 생성할 수 있는가?
      try {
        const keyPair = await validateAndConvertMnemonic(gameWalletMnemonic);
        result.keyPairCreated = true;
        result.publicKeyLength = keyPair.publicKey.length;
        result.secretKeyLength = keyPair.secretKey.length;

        // 3. 게임 지갑 주소 생성 가능한가?
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
              `⚠️ 니모닉으로부터 생성된 주소와 환경변수 주소 불일치!\n` +
              `생성된 주소: ${derivedAddress}\n` +
              `환경변수: ${gameWalletAddress}`
            );
          } else {
            result.verification = '✅ 니모닉과 지갑 주소가 일치합니다! (V5R1 - Telegram TON Wallet)';
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
