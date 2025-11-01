/**
 * 🎯 Signed Voucher 백엔드 API (Cloudflare Workers + Hono)
 * 
 * RPC 호출 없이 서명만 생성 (오프체인)
 * 운영 비용: $0/월
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { mnemonicToPrivateKey, sign } from '@ton/crypto';
import { Address, beginCell } from '@ton/ton';

// Cloudflare Workers 타입
type Bindings = {
    OWNER_MNEMONIC: string;
    CONTRACT_ADDRESS: string;
    MAX_SINGLE_WITHDRAW: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS 설정
app.use('/*', cors());

// ============================================
// Owner 키 캐시 (Cloudflare Workers KV 대신 메모리 사용)
// ============================================
let ownerKeyPairCache: {
    publicKey: Buffer;
    secretKey: Buffer;
} | null = null;

async function getOwnerKeyPair(env: Bindings) {
    if (ownerKeyPairCache) {
        return ownerKeyPairCache;
    }

    const mnemonic = env.OWNER_MNEMONIC;
    if (!mnemonic || mnemonic.split(' ').length !== 24) {
        throw new Error('Invalid OWNER_MNEMONIC: must be 24 words');
    }

    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
    ownerKeyPairCache = keyPair;
    return keyPair;
}

// ============================================
// 바우처 발급 API
// ============================================
app.post('/api/request-voucher', async (c) => {
    try {
        const { userId, amount, recipientAddress } = await c.req.json();

        // 입력 검증
        if (!userId || !amount || !recipientAddress) {
            return c.json({
                success: false,
                error: 'Missing required fields: userId, amount, recipientAddress'
            }, 400);
        }

        const maxWithdraw = parseInt(c.env.MAX_SINGLE_WITHDRAW || '1000000');
        if (amount <= 0 || amount > maxWithdraw) {
            return c.json({
                success: false,
                error: `Invalid amount. Must be between 1 and ${maxWithdraw}`
            }, 400);
        }

        // 주소 검증
        let recipient: Address;
        try {
            recipient = Address.parse(recipientAddress);
        } catch (error) {
            return c.json({
                success: false,
                error: 'Invalid recipient address'
            }, 400);
        }

        // TODO: 실제 환경에서는 다음을 확인해야 합니다:
        // 1. userId가 유효한 사용자인지
        // 2. 해당 사용자의 게임 내 크레딧이 충분한지
        // 3. 일일 인출 한도 체크
        // 4. 중복 요청 방지 (Cloudflare KV 사용)

        // Nonce 생성 (timestamp + random)
        const nonce = Date.now() * 1000 + Math.floor(Math.random() * 1000);

        // Owner 키 로드
        const ownerKeyPair = await getOwnerKeyPair(c.env);

        // 서명 생성 (오프체인, RPC 호출 없음!)
        const messageToSign = beginCell()
            .storeUint(0x7a0c23c0, 32) // ClaimWithVoucher opcode
            .storeCoins(amount * 1_000_000_000) // CSPIN to nanoCSPIN
            .storeAddress(recipient)
            .storeUint(nonce, 64)
            .endCell();

        const messageHash = messageToSign.hash();
        const signature = sign(messageHash, ownerKeyPair.secretKey);

        console.log(`✅ Voucher issued: User=${userId}, Amount=${amount} CSPIN, Nonce=${nonce}`);

        // 바우처 반환
        return c.json({
            success: true,
            voucher: {
                amount: amount * 1_000_000_000, // nanoCSPIN
                recipient: recipient.toString(),
                nonce: nonce,
                signature: signature.toString('hex'),
                contractAddress: c.env.CONTRACT_ADDRESS,
                expiresAt: Date.now() + 300000 // 5분 유효
            }
        });

    } catch (error) {
        console.error('❌ Voucher issuance failed:', error);
        return c.json({
            success: false,
            error: 'Failed to issue voucher'
        }, 500);
    }
});

// ============================================
// 헬스 체크
// ============================================
app.get('/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        contractAddress: c.env.CONTRACT_ADDRESS
    });
});

// ============================================
// 루트 경로
// ============================================
app.get('/', (c) => {
    return c.json({
        message: 'Signed Voucher API (Cloudflare Workers + Hono)',
        endpoints: {
            '/api/request-voucher': 'POST - Request a signed voucher',
            '/health': 'GET - Health check'
        }
    });
});

export default app;
