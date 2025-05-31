import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/', // Asegura rutas correctas al desplegar
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  },
  build: {
    outDir: 'dist' // Asegura que Vite construya en la carpeta esperada por Vercel
  }
});
