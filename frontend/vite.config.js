import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    base: isProduction ? '/dist/' : '/',
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
          chunkFileNames: (chunkInfo) => {
            return isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js';
          },
          entryFileNames: (assetInfo) => {
            return isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js';
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            const prefix = isProduction ? '/dist/' : '';
            
            if (ext === 'svg') {
              if (assetInfo.name.includes('keenicons')) {
                return prefix + 'assets/icons/[name]-[hash][extname]';
              }
              return prefix + 'assets/svg/[name]-[hash][extname]';
            }
            if (ext === 'css') {
              return prefix + 'assets/css/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|ico)$/.test(assetInfo.name)) {
              return prefix + 'assets/images/[name]-[hash][extname]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return prefix + 'assets/fonts/[name]-[hash][extname]';
            }
            return prefix + 'assets/[name]-[hash][extname]';
          }
        },
      },
      chunkSizeWarningLimit: 500,
      minify: "esbuild",
      sourcemap: false,
    },
    server: {
      proxy: {
        '/api': '/api',
      },
    },
  };
});
