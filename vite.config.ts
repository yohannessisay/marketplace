
import { defineConfig } from 'vite'; 
import react from '@vitejs/plugin-react'; 
import autoprefixer from 'autoprefixer';
import path from "path"
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    proxy: {
      '/api': {
        target: 'https://dummyjson.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@ui': path.resolve(__dirname, 'src/components/ui'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
    },
  },
  css: {
    postcss: {
      plugins: [ 
        autoprefixer,
      ],
    },
  },
});
