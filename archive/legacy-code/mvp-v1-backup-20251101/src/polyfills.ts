// src/polyfills.ts
// Provide a browser-compatible Buffer global for libraries (e.g., ton-core) that expect Node's Buffer.
import { Buffer } from 'buffer';

// set global Buffer for runtime
(globalThis as any).Buffer = Buffer;