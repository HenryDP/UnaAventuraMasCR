
import JSZip from 'jszip';

export const downloadProjectAsZip = async () => {
  const zip = new JSZip();

  // Definimos los archivos en la raíz para mantener la estructura plana requerida
  const files: Record<string, string> = {
    'index.html': `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#059669">
    <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/744/744465.png">
    <title>Costa Rica Pura Vida Tours</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <style>
        html { scroll-behavior: smooth; }
        body { font-family: 'Montserrat', sans-serif; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
    </style>
</head>
<body class="bg-stone-50 text-stone-900">
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
</body>
</html>`,
    'package.json': JSON.stringify({
      "name": "una-aventura-mas-cr",
      "private": true,
      "version": "1.3.0",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      },
      "dependencies": {
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "@google/genai": "^1.39.0",
        "jszip": "^3.10.1"
      },
      "devDependencies": {
        "@types/react": "^18.3.3",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        "typescript": "^5.5.3",
        "vite": "^5.4.1",
        "vite-plugin-pwa": "^0.20.0"
      }
    }, null, 2),
    'vite.config.ts': `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Una Aventura Más CR',
        short_name: 'AventuraCR',
        theme_color: '#059669',
        background_color: '#fafaf9',
        display: 'standalone',
        icons: [
          { src: 'https://cdn-icons-png.flaticon.com/512/744/744465.png', sizes: '192x192', type: 'image/png' },
          { src: 'https://cdn-icons-png.flaticon.com/512/744/744465.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
});`,
    'README.md': `# Una Aventura Más CR\n\nDespliega este proyecto en Netlify o Vercel.\n1. npm install\n2. npm run build\n3. Sube la carpeta 'dist'.`
  };

  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });

  try {
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'AventuraCR_Production.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error al exportar:", err);
  }
};
