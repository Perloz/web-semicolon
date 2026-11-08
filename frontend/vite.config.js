import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000, // Standard React dev server port
    host: '0.0.0.0', // Allow access from network
    open: false, // Don't auto-open browser on start
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // Proxy all backend routes
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/posts': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  }
})
