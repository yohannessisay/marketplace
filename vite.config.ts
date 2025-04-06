
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "::",
    port: 8080,
   fs: {
      strict: true,  
      allow: [
        '/home/crusaderwolf/Documents/web3/afrovalley/apps/ui/afrovalleyui'
      ]
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
});
