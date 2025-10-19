// Small Buffer polyfill loader for Cloudflare Functions
// Ensures a Buffer global exists for libraries that expect Node's Buffer.
import { Buffer } from 'buffer';

if (!(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}
