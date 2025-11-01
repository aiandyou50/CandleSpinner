/**
 * TonCenter API 클라이언트 및 Jetton Transfer 전송
 */

import { Address, beginCell, toNano, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

interface Transaction {
  to: string;
  isJettonTransfer: boolean;
  jettonAmount: bigint;
}

/**
 * TonCenter v2 클라이언트
 */
export class TonCenterClient {
  private apiKey?: string;
  private baseUrl = 'https://toncenter.com/api/v2';

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * 트랜잭션 조회
   */
  async getTransaction(txHash: string): Promise<Transaction | null> {
    const url = `${this.baseUrl}/getTransactions?address=${txHash}&limit=1`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(url, { headers });
    const data = await response.json() as any;

    if (!data.ok || !data.result || data.result.length === 0) {
      return null;
    }

    const tx = data.result[0];
    
    // 간단한 파싱 (실제로는 BOC 디코딩 필요)
    return {
      to: tx.out_msgs?.[0]?.destination || '',
      isJettonTransfer: tx.out_msgs?.[0]?.message?.includes('0f8a7ea5') || false,
      jettonAmount: BigInt(tx.out_msgs?.[0]?.value || 0),
    };
  }
}

/**
 * Jetton Transfer 전송 (서버 서명)
 */
export async function sendJettonTransfer(
  mnemonic: string,
  recipientAddress: string,
  amount: number,
  jettonMasterAddress: string,
  apiKey?: string
): Promise<string> {
  // 1. 니모닉에서 키 생성
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));

  // 2. Jetton Wallet 주소 계산 (간단한 예시, 실제로는 derive 필요)
  const jettonWalletAddress = Address.parse(jettonMasterAddress);

  // 3. Jetton Transfer 메시지 생성
  const transferBody = beginCell()
    .storeUint(0x0f8a7ea5, 32) // op code
    .storeUint(0, 64) // query_id
    .storeCoins(BigInt(amount * 1_000_000_000)) // amount (nanoCSPIN)
    .storeAddress(Address.parse(recipientAddress)) // destination
    .storeAddress(Address.parse(recipientAddress)) // response_destination
    .storeBit(0) // custom_payload
    .storeCoins(toNano('0.05')) // forward_ton_amount
    .storeBit(0) // forward_payload
    .endCell();

  const message = internal({
    to: jettonWalletAddress,
    value: toNano('0.1'),
    body: transferBody,
  });

  // 4. 서명 및 BOC 생성
  // (실제로는 WalletContractV5R1 사용 필요, 임시 구현)
  // TODO: 실제 구현 시 WalletContractV5R1로 서명해야 함
  const boc = 'temp_boc_placeholder'; // 임시 값

  // 5. TonCenter v2로 전송
  const url = 'https://toncenter.com/api/v2/sendBoc';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ boc }),
  });

  const data = await response.json() as any;

  if (!data.ok) {
    throw new Error(`Failed to send transaction: ${data.error || 'Unknown error'}`);
  }

  return data.result.hash;
}
