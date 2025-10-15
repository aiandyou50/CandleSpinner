import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      buffer: 'buffer/'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // Remove console logs in production
      }
    },
    rollupOptions: {
      input: '/index.html'
    }
  }
});
