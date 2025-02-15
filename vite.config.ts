import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ 
      manifest,
      contentScripts: {
        injectCss: true,
        preambleCode: false
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contentScript: resolve(__dirname, 'src/contentScript.tsx'),
        background: resolve(__dirname, 'src/background.ts')
      },
      external: ['react', 'react-dom'],
    },
    modulePreload: false,
    sourcemap: true,
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    }
  },
  optimizeDeps: {
    include: ['html2canvas', 'react', 'react-dom']
  },
  resolve: {
    alias: {
      'html2canvas': resolve(__dirname, 'node_modules/html2canvas/dist/html2canvas.esm.js')
    }
  }
});