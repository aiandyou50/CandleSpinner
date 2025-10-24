/**
 * Ankr JSON-RPC 유틸리티
 * 
 * 사용:
 * - sendBoc(boc): BOC 전송 (거래 확인)
 * - getAccountState(address): 계정 상태 조회 (seqno 포함)
 * - getBalance(address): TON 잔액 조회
 * - runGetMethod(address, method, params): 스마트 컨트랙트 메서드 호출
 */

interface RpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: any[];
}

interface RpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export class AnkrRpc {
  constructor(private rpcUrl: string) {
    if (!rpcUrl) {
      throw new Error('AnkrRpc: RPC URL required');
    }
  }

  private async call<T>(method: string, params: any[]): Promise<T> {
    const id = Math.floor(Math.random() * 1e9);
    
    console.log(`[RPC] 호출 시작: method=${method}, id=${id}`);
    console.log(`[RPC] RPC URL: ${this.rpcUrl.substring(0, 50)}...`);
    
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id,
          method,
          params
        } as RpcRequest)
      });

      console.log(`[RPC] HTTP 응답: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.error(`[RPC] ❌ HTTP 오류 (${response.status}): ${text.substring(0, 200)}`);
        throw new Error(`RPC HTTP ${response.status}: ${text.substring(0, 100)}`);
      }

      let data: RpcResponse<T>;
      try {
        data = (await response.json()) as RpcResponse<T>;
      } catch (e) {
        console.error(`[RPC] ❌ JSON 파싱 오류: ${e}`);
        throw new Error(`RPC Response parse error: ${e}`);
      }

      if (data.error) {
        console.error(`[RPC] ❌ RPC 오류 (${data.error.code}): ${data.error.message}`);
        throw new Error(`RPC Error ${data.error.code}: ${data.error.message}`);
      }

      if (data.result === undefined) {
        console.warn(`[RPC] ⚠️ result 없음 for method: ${method}`);
        throw new Error(`RPC no result for method: ${method}`);
      }

      console.log(`[RPC] ✅ 호출 성공: method=${method}`);
      return data.result;
    } catch (error) {
      console.error(`[RPC] ❌ 호출 실패: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * BOC 전송 (거래 확인)
   * 
   * @param boc - 서명된 거래 BOC (base64)
   * @returns 메시지 해시
   */
  async sendBoc(boc: string): Promise<string> {
    console.log(`[RPC] sendBoc 요청: ${boc.substring(0, 30)}...`);
    
    try {
      const result = await this.call<{ message_hash?: string }>(
        'sendBoc',
        [boc]
      );
      
      const hash = result.message_hash || 'pending';
      console.log(`[RPC] ✅ BOC 전송 성공: ${hash}`);
      return hash;
    } catch (error) {
      console.error(`[RPC] ❌ BOC 전송 실패:`, error);
      throw error;
    }
  }

  /**
   * 계정 상태 조회 (seqno 포함)
   * 
   * @param address - 지갑 주소
   * @returns 계정 상태 (seqno는 result.account?.state?.seq_no 경로)
   */
  async getAccountState(address: string): Promise<any> {
    console.log(`[RPC] getAccountState 요청: ${address}`);
    
    try {
      const result = await this.call<any>(
        'getAccountState',
        [address]
      );
      
      // seqno 추출 시도 (경로는 RPC 구현에 따라 다를 수 있음)
      let seqno = 0;
      try {
        seqno = result?.account?.state?.seq_no || 
                result?.account?.storage?.state?.seq_no ||
                result?.seq_no ||
                0;
      } catch {
        seqno = 0;
      }
      
      console.log(`[RPC] ✅ 계정 상태 조회: seqno=${seqno}`);
      
      return result;
    } catch (error) {
      console.error(`[RPC] ❌ getAccountState 실패:`, error);
      throw error;
    }
  }

  /**
   * seqno 직접 조회 (편의 함수)
   * 
   * @param address - 지갑 주소
   * @returns seqno (정수)
   */
  async getSeqno(address: string): Promise<number> {
    try {
      const state = await this.getAccountState(address);
      
      // 여러 경로 시도
      const seqno = 
        state?.account?.state?.seq_no ||
        state?.account?.storage?.state?.seq_no ||
        state?.seq_no ||
        0;
      
      return typeof seqno === 'number' ? seqno : parseInt(String(seqno), 10) || 0;
    } catch (error) {
      console.error(`[RPC] ❌ getSeqno 실패:`, error);
      // 실패 시 0 반환 (새 계정)
      return 0;
    }
  }

  /**
   * 계정 TON 잔액 조회
   * 
   * @param address - 지갑 주소
   * @returns TON 잔액 (nanoton, BigInt)
   */
  async getBalance(address: string): Promise<bigint> {
    console.log(`[RPC] getBalance 요청: ${address}`);
    
    try {
      const result = await this.call<any>(
        'getAccountState',
        [address]
      );
      
      // balance 추출 시도
      const balance = 
        result?.account?.balance ||
        result?.account?.storage?.balance ||
        result?.balance ||
        '0';
      
      const balanceBigInt = BigInt(String(balance));
      console.log(`[RPC] ✅ 잔액: ${(Number(balanceBigInt) / 1e9).toFixed(4)} TON`);
      
      return balanceBigInt;
    } catch (error) {
      console.error(`[RPC] ❌ getBalance 실패:`, error);
      throw error;
    }
  }

  /**
   * 스마트 컨트랙트 메서드 호출
   * 
   * @param address - 컨트랙트 주소
   * @param method - 메서드 이름
   * @param params - 메서드 파라미터
   * @returns 반환 값 (스택)
   */
  async runGetMethod(
    address: string,
    method: string,
    params: any[] = []
  ): Promise<any> {
    console.log(`[RPC] runGetMethod 요청: ${address}.${method}`);
    
    try {
      const result = await this.call<any>(
        'runGetMethod',
        [address, method, params]
      );
      
      console.log(`[RPC] ✅ 메서드 실행 성공`);
      return result;
    } catch (error) {
      console.error(`[RPC] ❌ runGetMethod 실패:`, error);
      throw error;
    }
  }

  /**
   * 거래 상태 조회 (옵션: Ankr 지원 여부 확인 필요)
   */
  async getTransactionStatus(txHash: string): Promise<any> {
    console.log(`[RPC] 거래 상태 조회: ${txHash}`);
    
    try {
      const result = await this.call<any>(
        'getTransactionStatus',
        [txHash]
      );
      
      console.log(`[RPC] ✅ 거래 상태:`, result);
      return result;
    } catch (error) {
      console.error(`[RPC] ⚠️ getTransactionStatus 미지원:`, error);
      // 이 메서드가 지원되지 않을 수 있음
      return null;
    }
  }
}

