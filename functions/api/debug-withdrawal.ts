import '../_bufferPolyfill';
import { WalletContractV5R1, Address } from '@ton/ton';
import { isMnemonicValid, validateAndConvertMnemonic } from './mnemonic-utils';

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
    // ✅ 주소 정규화 함수 (EQ... ↔ UQ... 변환)
    const normalizeAddress = (addr: string): string => {
      try {
        return Address.parse(addr).toString({ bounceable: false });
      } catch {
        return addr; // 파싱 실패 시 원본 반환
      }
    };
    
    // ⚠️ 변경: GAME_WALLET_PRIVATE_KEY는 이제 니모닉(24 단어)입니다
    const hasMnemonic = !!env.GAME_WALLET_PRIVATE_KEY;
    const mnemonicWordCount = hasMnemonic 
      ? env.GAME_WALLET_PRIVATE_KEY.trim().split(/\s+/).length 
      : 0;
    const mnemonicMasked = hasMnemonic 
      ? `${env.GAME_WALLET_PRIVATE_KEY.trim().split(/\s+/).slice(0, 3).join(' ')}... (${mnemonicWordCount} words)` 
      : '❌ NOT SET';

    // 1. 환경변수 기본 확인
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        hasMnemonic,
        mnemonicMasked,
        mnemonicWordCount,
        gameWalletAddress: env.GAME_WALLET_ADDRESS || '❌ NOT SET',
        cspinTokenAddress: env.CSPIN_TOKEN_ADDRESS || '❌ NOT SET'
      },
      status: {
        mnemonicValid: hasMnemonic && mnemonicWordCount === 24,
        gameWalletValid: !!env.GAME_WALLET_ADDRESS,
        cspinTokenValid: !!env.CSPIN_TOKEN_ADDRESS
      }
    };

    // 2. 니모닉이 있다면 게임 지갑 주소 계산
    if (hasMnemonic && env.GAME_WALLET_ADDRESS) {
      try {
        // 니모닉 유효성 검증
        const isValid = await isMnemonicValid(env.GAME_WALLET_PRIVATE_KEY);
        
        if (!isValid) {
          const mnemonic = env.GAME_WALLET_PRIVATE_KEY.trim().split(/\s+/);
          diagnostics.mnemonicError = {
            error: '유효하지 않은 니모닉: BIP39 검증 실패',
            wordCount: mnemonic.length,
            note: '니모닉이 올바른 BIP39 단어 목록이 아닙니다.'
          };
        } else {
          // 니모닉을 키 쌍으로 변환
          const keyPair = await validateAndConvertMnemonic(env.GAME_WALLET_PRIVATE_KEY);
          const gameWallet = WalletContractV5R1.create({
            publicKey: keyPair.publicKey,
            workchain: 0
          });

          const calculatedAddress = gameWallet.address.toString();
          
          // ✅ 주소 정규화 비교 (EQ... vs UQ... 형식 차이 무시)
          const normalizedCalculated = normalizeAddress(calculatedAddress);
          const normalizedEnv = normalizeAddress(env.GAME_WALLET_ADDRESS);
          const addressMatch = normalizedCalculated === normalizedEnv;

          diagnostics.gameWallet = {
            publicKeyMasked: `${keyPair.publicKey.toString('hex').substring(0, 16)}...`,
            address: calculatedAddress,
            workchain: 0
          };

          diagnostics.addressMatch = {
            match: addressMatch,
            envAddress: env.GAME_WALLET_ADDRESS,
            calculatedAddress: calculatedAddress,
            note: addressMatch 
              ? '✅ 니모닉과 주소가 일치합니다 (형식 무관)' 
              : '❌ 경고: 니모닉과 주소가 불일치! 니모닉을 다시 확인하세요'
          };
        }

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
          addressMatch: diagnostics.addressMatch?.match,
          hasMnemonic,
          timestamp: diagnostics.timestamp
        });

      } catch (keyError) {
        diagnostics.keyError = {
          error: keyError instanceof Error ? keyError.message : JSON.stringify(keyError),
          note: '니모닉을 파싱하는 중 오류 발생. 니모닉 형식을 확인하세요 (24단어, 공백으로 구분).'
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
