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
    watch: { followSymlinks: true },
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
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
