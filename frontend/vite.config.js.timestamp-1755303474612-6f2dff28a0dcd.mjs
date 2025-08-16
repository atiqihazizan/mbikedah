// vite.config.js
import { defineConfig } from "file:///Users/atiqihazizan/Works/mbiclicks/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///Users/atiqihazizan/Works/mbiclicks/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwindcss from "file:///Users/atiqihazizan/Works/mbiclicks/frontend/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///Users/atiqihazizan/Works/mbiclicks/frontend/node_modules/autoprefixer/lib/autoprefixer.js";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "development" ? "/" : "/dist/",
  css: {
    preprocessorOptions: {
      css: {
        javascriptEnabled: true
      }
    },
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"]
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
            "tw-elements"
          ],
          query: ["axios"],
          components: ["recharts"]
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
        }
      }
    },
    chunkSizeWarningLimit: 500,
    minify: "esbuild",
    sourcemap: true
  },
  server: {
    proxy: {
      "/api": {
        target: mode === "development" ? "https://mbiclicks.mbikedah.com.my" : "/",
        changeOrigin: true,
        secure: false,
        timeout: 3e4,
        // 30 saat
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
          });
        }
      }
    },
    host: true,
    strictPort: true,
    port: 3e3
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYXRpcWloYXppemFuL1dvcmtzL21iaWNsaWNrcy9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2F0aXFpaGF6aXphbi9Xb3Jrcy9tYmljbGlja3MvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2F0aXFpaGF6aXphbi9Xb3Jrcy9tYmljbGlja3MvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ3RhaWx3aW5kY3NzJ1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIGJhc2U6IG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiA/IFwiL1wiIDogXCIvZGlzdC9cIixcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgY3NzOiB7XG4gICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBvc3Rjc3M6IHtcbiAgICAgIHBsdWdpbnM6IFt0YWlsd2luZGNzcywgYXV0b3ByZWZpeGVyXSxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgZXh0ZW5zaW9uczogWycuanMnLCAnLmpzeCcsICcuanNvbiddXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiBcIi4uL2FwaS9wdWJsaWMvZGlzdFwiLFxuICAgIGFzc2V0c0RpcjogXCJhc3NldHNcIixcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgXCJ2ZW5kb3ItcmVhY3RcIjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAgICAgXCJ2ZW5kb3ItdWlcIjogW1xuICAgICAgICAgICAgXCJAaGVhZGxlc3N1aS9yZWFjdFwiLFxuICAgICAgICAgICAgXCJAaGVyb2ljb25zL3JlYWN0XCIsXG4gICAgICAgICAgICBcIkB0YWlsd2luZGNzcy9mb3Jtc1wiLFxuICAgICAgICAgICAgXCJsdWNpZGUtcmVhY3RcIixcbiAgICAgICAgICAgIFwidHctZWxlbWVudHNcIixcbiAgICAgICAgICBdLFxuICAgICAgICAgIHF1ZXJ5OiBbXCJheGlvc1wiXSxcbiAgICAgICAgICBjb21wb25lbnRzOiBbXCJyZWNoYXJ0c1wiXSxcbiAgICAgICAgfSxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6IFwiYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanNcIixcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanNcIixcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gYXNzZXRJbmZvLm5hbWUuc3BsaXQoXCIuXCIpO1xuICAgICAgICAgIGNvbnN0IGV4dCA9IGluZm9baW5mby5sZW5ndGggLSAxXTtcblxuICAgICAgICAgIGlmIChleHQgPT09IFwic3ZnXCIpIHtcbiAgICAgICAgICAgIGlmIChhc3NldEluZm8ubmFtZS5pbmNsdWRlcyhcImtlZW5pY29uc1wiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJhc3NldHMvaWNvbnMvW25hbWVdLVtoYXNoXVtleHRuYW1lXVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFwiYXNzZXRzL3N2Zy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChleHQgPT09IFwiY3NzXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBcImFzc2V0cy9jc3MvW25hbWVdLVtoYXNoXVtleHRuYW1lXVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoL1xcLihwbmd8anBlP2d8Z2lmfGljbykkLy50ZXN0KGFzc2V0SW5mby5uYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgvXFwuKHdvZmYyP3xlb3R8dHRmfG90ZikkLy50ZXN0KGFzc2V0SW5mby5uYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiYXNzZXRzL2ZvbnRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFwiYXNzZXRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1cIjtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMCxcbiAgICBtaW5pZnk6IFwiZXNidWlsZFwiLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcHJveHk6IHtcbiAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgIHRhcmdldDogbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiID8gXCJodHRwczovL21iaWNsaWNrcy5tYmlrZWRhaC5jb20ubXlcIiA6IFwiL1wiLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgIHRpbWVvdXQ6IDMwMDAwLCAgLy8gMzAgc2FhdFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBSZXF1ZXN0OicsIHJlcS5tZXRob2QsIHJlcS51cmwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlcywgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnUmVjZWl2ZWQgUmVzcG9uc2U6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGhvc3Q6IHRydWUsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBwb3J0OiAzMDAwXG4gIH0sXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVCxTQUFTLG9CQUFvQjtBQUNuVixPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxrQkFBa0I7QUFHekIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsTUFBTSxTQUFTLGdCQUFnQixNQUFNO0FBQUEsRUFDckMsS0FBSztBQUFBLElBQ0gscUJBQXFCO0FBQUEsTUFDbkIsS0FBSztBQUFBLFFBQ0gsbUJBQW1CO0FBQUEsTUFDckI7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxTQUFTLENBQUMsYUFBYSxZQUFZO0FBQUEsSUFDckM7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxZQUFZLENBQUMsT0FBTyxRQUFRLE9BQU87QUFBQSxFQUNyQztBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osZ0JBQWdCLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDckMsYUFBYTtBQUFBLFlBQ1g7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFVBQ0EsT0FBTyxDQUFDLE9BQU87QUFBQSxVQUNmLFlBQVksQ0FBQyxVQUFVO0FBQUEsUUFDekI7QUFBQSxRQUNBLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQixDQUFDLGNBQWM7QUFDN0IsZ0JBQU0sT0FBTyxVQUFVLEtBQUssTUFBTSxHQUFHO0FBQ3JDLGdCQUFNLE1BQU0sS0FBSyxLQUFLLFNBQVMsQ0FBQztBQUVoQyxjQUFJLFFBQVEsT0FBTztBQUNqQixnQkFBSSxVQUFVLEtBQUssU0FBUyxXQUFXLEdBQUc7QUFDeEMscUJBQU87QUFBQSxZQUNUO0FBQ0EsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSxRQUFRLE9BQU87QUFDakIsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSx5QkFBeUIsS0FBSyxVQUFVLElBQUksR0FBRztBQUNqRCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLDBCQUEwQixLQUFLLFVBQVUsSUFBSSxHQUFHO0FBQ2xELG1CQUFPO0FBQUEsVUFDVDtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSx1QkFBdUI7QUFBQSxJQUN2QixRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUSxTQUFTLGdCQUFnQixzQ0FBc0M7QUFBQSxRQUN2RSxjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUE7QUFBQSxRQUNULFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsZ0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxNQUFNLFNBQVM7QUFDckMsb0JBQVEsSUFBSSxlQUFlLEdBQUc7QUFBQSxVQUNoQyxDQUFDO0FBQ0QsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMsb0JBQVEsSUFBSSxvQkFBb0IsSUFBSSxRQUFRLElBQUksR0FBRztBQUFBLFVBQ3JELENBQUM7QUFDRCxnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUztBQUFBLFVBRTlDLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQSxFQUNSO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
