import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: o build roda em qualquer host estático (GitHub Pages, Vercel, Netlify...)
export default defineConfig({
  base: './',
  plugins: [react()],
});
