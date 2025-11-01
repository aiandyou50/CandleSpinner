/**
 * 크레딧 관리 (Cloudflare KV)
 */

interface CreditData {
  credit: number;
  lastUpdated: string;
}

/**
 * 크레딧 조회
 */
export async function getCreditData(kv: KVNamespace, walletAddress: string): Promise<CreditData> {
  const key = `credit:${walletAddress}`;
  const data = await kv.get<CreditData>(key, 'json');
  
  if (!data) {
    return { credit: 0, lastUpdated: new Date().toISOString() };
  }
  
  return data;
}

/**
 * 크레딧 업데이트 (증가/차감)
 */
export async function updateCredit(
  kv: KVNamespace, 
  walletAddress: string, 
  amount: number
): Promise<void> {
  const key = `credit:${walletAddress}`;
  const currentData = await getCreditData(kv, walletAddress);
  
  const newCredit = Math.max(0, currentData.credit + amount);
  
  const updatedData: CreditData = {
    credit: newCredit,
    lastUpdated: new Date().toISOString()
  };
  
  await kv.put(key, JSON.stringify(updatedData));
}
