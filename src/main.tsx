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
  // Sentry DSN: https://sentry.io 에서 Project Settings > Client Keys (DSN) 에서 가져온 값
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN 
    || 'https://77e80587476570467e15c594544197e3@o4510227583598592.ingest.us.sentry.io/4510227588186112';
  const environment = import.meta.env.MODE === 'production' ? 'production' : 'development';
  const isProduction = environment === 'production';

  Sentry.init({
    // ============================================
    // DSN & Environment
    // ============================================
    dsn: SENTRY_DSN,
    environment: environment,
    
    // ============================================
    // Integrations (통합)
    // ============================================
    integrations: [
      // BrowserTracing: 페이지 성능 및 트랜잭션 추적
      Sentry.browserTracingIntegration(),
      // Replay: 세션 리플레이 (사용자 세션 기록)
      Sentry.replayIntegration(),
    ],
    
    // ============================================
    // Sampling (샘플링 설정)
    // ============================================
    // 트랜잭션 샘플링: 100% (모든 트랜잭션 기록)
    tracesSampleRate: isProduction ? 0.5 : 1.0,  // 프로덕션: 50%, 개발: 100%
    
    // 세션 리플레이 샘플링
    replaysSessionSampleRate: isProduction ? 0.1 : 0.5,
    // 에러 발생 시 리플레이 샘플링: 100% (에러 발생 시 항상 기록)
    replaysOnErrorSampleRate: 1.0,
    
    // ============================================
    // Release & Version Tracking
    // ============================================
    release: PACKAGE_JSON_VERSION,  // package.json의 버전
    
    // ============================================
    // PII (개인 식별 정보) 처리
    // ============================================
    // sendDefaultPii: false (기본값)
    // PII 데이터를 보내지 않음 (프라이버시 보호)
    // 필요시 'true'로 설정하여 IP 주소 등의 기본 PII 정보 포함
    
    // ============================================
    // Performance & Error Tracking
    // ============================================
    maxBreadcrumbs: 100,  // 이벤트 기록 최대 수
    attachStacktrace: true,  // 모든 메시지에 스택 트레이스 첨부
    
    // ============================================
    // 로깅 설정
    // ============================================
    enableLogs: true,  // Sentry 로그 활성화
    
    // ============================================
    // 분산 추적 (Distributed Tracing)
    // ============================================
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/candlespinner\.com\/api/,
      /^https:\/\/.*\.pages\.dev\/api/,  // Cloudflare Pages
    ],
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
