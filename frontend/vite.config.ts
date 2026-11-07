import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Two pages: the platform, and sim.html (the isolated host for the simulations ported from KPRIET)
    rollupOptions: { input: { main: path.resolve(__dirname, 'index.html'), sim: path.resolve(__dirname, 'sim.html') } },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/smartboard': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/simulations': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
        // When the backend restarts (tsx watch), the websocket proxy gets ECONNRESET. Without a handler this
        // crashed the whole dev server ("exited with code 1"), so swallow it and let the client reconnect.
        configure: (proxy: any) => {
          proxy.on('error', () => {});
          proxy.on('proxyReqWs', (_req: any, socket: any) => socket.on('error', () => {}));
        },
      },
    },
  },
});
