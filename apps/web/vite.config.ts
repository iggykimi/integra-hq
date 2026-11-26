import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@contracts': path.resolve(__dirname, '../../07_CONTRATOS'),
      '@agents': path.resolve(__dirname, '../../04_AGENTES'),
      '@brand': path.resolve(__dirname, '../../08_RECURSOS/brand'),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '../..')],
    },
  },
  build: {
    target: 'esnext',
  },
});
