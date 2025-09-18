const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');
const laravel = require('laravel-vite-plugin').default;
const replace = require('@rollup/plugin-replace');

function basePath() {
  return {
    name: 'test',
    enforce: 'post',
    config: () => ({ base: '' }),
  };
}

module.exports = defineConfig({
  base: '',
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
  },

  resolve: {
    preserveSymlinks: true,
    alias: {
      '@ui': '/common/foundation/resources/client/ui/library',
      '@common': '/common/foundation/resources/client',
      '@app': '/resources/client',
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: { 
      external: ['puppeteer', 'ioredis'],
      output: {
        // Enable hash-based filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
  },
  plugins: [
    react(),
    laravel({ input: ['resources/client/main.jsx'], refresh: true }),
    basePath(),
    replace({ preventAssignment: true, __SENTRY_DEBUG__: false }),
  ],
});
