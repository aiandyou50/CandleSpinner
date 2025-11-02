/**
 * TON Jetton 전송 구조 분석
 * 
 * 질문: CSPIN 토큰이 게임유저 → 게임운영지갑으로 전송되는가?
 */

import { Address } from '@ton/ton';

console.log('=== TON Jetton 전송 구조 분석 ===\n');

// 주소들
const GAME_WALLET = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';
const CSPIN_MASTER = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';
const USER_JETTON_WALLET = 'EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs';

console.log('📍 주소 정보:');
console.log(`  게임 운영 지갑: ${GAME_WALLET}`);
console.log(`  CSPIN Token Master: ${CSPIN_MASTER}`);
console.log(`  게임 운영 지갑의 Jetton Wallet: ${USER_JETTON_WALLET}\n`);

console.log('📊 Jetton Transfer 흐름 (TEP-74 표준):');
console.log('  1️⃣  사용자가 트랜잭션 서명');
console.log('     - 대상: 사용자의 CSPIN Jetton Wallet');
console.log('     - 메시지: JettonTransfer (opcode: 0xf8a7ea5)');
console.log('     - Payload에 포함된 destination: 게임 운영 지갑\n');

console.log('  2️⃣  사용자의 Jetton Wallet 컨트랙트 실행');
console.log('     - 사용자의 CSPIN 잔액 차감');
console.log('     - Internal message 생성\n');

console.log('  3️⃣  Internal message 전송');
console.log('     - From: 사용자의 Jetton Wallet');
console.log('     - To: 게임 운영 지갑의 Jetton Wallet');
console.log('     - 금액: forward_ton_amount (가스비)');
console.log('     - Opcode: InternalTransfer\n');

console.log('  4️⃣  게임 운영 지갑의 Jetton Wallet 실행');
console.log('     - 게임 운영 지갑의 CSPIN 잔액 증가');
console.log('     - Notification 전송 (선택적)\n');

console.log('❓ 현재 구현 분석:\n');

// Deposit.tsx에서 사용하는 파라미터
console.log('buildJettonTransferPayload 파라미터:');
console.log('  - amount: 입금할 CSPIN 수량 (예: 10 CSPIN)');
console.log('  - destination: gameWalletAddress (게임 운영 지갑)');
console.log('  - responseTo: userWalletAddress (사용자 지갑)\n');

console.log('✅ 결론:');
console.log('  destination = 게임 운영 지갑 = UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd');
console.log('  → 이것은 CSPIN Jetton Wallet이 아니라 **일반 TON 지갑 주소**입니다!\n');

console.log('🔴 **문제 발견:**');
console.log('  Jetton Transfer의 destination은 **받는 사람의 TON 지갑 주소**여야 합니다.');
console.log('  Jetton Wallet 컨트랙트가 자동으로 해당 주소의 Jetton Wallet을 찾습니다.\n');

console.log('  현재 코드:');
console.log('    destination: gameWalletAddress ✅ (올바름)');
console.log('    게임 운영 지갑: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd ✅\n');

console.log('  트랜잭션 전송 대상:');
console.log('    address: CSPIN_JETTON_WALLET ✅ (올바름)');
console.log('    게임 운영 지갑의 Jetton Wallet: EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs ✅\n');

console.log('⚠️  그렇다면 왜 실패하는가?');
console.log('  가능한 원인:');
console.log('    1. forward_ton_amount가 여전히 부족 (0.005 TON이 충분한지 확인 필요)');
console.log('    2. transaction.amount가 부족 (0.03 TON이 충분한지 확인 필요)');
console.log('    3. 사용자의 Jetton Wallet 주소를 잘못 계산했을 가능성');
console.log('    4. validUntil이 만료되었을 가능성 (5분)\n');

console.log('🔍 다음 확인 사항:');
console.log('  1. 블록체인 탐색기에서 사용자의 CSPIN Jetton Wallet 주소 확인');
console.log('  2. 해당 Jetton Wallet의 CSPIN 잔액 확인');
console.log('  3. 실패한 트랜잭션의 정확한 에러 메시지 확인');
console.log('  4. 트랜잭션 시 실제로 어느 주소로 전송되었는지 확인\n');
