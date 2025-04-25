import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        page2: 'src/portal.html',
      },
    },
    outDir: 'dist', // Répertoire de sortie
  },
  publicDir: 'public/',
  base: './',
});