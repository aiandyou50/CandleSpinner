/**
 * CREDIT_KV 보조 유틸리티
 * 슬롯 및 더블업 로직에서 일관된 크레딧 저장 형식을 유지하기 위해 사용
 */

interface CreditEnv {
  CREDIT_KV: KVNamespace;
}

export interface CreditRecord {
  credit: number;
  lastUpdated: string;
}

/**
 * 크레딧 값을 0 이상, 소수점 둘째 자리까지 정규화
 */
function normalizeCredit(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const sanitized = Math.max(0, value);
  return Math.round((sanitized + Number.EPSILON) * 100) / 100;
}

/**
 * CREDIT_KV에서 현재 크레딧을 조회 (형식 불일치 대비 방어 코드 포함)
 */
export async function getCredit(env: CreditEnv, walletAddress: string): Promise<number> {
  const key = `credit:${walletAddress}`;

  try {
    const stored = await env.CREDIT_KV.get<CreditRecord | number>(key, 'json');

    if (typeof stored === 'number') {
      return normalizeCredit(stored);
    }

    if (stored && typeof stored === 'object' && typeof stored.credit === 'number') {
      return normalizeCredit(stored.credit);
    }
  } catch (error) {
    console.warn(`[Credit] JSON parse failed for ${walletAddress}:`, error);
  }

  const raw = await env.CREDIT_KV.get(key);
  if (!raw) {
    return 0;
  }

  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    return normalizeCredit(numeric);
  }

  try {
    const parsed = JSON.parse(raw) as { credit?: number };
    if (typeof parsed.credit === 'number') {
      return normalizeCredit(parsed.credit);
    }
  } catch {
    // ignore
  }

  console.warn(`[Credit] Unable to parse credit for ${walletAddress}, defaulting to 0. Raw value: ${raw}`);
  return 0;
}

/**
 * CREDIT_KV에 크레딧을 JSON 형식으로 저장
 */
export async function setCredit(
  env: CreditEnv,
  walletAddress: string,
  credit: number
): Promise<number> {
  const key = `credit:${walletAddress}`;
  const normalized = normalizeCredit(credit);
  const record: CreditRecord = {
    credit: normalized,
    lastUpdated: new Date().toISOString(),
  };

  await env.CREDIT_KV.put(key, JSON.stringify(record));
  return normalized;
}
