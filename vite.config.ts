import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` -> normal multi-file build in dist/ for Netlify.
// `npm run build:single` -> one self-contained HTML file (used for the preview link).
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: mode === 'single' ? { outDir: 'dist-single', assetsInlineLimit: 100000000 } : { outDir: 'dist', chunkSizeWarningLimit: 800 },
}));
