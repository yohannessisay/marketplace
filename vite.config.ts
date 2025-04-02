
import { defineConfig } from 'vite'; 
import react from '@vitejs/plugin-react'; 
import autoprefixer from 'autoprefixer';
import path from "path"
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(),tailwindcss(),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
