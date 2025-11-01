#!/usr/bin/env node

/**
 * W5 (WalletContractV5R1) 지갑 생성 스크립트
 * 
 * TON 블록체인의 최신 V5 버전 지갑 계약을 생성합니다.
 * 니모닉 또는 프라이빗 키에서 지갑을 파생할 수 있습니다.
 * 
 * 사용법:
 *   ***REMOVED***니모닉에서 생성
 *   node scripts/create-w5-wallet.mjs --mnemonic "word1 word2 ..."
 *   
 *   ***REMOVED***프라이빗 키에서 생성
 *   node scripts/create-w5-wallet.mjs --privatekey "abc123def456..."
 *   
 *   ***REMOVED***공개키에서 생성
 *   node scripts/create-w5-wallet.mjs --publickey "abc123def456..."
 */

import { mnemonicToPrivateKey, mnemonicValidate } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';
import { Buffer } from 'buffer';

async function createW5Wallet() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('\n📱 W5 (V5R1) 지갑 생성 유틸리티\n');
      console.log('사용법:');
      console.log('  니모닉에서: node scripts/create-w5-wallet.mjs --mnemonic "word1 word2 ..."');
      console.log('  프라이빗키: node scripts/create-w5-wallet.mjs --privatekey "hex값"');
      console.log('  공개키:     node scripts/create-w5-wallet.mjs --publickey "hex값"\n');
      return;
    }

    const mnemonicIdx = args.indexOf('--mnemonic');
    const privkeyIdx = args.indexOf('--privatekey');
    const pubkeyIdx = args.indexOf('--publickey');

    let publicKey;

    // 1. 니모닉에서 생성
    if (mnemonicIdx !== -1) {
      const mnemonic = args[mnemonicIdx + 1];
      
      if (!mnemonic) {
        throw new Error('--mnemonic 뒤에 니모닉을 입력하세요');
      }

      const words = mnemonic.trim().split(/\s+/);
      
      if (words.length !== 24) {
        throw new Error(`니모닉은 24단어여야 합니다 (현재: ${words.length})`);
      }

      const isValid = await mnemonicValidate(words);
      if (!isValid) {
        throw new Error('유효하지 않은 니모닉입니다');
      }

      console.log('\n🔐 니모닉에서 W5 지갑 생성 중...\n');
      const keyPair = await mnemonicToPrivateKey(words);
      publicKey = keyPair.publicKey;

      console.log('✅ 니모닉 검증 완료');
      console.log(`   단어 수: ${words.length}\n`);
      console.log('🔑 파생된 키 정보:');
      console.log(`   프라이빗 키: ${keyPair.secretKey.toString('hex')}`);
      console.log(`   공개 키:    ${publicKey.toString('hex')}\n`);
    }
    
    // 2. 프라이빗 키에서 생성
    else if (privkeyIdx !== -1) {
      const privkeyHex = args[privkeyIdx + 1];
      
      if (!privkeyHex) {
        throw new Error('--privatekey 뒤에 16진수 값을 입력하세요');
      }

      if (privkeyHex.length !== 128) {
        throw new Error(`프라이빗 키는 128자(64바이트)여야 합니다 (현재: ${privkeyHex.length})`);
      }

      console.log('\n🔐 프라이빗 키에서 W5 지갑 생성 중...\n');
      
      const secretKey = Buffer.from(privkeyHex, 'hex');
      publicKey = secretKey.slice(32);

      console.log('✅ 프라이빗 키 검증 완료');
      console.log(`   길이: ${secretKey.length} bytes (64 bytes = 128 hex)\n`);
      console.log('🔑 키 정보:');
      console.log(`   프라이빗 키: ${privkeyHex}`);
      console.log(`   공개 키:    ${publicKey.toString('hex')}\n`);
    }
    
    // 3. 공개 키에서 생성
    else if (pubkeyIdx !== -1) {
      const pubkeyHex = args[pubkeyIdx + 1];
      
      if (!pubkeyHex) {
        throw new Error('--publickey 뒤에 16진수 값을 입력하세요');
      }

      if (pubkeyHex.length !== 64) {
        throw new Error(`공개 키는 64자(32바이트)여야 합니다 (현재: ${pubkeyHex.length})`);
      }

      console.log('\n🔐 공개 키에서 W5 지갑 생성 중...\n');
      publicKey = Buffer.from(pubkeyHex, 'hex');

      console.log('✅ 공개 키 검증 완료');
      console.log(`   길이: ${publicKey.length} bytes (32 bytes = 64 hex)\n`);
      console.log('🔑 키 정보:');
      console.log(`   공개 키: ${pubkeyHex}\n`);
    }
    
    else {
      throw new Error('--mnemonic, --privatekey 또는 --publickey 중 하나를 선택하세요');
    }

    // W5R1 지갑 생성
    console.log('📱 W5R1 지갑 주소 생성 중...\n');
    
    const wallet = WalletContractV5R1.create({
      publicKey,
      workchain: 0,
    });

    const address = wallet.address;
    
    console.log('✅ 지갑 생성 완료!\n');
    console.log('📍 지갑 주소:');
    console.log(`   테스트넷:   ${address.toString({ testOnly: true })}`);
    console.log(`   메인넷:     ${address.toString()}`);
    console.log(`   User-friendly: ${address.toString({ urlSafe: true, bounceable: true })}\n`);

    console.log('📊 최종 정보:');
    console.log(`   버전:      WalletContractV5R1`);
    console.log(`   Workchain: 0`);
    console.log(`   공개 키:   ${publicKey.toString('hex').substring(0, 32)}...`);
    console.log(`   상태: 준비 완료\n`);

  } catch (error) {
    console.error('\n❌ 오류:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

createW5Wallet();
