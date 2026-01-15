import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Solo archivos > 1KB
      deleteOriginFile: false
    }),
    // Brotli compression (mejor que gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    }),
    // Bundle analyzer (solo en build)
    process.env.ANALYZE && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    // Minificación agresiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    // Code splitting optimizado
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks separados
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'xlsx-vendor': ['xlsx'],
          'pdf-vendor': ['jspdf', 'pdfjs-dist']
        },
        // Nombres de chunks con hash para cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB
    // Source maps solo en desarrollo
    sourcemap: process.env.NODE_ENV === 'development'
  },
  // Optimizaciones de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/auth']
  }
})
