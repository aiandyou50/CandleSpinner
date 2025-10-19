import '../_bufferPolyfill';

export async function onRequestPost(context: any) {
  const { request } = context;
  const { password } = await request.json();

  // Cloudflare Pages 환경 변수에서 비밀번호 확인
  const correctPassword = context.env.CSPIN_DEVELOPER_PASSWORD;

  if (!correctPassword) {
    return new Response(JSON.stringify({
      valid: false,
      error: 'Developer password not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const isValid = password === correctPassword;

  return new Response(JSON.stringify({
    valid: isValid
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}