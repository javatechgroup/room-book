import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/book/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/book/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/book/h2-console': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
