import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          state: ['zustand'],
          xlsx: ['xlsx'],
          radix: ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-scroll-area', '@radix-ui/react-select', '@radix-ui/react-tabs'],
        },
      },
    },
  },
});
