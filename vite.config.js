// vite.config.js
import { defineConfig } from 'vite';
import { API_ENDPOINT } from './src/scripts/config.js';
import react from '@vitejs/plugin-react';

const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'https://character-service.dndbeyond.com', // Target external API
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/character/v3/character') // Rewrite the URL path
      },
    }
  },
  plugins: [react()],
})
