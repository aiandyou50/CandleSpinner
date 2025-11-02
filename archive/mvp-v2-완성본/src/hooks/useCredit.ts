/**
 * 크레딧 관리 Hook
 * API를 통해 크레딧 조회/업데이트
 */

import { useState, useEffect } from 'react';
import { fetchCredit } from '@/api/client';

export function useCredit(walletAddress: string | null) {
  const [credit, setCredit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setCredit(0);
      return;
    }

    loadCredit();
  }, [walletAddress]);

  const loadCredit = async () => {
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
  };

  const refreshCredit = () => {
    loadCredit();
  };

  return { credit, isLoading, error, refreshCredit };
}
