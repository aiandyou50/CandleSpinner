/**
 * TON Jetton Transfer 최소 비용 테스트
 * 
 * 목적: forward_ton_amount와 전체 트랜잭션 비용의 최소값 확인
 */

import { Address, toNano } from '@ton/ton';

console.log('=== TON Jetton Transfer 비용 분석 ===\n');

// 1. forward_ton_amount 옵션들
console.log('📋 forward_ton_amount 옵션:');
const forwardOptions = [
  { label: '최소 (1 nanoton)', value: BigInt(1), ton: 0.000000001 },
  { label: '0.001 TON', value: toNano('0.001'), ton: 0.001 },
  { label: '0.005 TON', value: toNano('0.005'), ton: 0.005 },
  { label: '0.01 TON', value: toNano('0.01'), ton: 0.01 },
  { label: '0.05 TON (권장)', value: toNano('0.05'), ton: 0.05 },
];

forwardOptions.forEach(opt => {
  console.log(`  - ${opt.label}: ${opt.value} nanoton (${opt.ton} TON)`);
});

console.log('\n📋 전체 트랜잭션 비용 (message.amount):');
console.log('  - Jetton Wallet 컨트랙트 실행 비용: ~0.01-0.05 TON');
console.log('  - forward_ton_amount를 포함해야 함');
console.log('  - 공식: transaction.amount >= contract_gas + forward_ton_amount\n');

// 2. 비용 구조
console.log('💰 TON 네트워크 비용 구조:');
console.log('  1. Storage fee: 컨트랙트 저장 비용 (매우 적음, ~0.0001 TON)');
console.log('  2. Compute fee: 컨트랙트 실행 비용 (~0.01 TON)');
console.log('  3. Forward fee: 메시지 전달 비용 (forward_ton_amount)\n');

// 3. 추천 설정
console.log('✅ 권장 설정:');
console.log('  Option A (최소):');
console.log('    - forward_ton_amount: 0.001 TON (1,000,000 nanoton)');
console.log('    - transaction.amount: 0.02 TON');
console.log('    - 총 비용: ~0.02 TON ($0.10 @ $5/TON)\n');

console.log('  Option B (안전):');
console.log('    - forward_ton_amount: 0.005 TON (5,000,000 nanoton)');
console.log('    - transaction.amount: 0.03 TON');
console.log('    - 총 비용: ~0.03 TON ($0.15 @ $5/TON)\n');

console.log('  Option C (현재 설정):');
console.log('    - forward_ton_amount: 0.005 TON');
console.log('    - transaction.amount: 0.055 TON');
console.log('    - 총 비용: ~0.055 TON ($0.275 @ $5/TON)\n');

// 4. 실제 테스트 계획
console.log('🧪 테스트 계획:');
console.log('  1. forward_ton_amount = 0.001 TON, transaction = 0.02 TON');
console.log('  2. 실패하면 → forward_ton_amount = 0.005 TON, transaction = 0.03 TON');
console.log('  3. 여전히 실패하면 → forward_ton_amount = 0.01 TON, transaction = 0.05 TON\n');

console.log('⚠️  주의: TON 가격이 $5일 때 0.055 TON = $0.275 (약 380원)');
console.log('💡 최적화: 0.02 TON으로 낮추면 = $0.10 (약 140원)\n');
