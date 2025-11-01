/**
 * Jetton Wallet 주소 유틸리티
 * 사용자 지갑과 Jetton Master로부터 Jetton Wallet 주소 계산
 */

import { Address, Contract, ContractProvider } from '@ton/ton';
import { TonClient } from '@ton/ton';

/**
 * JettonMaster 간단한 구현
 */
class SimpleJettonMaster implements Contract {
  constructor(readonly address: Address) {}

  async getWalletAddress(provider: ContractProvider, ownerAddress: Address): Promise<Address> {
    const result = await provider.get('get_wallet_address', [
      { type: 'slice', cell: beginCell().storeAddress(ownerAddress).endCell() }
    ]);
    return result.stack.readAddress();
  }
}

// 임시: beginCell import
function beginCell() {
  const { beginCell: bc } = require('@ton/ton');
  return bc();
}

/**
 * 사용자의 Jetton Wallet 주소 계산
 * 
 * @param userAddress - 사용자 TON 지갑 주소
 * @param jettonMasterAddress - Jetton Master 컨트랙트 주소
 * @returns 사용자의 Jetton Wallet 주소
 */
export async function getUserJettonWalletAddress(
  userAddress: string,
  jettonMasterAddress: string
): Promise<string> {
  try {
    const client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC'
    });

    const userAddr = Address.parse(userAddress);
    const jettonMasterAddr = Address.parse(jettonMasterAddress);

    const jettonMaster = new SimpleJettonMaster(jettonMasterAddr);
    const provider = client.provider(jettonMasterAddr);
    
    const jettonWalletAddr = await jettonMaster.getWalletAddress(provider, userAddr);
    
    return jettonWalletAddr.toString({ urlSafe: true, bounceable: true });
  } catch (error) {
    console.error('Jetton Wallet 주소 계산 실패:', error);
    throw new Error(`Jetton Wallet 주소 계산 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
}
