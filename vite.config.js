const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');
const laravel = require('laravel-vite-plugin').default;
const replace = require('@rollup/plugin-replace');
const path = require('path');

module.exports = defineConfig({
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,   // don't auto-switch to another port
    watch: { followSymlinks: true },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    origin: 'http://localhost:5173', // 👈 this fixes the injected script URLs
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Enable history API fallback for React Router
    historyApiFallback: {
      index: '/index.html',
      rewrites: [
        { from: /^\/admin/, to: '/index.html' },
        { from: /^\/drive/, to: '/index.html' },
        { from: /./, to: '/index.html' }
      ]
    },
  },

  resolve: {
    preserveSymlinks: true,
    alias: {
      '@ui': path.resolve(__dirname, 'common/foundation/resources/client/ui/library'),
      '@common': path.resolve(__dirname, 'common/foundation/resources/client'),
      '@app': path.resolve(__dirname, 'resources/client'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.mjs'],
  },
  build: {
    sourcemap: true,
    rollupOptions: { 
      external: ['puppeteer', 'ioredis'],
      output: {
        // Enable hash-based filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Manual chunking to optimize bundle sizes
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('clsx') || id.includes('@tanstack/react-query')) {
              return 'vendor-utils';
            }
            if (id.includes('ace-builds') || id.includes('monaco-editor')) {
              return 'vendor-editor';
            }
            return 'vendor';
          }
          
          // Admin-specific modules
          if (id.includes('admin') && id.includes('appearance')) {
            return 'admin-appearance';
          }
          if (id.includes('admin') && id.includes('settings')) {
            return 'admin-settings';
          }
          if (id.includes('admin') && id.includes('analytics')) {
            return 'admin-analytics';
          }
          if (id.includes('admin')) {
            return 'admin-core';
          }
        }
      }
    },
  },
  plugins: [
    react(),
    laravel({ input: ['resources/client/main.jsx'], refresh: true }),
    replace({ preventAssignment: true, __SENTRY_DEBUG__: false }),
  ],
});
