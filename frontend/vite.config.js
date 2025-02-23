import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/dist/',
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
    outDir: 'dist',
    assetsDir: 'assets',
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
          // Add more vendor chunks as needed
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Enable chunk size warnings at 500kb
    chunkSizeWarningLimit: 500,
    // Enable gzip compression
    minify: "esbuild",
    sourcemap: false,
  },
});
