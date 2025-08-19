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
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,   // don’t auto-switch to another port
    watch: { followSymlinks: true },
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 5173,
    },
    origin: 'http://127.0.0.1:5173', // 👈 this fixes the injected script URLs
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
    rollupOptions: { external: ['puppeteer', 'ioredis'] },
  },
  plugins: [
    react(),
    laravel({ input: ['resources/client/main.jsx'], refresh: false }),
    basePath(),
    replace({ preventAssignment: true, __SENTRY_DEBUG__: false }),
  ],
});
