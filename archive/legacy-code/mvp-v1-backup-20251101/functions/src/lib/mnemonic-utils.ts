/**
 * Mnemonic utility functions for TON wallet operations
 * 
 * This module provides secure and consistent mnemonic handling across all APIs.
 */

import { mnemonicToPrivateKey, mnemonicValidate } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';
import { webcrypto } from 'node:crypto';
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto as any;
}

/**
 * Validates and converts a mnemonic string to a keypair
 * 
 * @param mnemonicString - 24-word mnemonic separated by spaces
 * @returns keypair with publicKey and secretKey
 * @throws Error if mnemonic is invalid
 */
export async function validateAndConvertMnemonic(mnemonicString: string): Promise<{
  publicKey: Buffer;
  secretKey: Buffer;
}> {
  // Split mnemonic into word array
  const mnemonic = mnemonicString.trim().split(/\s+/);
  
  // Validate word count
  if (mnemonic.length !== 24) {
    throw new Error(
      `유효하지 않은 니모닉 단어 수: ${mnemonic.length}개 (24개여야 함)`
    );
  }
  
  // Validate BIP39 standard
  const isValid = await mnemonicValidate(mnemonic);
  if (!isValid) {
    throw new Error('유효하지 않은 니모닉: BIP39 검증 실패');
  }
  
  // Convert to keypair
  return await mnemonicToPrivateKey(mnemonic);
}

/**
 * Creates a V5R1 wallet from a mnemonic
 * 
 * @param mnemonicString - 24-word mnemonic separated by spaces
 * @param workchain - TON workchain (default: 0)
 * @returns WalletContractV5R1 instance
 * @throws Error if mnemonic is invalid
 */
export async function createWalletFromMnemonic(
  mnemonicString: string,
  workchain: number = 0
): Promise<WalletContractV5R1> {
  const keyPair = await validateAndConvertMnemonic(mnemonicString);
  
  return WalletContractV5R1.create({
    publicKey: keyPair.publicKey,
    workchain
  });
}

/**
 * Gets both keypair and wallet from a mnemonic
 * 
 * @param mnemonicString - 24-word mnemonic separated by spaces
 * @param workchain - TON workchain (default: 0)
 * @returns Object containing keypair and wallet
 * @throws Error if mnemonic is invalid
 */
export async function getKeyPairAndWallet(
  mnemonicString: string,
  workchain: number = 0
): Promise<{
  keyPair: { publicKey: Buffer; secretKey: Buffer };
  wallet: WalletContractV5R1;
}> {
  const keyPair = await validateAndConvertMnemonic(mnemonicString);
  
  const wallet = WalletContractV5R1.create({
    publicKey: keyPair.publicKey,
    workchain
  });
  
  return { keyPair, wallet };
}

/**
 * Validates a mnemonic without converting it
 * 
 * @param mnemonicString - 24-word mnemonic separated by spaces
 * @returns true if valid, false otherwise
 */
export async function isMnemonicValid(mnemonicString: string): Promise<boolean> {
  try {
    const mnemonic = mnemonicString.trim().split(/\s+/);
    
    if (mnemonic.length !== 24) {
      return false;
    }
    
    return await mnemonicValidate(mnemonic);
  } catch {
    return false;
  }
}
