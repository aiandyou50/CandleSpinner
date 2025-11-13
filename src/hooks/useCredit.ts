/**
 * 크레딧 관리 Hook
 * API를 통해 크레딧 조회/업데이트
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchCredit } from '@/api/client';

export function useCredit(walletAddress: string | null) {
  const [credit, setCredit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCredit = useCallback(async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const creditData = await fetchCredit(walletAddress);
      setCredit(creditData.credit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credit');
      console.error('Failed to load credit:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) {
      setCredit(0);
      return;
    }

    loadCredit();
  }, [walletAddress, loadCredit]);

  const refreshCredit = useCallback(() => {
    loadCredit();
  }, [loadCredit]);

  return { credit, isLoading, error, refreshCredit };
}
