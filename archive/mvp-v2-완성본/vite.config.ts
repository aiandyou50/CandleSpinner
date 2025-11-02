import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // ✅ Cloudflare Workers _routes.json 자동 생성
    {
      name: 'generate-routes-json',
      closeBundle() {
        const routesJson = {
          version: 1,
          include: ['/*'],
          exclude: ['/assets/*']
        };
        fs.writeFileSync(
          path.resolve(__dirname, 'dist/_routes.json'),
          JSON.stringify(routesJson, null, 2)
        );
        console.log('✅ dist/_routes.json 생성 완료');
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer/',
    },
  },
  define: {
    'global': 'globalThis',
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
