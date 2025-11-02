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

    fetchUserCredit();
  }, [walletAddress]);

  const fetchUserCredit = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const creditResponse = await fetchCredit(walletAddress);
      setCredit(creditResponse.credit);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load credit');
      console.error('Failed to load credit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCredit = () => {
    fetchUserCredit();
  };

  return { credit, isLoading, error, refreshCredit };
}
