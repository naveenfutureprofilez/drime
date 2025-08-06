import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import laravel from 'laravel-vite-plugin';
import replace from '@rollup/plugin-replace';
import tsconfigPaths from 'vite-tsconfig-paths';

// override laravel plugin base option (from absolute to relative to html base tag)
function basePath() {
  return {
    name: 'test',
    enforce: 'post',
    config: () => {
      return {
        base: '',
      };
    },
  };
}

export default defineConfig({
  base: '',
  server: {
    watch: {
      followSymlinks: true
    }
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@ui': '/common/foundation/resources/client/ui/library',
      '@common': '/common/foundation/resources/client',
      '@app': '/resources/client'
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      external: ['puppeteer', 'ioredis'],
    },
  },
  plugins: [
    tsconfigPaths(),
    react(),
    laravel({
      input: ['resources/client/main.jsx'],
      refresh: false,
    }),
    basePath(),
    replace({
      preventAssignment: true,
      __SENTRY_DEBUG__: false,
    }),
  ],
});
