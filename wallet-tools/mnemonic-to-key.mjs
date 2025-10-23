#!/usr/bin/env node

import { mnemonicToPrivateKey, mnemonicValidate } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';
import { Address } from '@ton/ton';

async function mnemonicToWallet(mnemonicInput) {
  try {
    const mnemonic = mnemonicInput.trim().split(/\s+/);
    
    console.log(`Mnemonic word count: ${mnemonic.length}`);
    
    const isValid = await mnemonicValidate(mnemonic);
    if (!isValid) {
      throw new Error(`Invalid mnemonic`);
    }
    console.log('Mnemonic validated (BIP39)');
    
    const keyPair = await mnemonicToPrivateKey(mnemonic);
    
    const privateKeyHex = keyPair.secretKey.slice(0, 32).toString('hex');
    console.log(`\nPrivate Key (ED25519):\n${privateKeyHex}`);
    
    const publicKeyHex = keyPair.publicKey.toString('hex');
    console.log(`\nPublic Key:\n${publicKeyHex}`);
    
    const wallet = WalletContractV5R1.create({
      publicKey: keyPair.publicKey,
      workchain: 0
    });
    
    const walletAddress = wallet.address;
    const bounceable = walletAddress.toString({ bounceable: true });
    const nonBounceable = walletAddress.toString({ bounceable: false });
    
    console.log(`\nWallet Address (V5R1 - Telegram TON Wallet):`);
    console.log(`Bounceable (EQ...):     ${bounceable}`);
    console.log(`Non-Bounceable (UQ...): ${nonBounceable}`);
    
    console.log(`\nJSON Output:`);
    console.log(JSON.stringify({
      mnemonic: mnemonic.join(' '),
      privateKey: privateKeyHex,
      publicKey: publicKeyHex,
      walletAddress: { bounceable, nonBounceable },
      workchain: 0,
      walletVersion: 'V5R1 (Telegram TON Wallet)'
    }, null, 2));
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

const mnemonicInput = process.argv[2];
if (!mnemonicInput) {
  console.error('Usage: node mnemonic-to-key.mjs "<24-word-mnemonic>"');
  process.exit(1);
}

mnemonicToWallet(mnemonicInput);
