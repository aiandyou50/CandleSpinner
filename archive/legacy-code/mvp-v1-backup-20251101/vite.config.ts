import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 번들 분석 플러그인
    visualizer({
      open: false, // 자동 열기 비활성화
      gzipSize: true, // gzip 크기 표시
      brotliSize: true, // brotli 크기 표시
      filename: 'dist/stats.html', // 분석 결과 파일
    }),
  ],
  define: {
    global: 'globalThis',
  },
  build: {
    // 번들 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console 제거
      },
    },
    
    // 모든 번들에 해시 추가 (캐시 무효화)
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash:8].js`,
        chunkFileNames: `assets/[name]-[hash:8].js`,
        assetFileNames: `assets/[name]-[hash:8].[ext]`,
        // 동적 임포트로 청크 분할
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'tonconnect': ['@tonconnect/ui-react'],
          'ton': ['@ton/ton', '@ton/core'],
        },
      },
    },
  },
})