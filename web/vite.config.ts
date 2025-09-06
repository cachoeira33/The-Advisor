import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request that starts with "/api" will be sent to the backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    },
    // Add this line to allow access from your network and ngrok
    host: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});