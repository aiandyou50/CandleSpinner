import '../_bufferPolyfill';
import { keyPairFromSecretKey } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';

/**
 * GET /api/debug-withdrawal
 * 
 * 인출 API의 디버그 정보를 조회합니다.
 * 개인키, 지갑 주소, seqno 등을 확인할 수 있습니다.
 * 
 * 브라우저에서 https://aiandyou.me/api/debug-withdrawal 접속하면 확인 가능
 * 
 * ⚠️ 보안 주의: 개인키는 마스킹해서 반환합니다.
 * 
 * 응답 예시:
 * {
 *   "addressMatch": {
 *     "match": true/false,            // ← 이것이 false면 개인키 불일치!
 *     "envAddress": "UQB...",
 *     "calculatedAddress": "UQB..."
 *   },
 *   "lastError": { ... },             // ← 최근 인출 오류
 *   ...
 * }
 */

interface Env {
  CREDIT_KV: any;
  GAME_WALLET_PRIVATE_KEY: string;
  GAME_WALLET_ADDRESS: string;
  CSPIN_TOKEN_ADDRESS: string;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context;

  try {
    const privateKeyMasked = maskPrivateKey(env.GAME_WALLET_PRIVATE_KEY || '');
    // TON ED25519 개인키: 32바이트 = 64자 hex (NOT 128자!)
    const hasPrivateKey = !!env.GAME_WALLET_PRIVATE_KEY && env.GAME_WALLET_PRIVATE_KEY.length === 64;

    // 1. 환경변수 기본 확인
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        hasPrivateKey,
        privateKeyMasked,
        privateKeyLength: env.GAME_WALLET_PRIVATE_KEY?.length || 0,
        gameWalletAddress: env.GAME_WALLET_ADDRESS || '❌ NOT SET',
        cspinTokenAddress: env.CSPIN_TOKEN_ADDRESS || '❌ NOT SET'
      },
      status: {
        privateKeyValid: hasPrivateKey,
        gameWalletValid: !!env.GAME_WALLET_ADDRESS,
        cspinTokenValid: !!env.CSPIN_TOKEN_ADDRESS
      }
    };

    // 2. 개인키가 있다면 게임 지갱 주소 계산
    if (hasPrivateKey && env.GAME_WALLET_ADDRESS) {
      try {
        const keyPair = keyPairFromSecretKey(Buffer.from(env.GAME_WALLET_PRIVATE_KEY, 'hex'));
        const gameWallet = WalletContractV5R1.create({
          publicKey: keyPair.publicKey,
          workchain: 0
        });

        const calculatedAddress = gameWallet.address.toString();
        const addressMatch = calculatedAddress === env.GAME_WALLET_ADDRESS;

        diagnostics.gameWallet = {
          publicKeyMasked: `${keyPair.publicKey.toString('hex').substring(0, 16)}...${keyPair.publicKey.toString('hex').substring(120)}`,
          address: calculatedAddress,
          workchain: 0
        };

        diagnostics.addressMatch = {
          match: addressMatch,
          envAddress: env.GAME_WALLET_ADDRESS,
          calculatedAddress: calculatedAddress,
          note: addressMatch 
            ? '✅ 개인키와 주소가 일치합니다' 
            : '❌ 경고: 개인키와 주소가 불일치! 개인키를 다시 확인하세요'
        };

        // 3. KV에서 최근 정보 조회
        try {
          // seqno 확인
          const seqnoData = await env.CREDIT_KV.get('game_wallet_seqno');
          diagnostics.seqno = {
            current: seqnoData ? parseInt(seqnoData) : 0,
            note: seqnoData ? '✅ 설정됨' : '⚠️ 미설정 (첫 인출 시 0으로 시작)'
          };

          // 최근 오류 로그 확인
          const errorData = await env.CREDIT_KV.get('withdrawal_last_error');
          if (errorData) {
            diagnostics.lastError = JSON.parse(errorData);
          }
        } catch (kvError) {
          diagnostics.kvStatus = {
            error: kvError instanceof Error ? kvError.message : JSON.stringify(kvError)
          };
        }

        console.log('[debug-withdrawal] 진단 완료:', {
          addressMatch,
          hasPrivateKey,
          timestamp: diagnostics.timestamp
        });

      } catch (keyError) {
        diagnostics.keyError = {
          error: keyError instanceof Error ? keyError.message : JSON.stringify(keyError),
          note: '개인키를 파싱하는 중 오류 발생. 개인키 형식을 확인하세요 (128자 16진수).'
        };
      }
    }

    return new Response(
      JSON.stringify(diagnostics, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  } catch (error) {
    const errorResponse = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : JSON.stringify(error),
      type: error?.constructor?.name || 'Unknown'
    };

    console.error('[debug-withdrawal] 오류:', errorResponse);

    return new Response(
      JSON.stringify(errorResponse, null, 2),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * 개인키 마스킹 함수
 * 예: 4e6568d1990bff34...ef7978fc
 */
function maskPrivateKey(key: string): string {
  if (!key || key.length < 16) return '***';
  return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
}
