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
 * 에러 추적 및 모니터링을 위한 Sentry SDK 설정
 * 환경변수를 통해 DSN 설정 (기본값: 테스트 모드)
 */
if (typeof window !== 'undefined') {
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || 'https://placeholder@sentry.io/123456';
  const environment = import.meta.env.MODE === 'production' ? 'production' : 'development';

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: environment,
    integrations: [],
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
