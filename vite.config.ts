import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ES2015 supports older browsers including older Safari versions common in China
    target: 'es2015', 
    outDir: 'dist',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies to improve loading speed
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['recharts', 'lucide-react'],
        },
      },
    },
  }
});