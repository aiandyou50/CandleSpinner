import { Buffer } from 'buffer';

// Buffer 폴리필을 전역으로 설정
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
}

if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

// process 폴리필 (일부 라이브러리가 필요로 함)
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = {
    env: {},
    version: '',
    nextTick: (fn: () => void) => setTimeout(fn, 0),
  };
}
