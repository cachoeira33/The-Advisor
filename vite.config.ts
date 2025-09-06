import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    },
    // --- COMBINED CONFIGURATION ---
    host: true,
    allowedHosts: [
      '638ebb16e61d.ngrok-free.app' // Make sure this is your current ngrok URL
    ],
    hmr: {
      clientPort: 5173,
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});