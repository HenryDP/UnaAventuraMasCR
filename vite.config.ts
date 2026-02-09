
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Una Aventura Más CR',
        short_name: 'AventuraCR',
        description: 'Plataforma premium de turismo en Costa Rica.',
        theme_color: '#059669', // Emerald-600
        background_color: '#fafaf9', // Stone-50
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html' // Asegura que el punto de entrada sea el index.html de la raíz
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ai: ['@google/genai']
        }
      }
    }
  }
});
