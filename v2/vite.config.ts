import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    fs: { allow: ['..'] },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Harambe's Dozen",
        short_name: 'HD12',
        description: 'The private league companion for Harambe\'s Dozen.',
        theme_color: '#071d2c',
        background_color: '#f5f0e6',
        display: 'standalone',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
