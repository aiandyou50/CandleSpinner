/**
 * 반응형 미디어 쿼리 Hook
 * Material-UI breakpoints를 활용한 반응형 디자인
 */

import { useTheme, useMediaQuery } from '@mui/material';

export function useResponsive() {
  const theme = useTheme();

  return {
    // 모바일 (< 600px)
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    
    // 작은 태블릿 (>= 600px)
    isSmallTablet: useMediaQuery(theme.breakpoints.only('sm')),
    
    // 태블릿 (600px ~ 960px)
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    
    // 데스크톱 (>= 960px)
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    
    // 대형 데스크톱 (>= 1280px)
    isLargeDesktop: useMediaQuery(theme.breakpoints.up('lg')),
    
    // XL 모니터 (>= 1920px)
    isExtraLarge: useMediaQuery(theme.breakpoints.up('xl')),
    
    // 모바일 가로 모드 (세로보다 가로가 긴 경우)
    isLandscape: useMediaQuery('(orientation: landscape)'),
    
    // 현재 breakpoint 값
    getCurrentBreakpoint: () => {
      if (useMediaQuery(theme.breakpoints.only('xs'))) return 'xs';
      if (useMediaQuery(theme.breakpoints.only('sm'))) return 'sm';
      if (useMediaQuery(theme.breakpoints.only('md'))) return 'md';
      if (useMediaQuery(theme.breakpoints.only('lg'))) return 'lg';
      return 'xl';
    },
  };
}
