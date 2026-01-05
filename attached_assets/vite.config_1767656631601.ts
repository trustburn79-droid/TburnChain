/**
 * TBURN Vite Configuration
 * Optimized for chunk loading stability
 * 
 * @version 1.0.0
 * @date 2026-01-06
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // ============================================================================
  // Build Configuration
  // ============================================================================
  
  build: {
    // Generate source maps for production debugging
    sourcemap: true,
    
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        // Consistent chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // Manual chunks for better caching and smaller initial load
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('node_modules/react')) {
            return 'react-vendor';
          }
          
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }
          
          // UI libraries
          if (id.includes('node_modules/@radix-ui') ||
              id.includes('node_modules/@headlessui') ||
              id.includes('node_modules/framer-motion')) {
            return 'ui-vendor';
          }
          
          // Chart/Visualization libraries
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3') ||
              id.includes('node_modules/chart.js')) {
            return 'chart-vendor';
          }
          
          // Web3/Blockchain libraries
          if (id.includes('node_modules/ethers') ||
              id.includes('node_modules/viem') ||
              id.includes('node_modules/@wagmi') ||
              id.includes('node_modules/web3')) {
            return 'web3-vendor';
          }
          
          // Query/State management
          if (id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/zustand') ||
              id.includes('node_modules/jotai')) {
            return 'state-vendor';
          }
          
          // Utilities
          if (id.includes('node_modules/lodash') ||
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/axios')) {
            return 'util-vendor';
          }
        },
      },
    },
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,  // Keep console for debugging chunk errors
        drop_debugger: true,
      },
    },
  },
  
  // ============================================================================
  // Optimization
  // ============================================================================
  
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
    
    // Exclude large dependencies that should be loaded on-demand
    exclude: [],
  },
  
  // ============================================================================
  // Server Configuration (Development)
  // ============================================================================
  
  server: {
    port: 3000,
    
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/rpc': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    
    // CORS for development
    cors: true,
    
    // HMR settings
    hmr: {
      overlay: true,
    },
  },
  
  // ============================================================================
  // Preview Configuration (Production preview)
  // ============================================================================
  
  preview: {
    port: 4173,
    
    // Headers for static files
    headers: {
      // Cache hashed assets forever
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  
  // ============================================================================
  // Resolution
  // ============================================================================
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  
  // ============================================================================
  // CSS Configuration
  // ============================================================================
  
  css: {
    devSourcemap: true,
  },
  
  // ============================================================================
  // Environment Variables
  // ============================================================================
  
  envPrefix: ['VITE_', 'TBURN_'],
});
