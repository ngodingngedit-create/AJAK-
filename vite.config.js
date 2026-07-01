// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [vue()],
// })

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://45.76.182.72',
        changeOrigin: true,
        secure: false,
        headers: {
          Host: 'api.kolektix.com'
        }
      }
    }
  },

  preview: {
    host: "0.0.0.0",
    port: 3080,
    allowedHosts: ["ajaks.id", "www.ajaks.id"],
  },
});