import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@contracts': path.join(repoRoot, '07_CONTRATOS'),
      '@brand': path.join(repoRoot, '08_RECURSOS/brand'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
