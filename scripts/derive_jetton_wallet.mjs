#!/usr/bin/env node
import { readFileSync } from 'fs';
import { Address, beginCell, Cell } from 'ton-core';

// Usage: node scripts/derive_jetton_wallet.mjs <masterAddress> <ownerAddress>
// prints base64 or friendly address for the derived jetton wallet

async function main(){
  const [master, owner] = process.argv.slice(2);
  if(!master || !owner){
    console.error('Usage: node scripts/derive_jetton_wallet.mjs <masterAddress> <ownerAddress>');
    process.exit(1);
  }

  try{
    // Many token standards compute wallet address by hashing code+data.
    // ton-core provides JettonWallet.getAddress helper in some builds; try dynamic import
    const ton = await import('ton-core');
    if(ton.getJettonWalletAddress){
      const addr = ton.getJettonWalletAddress(master, owner);
      console.log(addr.toString());
      process.exit(0);
    }

    if(ton.JettonWallet && typeof ton.JettonWallet.getAddress === 'function'){
      const addr = ton.JettonWallet.getAddress(master, owner);
      console.log(addr.toString());
      process.exit(0);
    }

    // fallback: try to mimic standard by constructing state init if possible - this is best-effort
    console.error('Could not find helper in ton-core build; please use a ton-core build with jetton helpers.');
    process.exit(2);
  }catch(e){
    console.error('Error deriving jetton wallet:', e);
    process.exit(3);
  }
}

main();
