/**
 * 🎯 Signed Voucher 백엔드 API
 * 
 * RPC 호출 없이 서명만 생성 (오프체인)
 * 운영 비용: $0/월
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { mnemonicToPrivateKey, sign } = require('@ton/crypto');
const { Address, beginCell } = require('@ton/ton');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// 설정 (환경변수로 관리 권장)
// ============================================
// Cloudflare Pages 환경변수 또는 .env 파일
const OWNER_MNEMONIC = process.env.GAME_WALLET_PRIVATE_KEY || process.env.OWNER_MNEMONIC;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc';
const MAX_SINGLE_WITHDRAW = parseInt(process.env.MAX_SINGLE_WITHDRAW || '1000000');

// 니모닉 검증 (더미 예시 체크 개선)
const isDummyMnemonic = OWNER_MNEMONIC && OWNER_MNEMONIC.includes('word1 word2 word3');
if (!OWNER_MNEMONIC || isDummyMnemonic || OWNER_MNEMONIC.split(' ').length !== 24) {
    console.error('\n❌ OWNER_MNEMONIC / GAME_WALLET_PRIVATE_KEY environment variable is not set correctly!');
    console.error('❌ OWNER_MNEMONIC / GAME_WALLET_PRIVATE_KEY 환경 변수가 올바르게 설정되지 않았습니다!');
    console.error('💡 Create backend-api/.env file or set Cloudflare Pages environment variable.');
    console.error('💡 backend-api/.env 파일을 생성하거나 Cloudflare Pages 환경 변수를 설정하세요.\n');
    console.error('Example / 예시:');
    console.error('OWNER_MNEMONIC="word1 word2 word3 ... word24"');
    console.error('또는 Cloudflare Pages:');
    console.error('GAME_WALLET_PRIVATE_KEY="word1 word2 word3 ... word24"\n');
    process.exit(1);
}

let ownerKeyPair = null;

// 서버 시작 시 Owner 키 로드
async function initOwnerKey() {
    try {
        ownerKeyPair = await mnemonicToPrivateKey(OWNER_MNEMONIC.split(' '));
        console.log('✅ Owner key loaded successfully / Owner 키 로드 완료');
        console.log('📍 Public Key(퍼블릭 키):', ownerKeyPair.publicKey.toString('hex').substring(0, 32) + '...');
    } catch (error) {
        console.error('❌ Owner key loading failed / Owner 키 로드 실패:', error.message);
        process.exit(1);
    }
}

// ============================================
// 바우처 발급 API
// ============================================
app.post('/api/request-voucher', async (req, res) => {
    try {
        const { userId, amount, recipientAddress } = req.body;

        // 입력 검증
        if (!userId || !amount || !recipientAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, amount, recipientAddress'
            });
        }

        if (amount <= 0 || amount > MAX_SINGLE_WITHDRAW) {
            return res.status(400).json({
                success: false,
                error: `Invalid amount. Must be between 1 and ${MAX_SINGLE_WITHDRAW}`
            });
        }

        // 주소 검증
        let recipient;
        try {
            recipient = Address.parse(recipientAddress);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid recipient address'
            });
        }

        // TODO: 실제 환경에서는 다음을 확인해야 합니다:
        // 1. userId가 유효한 사용자인지
        // 2. 해당 사용자의 게임 내 크레딧이 충분한지
        // 3. 일일 인출 한도 체크
        // 4. 중복 요청 방지

        // Nonce 생성 (timestamp + random)
        const nonce = Date.now() * 1000 + Math.floor(Math.random() * 1000);

        // 서명 생성 (오프체인, RPC 호출 없음!)
        const messageToSign = beginCell()
            .storeUint(0x7a0c23c0, 32) // ClaimWithVoucher opcode
            .storeCoins(amount * 1_000_000_000) // CSPIN to nanoCSPIN
            .storeAddress(recipient)
            .storeUint(nonce, 64)
            .endCell();

        const messageHash = messageToSign.hash();
        const signature = sign(messageHash, ownerKeyPair.secretKey);

        console.log(`✅ Voucher issued / 바우처 발급:`);
        console.log(`   └─ User Wallet / 사용자 지갑: ${userId}`);
        console.log(`   └─ Amount / 금액: ${amount} CSPIN`);
        console.log(`   └─ Nonce: ${nonce}`);

        // 바우처 반환
        res.json({
            success: true,
            voucher: {
                amount: amount * 1_000_000_000, // nanoCSPIN
                recipient: recipient.toString(),
                nonce: nonce,
                signature: signature.toString('hex'),
                contractAddress: CONTRACT_ADDRESS,
                expiresAt: Date.now() + 300000 // 5분 유효
            }
        });

    } catch (error) {
        console.error('❌ Voucher issuance failed / 바우처 발급 실패:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to issue voucher'
        });
    }
});

// ============================================
// 헬스 체크
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        contractAddress: CONTRACT_ADDRESS
    });
});

// ============================================
// 서버 시작
// ============================================
const PORT = process.env.PORT || 3000;

initOwnerKey().then(() => {
    const server = app.listen(PORT, () => {
        console.log('\n🚀 Signed Voucher API Server Started / Signed Voucher API 서버 시작');
        console.log(`📍 Port / 포트: ${PORT}`);
        console.log(`📍 Contract / 컨트랙트: ${CONTRACT_ADDRESS}`);
        console.log(`💡 Operating Cost / 운영 비용: $0/month(월) (No RPC calls / RPC 호출 없음)\n`);
    });

    server.on('error', (error) => {
        console.error('❌ Server Error / 서버 에러:', error);
        process.exit(1);
    });
}).catch((error) => {
    console.error('❌ Initialization Failed / 초기화 실패:', error);
    process.exit(1);
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
