import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import crypto from 'node:crypto';

// Polyfill for environments where globalThis.crypto is missing (e.g. some Node versions)
if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'COP Ayikai Doblo District',
        short_name: 'COP Ayikai',
        description: 'Church of Pentecost Ayikai Doblo District portal.',
        theme_color: '#1A2F5F',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-icons': ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons'],
          'utils': ['axios', 'xlsx', 'recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
