import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  css: {
    preprocessorOptions: {
      css: {
        javascriptEnabled: true,
      },
    },
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    outDir: '../api/public/dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          "vendor-react": ["react", "react-dom"],
          "vendor-ui": [
            "@headlessui/react",
            "@heroicons/react",
            "@tailwindcss/forms",
            "lucide-react",
            "tw-elements",
          ],
          query: ["axios"],
          "components": ["recharts"],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        // assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (ext === 'svg') {
            if (assetInfo.name.includes('keenicons')) {
              return 'assets/icons/[name]-[hash][extname]';
            }
            return 'assets/svg/[name]-[hash][extname]';
          }
          if (ext === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|gif|ico)$/.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
    },
    // Enable chunk size warnings at 500kb
    chunkSizeWarningLimit: 500,
    // Enable gzip compression
    minify: "esbuild",
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': '/api', // Sesuaikan dengan URL Laravel
      // '/api': 'http://mbiclicks.mbikedah.com.my/api', // Sesuaikan dengan URL Laravel
    },
  },
});