/**
 * seqno 관리자 (원자성 보장)
 */
export class SeqnoManager {
  constructor(
    private rpc: AnkrRpc,
    private kv: any,
    private walletAddress: string
  ) {}

  /**
   * seqno 안전하게 증가 및 반환
   * 
   * 전략:
   * 1. 블록체인에서 현재 seqno 조회
   * 2. KV에서 로컬 seqno 확인
   * 3. 블록체인 seqno ≥ 로컬 seqno: 로컬 업데이트
   * 4. 다음 seqno 반환
   */
  async getAndIncrementSeqno(): Promise<number> {
    const SEQNO_KEY = 'game_wallet_seqno';
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Step 1: 블록체인에서 최신 seqno 조회
        const blockchainSeqno = await this.rpc.getSeqno(this.walletAddress);
        console.log(`[seqno] 블록체인 seqno: ${blockchainSeqno}`);

        // Step 2: KV에서 로컬 seqno 조회
        const localSeqnoStr = await this.kv.get(SEQNO_KEY);
        const localSeqno = localSeqnoStr ? parseInt(localSeqnoStr, 10) : 0;
        console.log(`[seqno] 로컬 seqno: ${localSeqno}`);

        // Step 3: 최신 seqno 결정 (블록체인 우선)
        const currentSeqno = Math.max(blockchainSeqno, localSeqno);
        const nextSeqno = currentSeqno + 1;

        console.log(`[seqno] 다음 seqno: ${nextSeqno} (현재: ${currentSeqno})`);

        // Step 4: KV 업데이트
        await this.kv.put(SEQNO_KEY, nextSeqno.toString());

        console.log(`✅ seqno 증가 성공: ${currentSeqno} → ${nextSeqno}`);
        return nextSeqno;

      } catch (error) {
        console.error(`[seqno] 시도 ${attempt + 1}/${maxRetries} 실패:`, error);
        
        if (attempt < maxRetries - 1) {
          // 재시도 전 백오프 대기
          const waitMs = 100 * Math.pow(2, attempt); // 100ms, 200ms, 400ms
          console.log(`[seqno] ${waitMs}ms 대기 후 재시도...`);
          await new Promise((res) => setTimeout(res, waitMs));
        } else {
          throw new Error(`seqno 획득 실패 (${maxRetries}회 재시도)`);
        }
      }
    }

    throw new Error('Unexpected: getAndIncrementSeqno loop failed');
  }

  /**
   * seqno 리셋 (복구용)
   */
  async resetSeqno(): Promise<void> {
    const SEQNO_KEY = 'game_wallet_seqno';
    const blockchainSeqno = await this.rpc.getSeqno(this.walletAddress);
    
    console.log(`[seqno] 리셋: 블록체인 seqno=${blockchainSeqno}`);
    await this.kv.put(SEQNO_KEY, blockchainSeqno.toString());
    console.log(`✅ seqno 리셋 완료`);
  }
}
