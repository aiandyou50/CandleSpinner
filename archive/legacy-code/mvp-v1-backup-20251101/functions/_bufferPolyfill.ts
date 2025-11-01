// Small Buffer polyfill loader for Cloudflare Functions
// Ensures a Buffer global exists for libraries that expect Node's Buffer.
import { Buffer } from 'buffer';

if (!(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

// Provide minimal browser globals so bundled deps do not crash in worker runtime.
const globalScope = globalThis as any;

if (typeof globalScope.window === 'undefined') {
  globalScope.window = globalScope;
}

if (typeof globalScope.self === 'undefined') {
  globalScope.self = globalScope;
}
