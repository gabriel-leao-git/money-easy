import { createReadStream, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// O APK do app fica na raiz do repo, fora do git e fora do build. O dev e o preview
// servem o arquivo direto de lá, só lendo: nada é copiado, movido ou alterado.
// O botão "Download" do menu aponta para esta mesma rota.
const APK_NAME = 'instal-app.apk';
const APK_PATH = fileURLToPath(new URL(APK_NAME, import.meta.url));

function serveApk(): Plugin {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url?.split('?')[0] !== `/${APK_NAME}`) return next();
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();

    let size: number;
    try {
      size = statSync(APK_PATH).size;
    } catch {
      res.statusCode = 404;
      res.end('APK não encontrado');
      return;
    }

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${APK_NAME}"`);
    res.setHeader('Content-Length', size);
    res.setHeader('Cache-Control', 'no-cache');
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(APK_PATH)
      .on('error', () => res.destroy())
      .pipe(res);
  };

  return {
    name: 'money-easy:apk',
    configureServer: (server) => void server.middlewares.use(handler),
    configurePreviewServer: (server) => void server.middlewares.use(handler),
  };
}

// base relativa: o build roda em qualquer host estático (GitHub Pages, Vercel, Netlify...)
export default defineConfig({
  base: './',
  plugins: [react(), serveApk()],
});
