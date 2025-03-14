import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "development" ? "/" : "/dist/",
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
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  build: {
    outDir: "../api/public/dist",
    assetsDir: "assets",
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
          components: ["recharts"],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];

          if (ext === "svg") {
            if (assetInfo.name.includes("keenicons")) {
              return "assets/icons/[name]-[hash][extname]";
            }
            return "assets/svg/[name]-[hash][extname]";
          }
          if (ext === "css") {
            return "assets/css/[name]-[hash][extname]";
          }
          if (/\.(png|jpe?g|gif|ico)$/.test(assetInfo.name)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: "esbuild",
    sourcemap: true,
  },
  server: {
    proxy: {
      "/api": {
        target: mode === "development" ? "http://mbiclicks.mbikedah.com.my" : "/",
        changeOrigin: true,
        secure: false,
        timeout: 30000,  // 30 saat
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    host: true,
    strictPort: true,
    port: 3000
  },
}));