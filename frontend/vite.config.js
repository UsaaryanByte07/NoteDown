import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Instead of writing http://localhost:3010/api/... in every fetch call,
      // Vite will forward any /api request to Express automatically.
      '/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
      },
      // Also proxy /uploads so images served by Express work in React dev
      '/uploads': {
        target: 'http://localhost:3010',
        changeOrigin: true,
      },
    },
  },
})
