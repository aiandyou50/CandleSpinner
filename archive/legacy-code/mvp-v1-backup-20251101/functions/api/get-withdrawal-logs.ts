import '../_bufferPolyfill';

/**
 * GET /api/get-withdrawal-logs
 * 
 * 마지막 인출 시도의 오류 로그를 조회합니다 (개발/디버깅용)
 */

export async function onRequestGet(context: any) {
  try {
    const { request, env } = context;

    // KV에서 마지막 오류 로그 조회
    const errorLog = await env.CREDIT_KV.get('withdrawal_last_error');
    
    if (!errorLog) {
      return new Response(
        JSON.stringify({
          message: '최근 오류 로그 없음',
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(JSON.parse(errorLog)),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[get-withdrawal-logs] 오류:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
