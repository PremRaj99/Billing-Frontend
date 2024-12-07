import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        secure: false,
      }
    }

  },
  plugins: [react()],
  resolve: {
    alias: {
      // Add any necessary aliases here if needed
    },
  },
});