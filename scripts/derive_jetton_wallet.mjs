#!/usr/bin/env node
import { readFileSync } from 'fs';
import { Address, beginCell, Cell } from '@ton/core';
import { TonClient } from '@ton/ton';
import { sha256 } from '@ton/crypto';

// Usage: node scripts/derive_jetton_wallet.mjs <masterAddress> <ownerAddress>
// prints base64 or friendly address for the derived jetton wallet

async function main(){
  const [master, owner] = process.argv.slice(2);
  if(!master || !owner){
    console.error('Usage: node scripts/derive_jetton_wallet.mjs <masterAddress> <ownerAddress>');
    process.exit(1);
  }

  try{
    // Get wallet_code from master contract
    const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC' });
    const masterAddress = Address.parse(master);
    const result = await client.callGetMethod(masterAddress, 'get_jetton_data');
    const walletCode = result.stack[2];
    console.log('Wallet Code:', walletCode.toBoc().toString('hex'));

    // Now compute the address
    const ownerAddress = Address.parse(owner);
    const data = beginCell().storeAddress(masterAddress).storeAddress(ownerAddress).endCell();
    const combined = Buffer.concat([walletCode.hash(), data.hash()]);
    const hash = await sha256(combined);
    const jettonWalletAddress = new Address(0, hash.slice(0, 32));
    console.log('Jetton Wallet Address:', jettonWalletAddress.toString());
  }catch(e){
    console.error('Error deriving jetton wallet:', e);
    process.exit(3);
  }
}

main();
