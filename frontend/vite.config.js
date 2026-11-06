import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'admin-route-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url ? req.url.split('?')[0] : '';
          const cleanUrl = rawUrl.toLowerCase().replace(/\/+$/, '');
          const opsRoutes = [
            '/admin',
            '/staff',
            '/superadmin',
            '/super-admin',
            '/driver',
            '/rider',
            '/dashboard',
            '/operations',
            '/operation',
            '/ops',
            '/portal',
            '/terminal',
          ];
          if (opsRoutes.includes(cleanUrl)) {
            req.url = '/admin.html';
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: resolve(__dirname, '../backend/public'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
