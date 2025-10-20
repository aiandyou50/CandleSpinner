import { Address } from '@ton/core';

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const { tokenAddress, userAddress } = await request.json();

    if (!tokenAddress || !userAddress) {
      return new Response(JSON.stringify({ error: 'Missing tokenAddress or userAddress' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TON RPC를 통해 제톤 지갑 주소 파생 (올바른 파라미터)
    const rpcUrl = 'https://toncenter.com/api/v2/jsonRPC';
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'runGetMethod',
        params: {
          address: tokenAddress,
          method: 'get_wallet_address',
          stack: [
            { "type": "slice", "value": userAddress } // 올바른 형식
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    // 결과 파싱
    const stack = data.result?.stack;
    if (!stack || stack.length === 0) {
      throw new Error('Invalid RPC response: no stack');
    }

    const jettonWalletAddress = stack[0][1]; // slice 타입의 값

    if (!jettonWalletAddress) {
      throw new Error('Failed to derive jetton wallet address');
    }

    return new Response(JSON.stringify({ jettonWalletAddress }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('get-jetton-wallet error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}