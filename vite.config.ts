import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { resolve } from 'path';
import fs from 'fs';
import pkg from './package.json';

export default defineConfig({
  plugins: [
    react(),
    crx({ 
      manifest,
      contentScripts: {
        injectCss: true,
        preambleCode: false
      },
      privateKey: fs.readFileSync(resolve(__dirname, 'extension.pem'), 'utf-8')
    })
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version)
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contentScript: resolve(__dirname, 'src/contentScript.tsx'),
        background: resolve(__dirname, 'src/background.ts')
      },
      external: [],
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
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.ts',
    // include unit tests in src and legacy CJS tests in the tests/ directory
    include: [
      // include test files in src and tests directories (supporting various extensions)
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx,cjs}'
    ],
    mockReset: true
  }
});