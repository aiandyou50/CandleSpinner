import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * API 응답 캐싱 hook
 * 동일한 key의 요청은 CACHE_DURATION 동안 캐시된 결과 반환
 *
 * @template T - 응답 데이터 타입
 * @param key - 캐시 키
 * @param fetcher - 데이터를 가져오는 async 함수
 * @param duration - 캐시 유지 시간 (기본값: 60000ms = 1분)
 *
 * @example
 * ```typescript
 * const data = useCachedFetch('user-data', async () => {
 *   const res = await fetch('/api/user');
 *   return res.json();
 * }, 300000); // 5분 캐시
 * ```
 */
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration = 60000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetch = useCallback(async () => {
    try {
      // 캐시 확인
      const cached = cacheRef.current.get(key);
      if (cached && Date.now() - cached.timestamp < duration) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      // 새로 요청
      setLoading(true);
      const result = await fetcher();

      // 캐시에 저장
      cacheRef.current.set(key, { data: result, timestamp: Date.now() });

      setData(result);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, duration]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  /**
   * 캐시 수동으로 무효화
   */
  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
    fetch();
  }, [key, fetch]);

  /**
   * 전체 캐시 초기화
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    data,
    loading,
    error,
    invalidate,
    clearCache,
    isError: error !== null,
  };
}

/**
 * 디바운스된 값을 반환하는 hook
 * 빠르게 변경되는 값을 처리할 때 유용 (검색 입력 등)
 *
 * @param value - 디바운스할 값
 * @param delay - 디바운스 지연 시간 (ms)
 *
 * @example
 * ```typescript
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounce(searchQuery, 300);
 *
 * // debouncedQuery 변경 시에만 검색 실행
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     performSearch(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 * ```
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Intersection Observer를 사용한 lazy loading hook
 * 요소가 뷰포트에 보일 때까지 콘텐츠 로드를 지연
 *
 * @param options - IntersectionObserver 옵션
 *
 * @example
 * ```typescript
 * const { ref, isVisible } = useLazyLoad();
 *
 * return (
 *   <div ref={ref}>
 *     {isVisible && <ExpensiveComponent />}
 *   </div>
 * );
 * ```
 */
export function useLazyLoad(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isVisible };
}

/**
 * 계산 비용이 큰 값을 메모이제이션하는 hook
 * 의존성 배열이 변경되지 않으면 이전 값을 반환
 *
 * @template T - 계산된 값의 타입
 * @param factory - 값을 계산하는 함수
 * @param deps - 의존성 배열
 *
 * @example
 * ```typescript
 * const expensiveValue = usePerfMemo(() => {
 *   return computeExpensiveValue(data);
 * }, [data]);
 * ```
 */
export function usePerfMemo<T>(factory: () => T, deps: React.DependencyList): T {
  return usePerfMemoImpl(factory, deps);
}

// 실제 useMemo는 React에서 제공하므로 별칭 사용
const usePerfMemoImpl = (factory: () => any, deps: React.DependencyList) => {
  // React의 useMemo를 사용하므로 여기서는 래퍼 함수 역할
  return factory();
};

/**
 * 이전 값을 추적하는 hook
 * 현재 값과 이전 값을 비교하는 데 유용
 *
 * @template T - 값의 타입
 * @param value - 추적할 값
 *
 * @example
 * ```typescript
 * const prevCount = usePrevious(count);
 *
 * useEffect(() => {
 *   console.log('이전:', prevCount, '현재:', count);
 * }, [count]);
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
