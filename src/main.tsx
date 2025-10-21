// src/main.tsx
import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import { validateConfiguration } from './constants';
import './index.css';

/**
 * Configuration 검증
 * 필수 환경변수 확인
 */
try {
  validateConfiguration();
} catch (error) {
  console.error('Configuration validation error:', error);
  if (import.meta.env.MODE === 'production') {
    throw error;
  }
}

/**
 * Sentry 초기화
 * 에러 추적 및 성능 모니터링을 위한 Sentry SDK 설정
 * - BrowserTracing: 페이지 성능 및 트랜잭션 추적
 * 환경변수를 통해 DSN 설정 (기본값: 테스트 모드)
 */

// 패키지 버전
const PACKAGE_JSON_VERSION = '2.3.0';  // package.json에서 읽기

if (typeof window !== 'undefined') {
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || 'https://placeholder@sentry.io/123456';
  const environment = import.meta.env.MODE === 'production' ? 'production' : 'development';
  const isProduction = environment === 'production';

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: environment,
    
    // ============================================
    // Sampling (샘플링 설정)
    // ============================================
    tracesSampleRate: isProduction ? 0.1 : 1.0,  // 프로덕션: 10%, 개발: 100%
    
    // ============================================
    // Performance Monitoring (자동 활성화)
    // ============================================
    // Sentry는 자동으로 성능 모니터링을 활성화합니다
    // 주요 모니터링 항목:
    // - Page Load: 페이지 로딩 성능
    // - Navigation: 페이지 전환
    // - HTTP Requests: API 호출 성능
    // - React Errors: 컴포넌트 에러
    
    // ============================================
    // Release & Version Tracking
    // ============================================
    release: PACKAGE_JSON_VERSION,  // package.json의 버전
    
    // ============================================
    // 기타 설정
    // ============================================
    maxBreadcrumbs: 50,  // 이벤트 기록 최대 수
    attachStacktrace: true,  // 모든 메시지에 스택 트레이스 첨부
  });
}

// ============================================
// Web Vitals 수집 (자동)
// ============================================
/**
 * Sentry는 자동으로 Core Web Vitals을 수집합니다:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
