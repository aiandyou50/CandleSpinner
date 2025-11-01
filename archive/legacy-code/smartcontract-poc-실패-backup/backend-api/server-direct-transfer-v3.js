/**
 * 🎯 백엔드 직접 전송 방식 (TonCenter API v3)
 * 
 * 컨트랙트 없이 백엔드에서 Jetton을 직접 전송
 * API v3: 더 빠르고 안정적
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { mnemonicToPrivateKey, sign } = require('@ton/crypto');
const { WalletContractV4, Address, toNano, internal, beginCell, Cell } = require('@ton/ton');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// 설정
// ============================================
const OWNER_MNEMONIC = process.env.GAME_WALLET_PRIVATE_KEY || process.env.OWNER_MNEMONIC;
const JETTON_MASTER = process.env.JETTON_MASTER || 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA';
const MAX_SINGLE_WITHDRAW = parseInt(process.env.MAX_SINGLE_WITHDRAW || '1000000');
const NETWORK = process.env.NETWORK || 'mainnet';
const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY || '';

// TonCenter API v3 엔드포인트
const API_BASE = NETWORK === 'mainnet' 
    ? 'https://toncenter.com/api/v3'
    : 'https://testnet.toncenter.com/api/v3';

const API_HEADERS = {
    'X-API-Key': TONCENTER_API_KEY,
    'Content-Type': 'application/json'
};

let ownerWallet = null;
let ownerKeyPair = null;
let ownerJettonWallet = null;

// ============================================
// TonCenter API v3 Helper Functions
// ============================================

/**
 * runGetMethod 실행 (v3)
 */
async function runGetMethod(address, method, stack = []) {
    try {
        const response = await axios.post(
            `${API_BASE}/runGetMethod`,
            {
                address: address,
                method: method,
                stack: stack
            },
            { headers: API_HEADERS }
        );

        if (!response.data.success) {
            throw new Error(response.data.error || 'Method execution failed');
        }

        return response.data;
    } catch (error) {
        console.error(`❌ runGetMethod failed: ${error.message}`);
        throw error;
    }
}

/**
 * BOC 전송 (v3)
 */
async function sendBoc(boc) {
    try {
        const response = await axios.post(
            `${API_BASE}/message`,
            { boc: boc },
            { headers: API_HEADERS }
        );

        if (!response.data.success) {
            throw new Error(response.data.error || 'Send BOC failed');
        }

        return response.data;
    } catch (error) {
        console.error(`❌ sendBoc failed: ${error.message}`);
        throw error;
    }
}

/**
 * 계정 정보 조회 (v3)
 */
async function getAccount(address) {
    try {
        const response = await axios.get(
            `${API_BASE}/account`,
            {
                params: { address: address },
                headers: API_HEADERS
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.error || 'Get account failed');
        }

        return response.data.account;
    } catch (error) {
        console.error(`❌ getAccount failed: ${error.message}`);
        throw error;
    }
}

/**
 * Jetton Wallet 주소 가져오기
 */
async function getJettonWalletAddress(jettonMaster, ownerAddress) {
    try {
        // get_wallet_address 메서드 호출
        const ownerCell = beginCell()
            .storeAddress(Address.parse(ownerAddress))
            .endCell();

        // API v3는 객체 형식의 stack 사용
        const result = await runGetMethod(
            jettonMaster,
            'get_wallet_address',
            [{
                type: 'slice',
                value: ownerCell.toBoc().toString('base64')
            }]
        );

        // stack에서 주소 추출
        if (result.stack && result.stack.length > 0) {
            const addressCell = Cell.fromBase64(result.stack[0].value);
            const slice = addressCell.beginParse();
            const address = slice.loadAddress();
            return address.toString();
        }

        throw new Error('Failed to parse wallet address');
    } catch (error) {
        console.error(`❌ getJettonWalletAddress failed: ${error.message}`);
        throw error;
    }
}

// ============================================
// 초기화: Owner 지갑 및 Jetton Wallet 주소 가져오기
// ============================================
async function initOwner() {
    try {
        // 1. Owner 지갑 생성
        ownerKeyPair = await mnemonicToPrivateKey(OWNER_MNEMONIC.split(' '));
        ownerWallet = WalletContractV4.create({
            workchain: 0,
            publicKey: ownerKeyPair.publicKey
        });

        console.log('✅ Owner wallet initialized / Owner 지갑 초기화 완료');
        console.log(`📍 Owner Address / Owner 주소: ${ownerWallet.address.toString()}`);

        // 2. Owner의 Jetton Wallet 주소 가져오기
        ownerJettonWallet = await getJettonWalletAddress(
            JETTON_MASTER,
            ownerWallet.address.toString()
        );
        
        console.log(`✅ Owner Jetton Wallet / Owner Jetton 지갑: ${ownerJettonWallet}`);

        // 3. Jetton 잔고 확인
        const jettonBalance = await getJettonBalance(ownerJettonWallet);
        console.log(`💰 Current Balance / 현재 잔고: ${jettonBalance} CSPIN\n`);

    } catch (error) {
        console.error('❌ Owner initialization failed / Owner 초기화 실패:', error.message);
        throw error;
    }
}

// ============================================
// Jetton 잔고 조회
// ============================================
async function getJettonBalance(jettonWalletAddress) {
    try {
        const result = await runGetMethod(jettonWalletAddress, 'get_wallet_data', []);

        if (result.stack && result.stack.length > 0) {
            const balance = BigInt(result.stack[0].value);
            return Number(balance) / 1_000_000_000; // nano to CSPIN
        }

        return 0;
    } catch (error) {
        console.error('❌ Failed to get balance / 잔고 조회 실패:', error.message);
        return 0;
    }
}

