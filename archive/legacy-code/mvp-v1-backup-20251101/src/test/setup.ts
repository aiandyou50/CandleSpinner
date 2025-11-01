import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock window.Telegram for TMA environment tests
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      ready: vi.fn(),
      showAlert: vi.fn(),
      showPopup: vi.fn(),
      close: vi.fn()
    }
  },
  writable: true
});
