/**
 * TBURN Vite Configuration
 * 청크 로딩 안정화 최적화
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  build: {
    sourcemap: true,
    target: 'es2020',
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        manualChunks: (id) => {
          if (id.includes('node_modules/react')) return 'react-vendor';
          if (id.includes('node_modules/react-router')) return 'router-vendor';
          if (id.includes('node_modules/@radix-ui')) return 'ui-vendor';
          if (id.includes('node_modules/recharts')) return 'chart-vendor';
          if (id.includes('node_modules/ethers') || id.includes('node_modules/viem')) return 'web3-vendor';
          if (id.includes('node_modules/@tanstack')) return 'query-vendor';
        },
      },
    },
    
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/rpc': { target: 'http://localhost:5000', changeOrigin: true },
    },
    cors: true,
  },
  
  preview: {
    port: 4173,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
