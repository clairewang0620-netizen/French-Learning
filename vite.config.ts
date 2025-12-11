import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015', // Support older browsers/mobile Safari
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code to improve loading reliability
          vendor: ['react', 'react-dom', 'recharts', 'lucide-react'],
        },
      },
    },
  }
});