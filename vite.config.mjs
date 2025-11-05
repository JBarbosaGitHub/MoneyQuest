import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'swiper': ['swiper']
        }
      }
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets < 4kb as base64
    cssCodeSplit: true,
    sourcemap: false, // Disable sourcemaps for production
    chunkSizeWarningLimit: 1000
  },
  publicDir: 'public',
  server: {
    port: 5173
  }
})
