import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy /api/* to your backend during development.
      // Change the target to wherever your backend runs.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
        // Uncomment to strip the /api prefix before forwarding:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
