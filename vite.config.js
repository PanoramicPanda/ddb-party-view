// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
  build: {
    minify: 'terser',
    terserOptions: {
      keep_fnames: /handleCreatureSelectionChange|checkDMMode|handleSaveSettings|loadSettings|handleCreatureStateChange/
    }
  }
})