// ============================================
// Seqno 조회 (v3)
// ============================================
async function getSeqno(walletAddress) {
    try {
        const result = await runGetMethod(walletAddress, 'seqno', []);
        
        if (result.stack && result.stack.length > 0) {
            return parseInt(result.stack[0].value);
        }

        return 0;
    } catch (error) {
        console.error('❌ Failed to get seqno:', error.message);
        return 0;
    }
}

// ============================================
// Jetton 전송 (핵심 로직!)
// ============================================
async function sendJetton(recipientAddress, amount) {
    try {
        console.log(`\n🔄 Jetton transfer starting...`);
        console.log(`   └─ Recipient: ${recipientAddress}`);
        console.log(`   └─ Amount: ${amount} CSPIN`);

        // 1. Seqno 가져오기
        const seqno = await getSeqno(ownerWallet.address.toString());
        console.log(`   └─ Seqno: ${seqno}`);

        // 2. JettonTransfer 메시지 생성
        const jettonTransferBody = beginCell()
            .storeUint(0xf8a7ea5, 32)  // JettonTransfer opcode (TEP-74)
            .storeUint(0, 64)  // query_id
            .storeCoins(amount * 1_000_000_000)  // amount (nano)
            .storeAddress(Address.parse(recipientAddress))  // destination
            .storeAddress(ownerWallet.address)  // response_destination
            .storeBit(false)  // custom_payload = null
            .storeCoins(toNano('0.05'))  // forward_ton_amount
            .storeBit(false)  // forward_payload = empty
            .endCell();

        // 3. 내부 메시지 생성
        const internalMessage = internal({
            to: ownerJettonWallet,
            value: toNano('0.1'),
            bounce: true,
            body: jettonTransferBody
        });

        // 4. 지갑에서 서명된 트랜잭션 생성
        const transfer = ownerWallet.createTransfer({
            seqno,
            secretKey: ownerKeyPair.secretKey,
            messages: [internalMessage]
        });

        // 5. BOC로 변환
        const boc = transfer.toBoc().toString('base64');

        // 6. 전송 (API v3)
        const result = await sendBoc(boc);

        console.log(`✅ Jetton transfer sent / Jetton 전송 완료`);
        console.log(`   └─ Message hash: ${result.message_hash || 'N/A'}`);

        // 7. Seqno 증가 확인
        await waitForSeqno(ownerWallet.address.toString(), seqno + 1);

        return { success: true, seqno, messageHash: result.message_hash };

    } catch (error) {
        console.error('❌ Jetton transfer failed / Jetton 전송 실패:', error.message);
        throw error;
    }
}

// ============================================
// Seqno 대기 (트랜잭션 확인)
// ============================================
async function waitForSeqno(walletAddress, targetSeqno) {
    let currentSeqno = await getSeqno(walletAddress);
    let attempts = 0;
    const maxAttempts = 30; // 30초

    while (currentSeqno < targetSeqno && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentSeqno = await getSeqno(walletAddress);
        attempts++;
    }

    if (currentSeqno >= targetSeqno) {
        console.log(`✅ Transaction confirmed / 트랜잭션 확인됨 (Seqno: ${currentSeqno})`);
        return true;
    } else {
        console.log(`⚠️ Transaction pending / 트랜잭션 대기 중...`);
        return false;
    }
}

// ============================================
// API: 인출 요청 (직접 전송)
// ============================================
app.post('/api/withdraw', async (req, res) => {
    try {
        const { userId, amount, recipientAddress } = req.body;

        // 입력 검증
        if (!userId || !amount || !recipientAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        if (amount <= 0 || amount > MAX_SINGLE_WITHDRAW) {
            return res.status(400).json({
                success: false,
                error: `Invalid amount. Must be between 1 and ${MAX_SINGLE_WITHDRAW}`
            });
        }

        // 주소 검증
        try {
            Address.parse(recipientAddress);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid recipient address'
            });
        }

        console.log(`\n🔄 Withdrawal request / 인출 요청:`);
        console.log(`   └─ User / 사용자: ${userId}`);
        console.log(`   └─ Amount / 금액: ${amount} CSPIN`);
        console.log(`   └─ Recipient / 수신자: ${recipientAddress}`);

        // Jetton 전송 (Owner → User)
        const result = await sendJetton(recipientAddress, amount);

        res.json({
            success: true,
            message: 'Withdrawal successful',
            seqno: result.seqno,
            messageHash: result.messageHash,
            ownerAddress: ownerWallet.address.toString(),
            ownerJettonWallet: ownerJettonWallet
        });

    } catch (error) {
        console.error('❌ Withdrawal failed / 인출 실패:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process withdrawal'
        });
    }
});

// ============================================
// API: 잔고 조회
// ============================================
app.get('/api/balance', async (req, res) => {
    try {
        const balance = await getJettonBalance(ownerJettonWallet);
        res.json({
            success: true,
            balance: balance,
            jettonWallet: ownerJettonWallet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get balance'
        });
    }
});

// ============================================
// 헬스 체크
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        network: NETWORK,
        apiVersion: 'v3',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// 서버 시작
// ============================================
const PORT = process.env.PORT || 3000;

initOwner().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Direct Transfer API Server Started / 직접 전송 API 서버 시작`);
        console.log(`📍 Port / 포트: ${PORT}`);
        console.log(`📍 Network / 네트워크: ${NETWORK}`);
        console.log(`📍 API Version / API 버전: v3`);
        console.log(`💡 Operating Cost / 운영 비용: ~$0.01/tx (가스비만)\n`);
    });
}).catch((error) => {
    console.error('❌ Server initialization failed / 서버 초기화 실패:', error);
    process.exit(1);
});
