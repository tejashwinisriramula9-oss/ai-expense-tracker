import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    // Split vendor chunks to reduce peak memory during build
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor':  ['chart.js', 'react-chartjs-2'],
          'motion-vendor': ['framer-motion'],
          'ui-vendor':     ['react-hot-toast', 'react-csv', 'axios'],
        },
      },
    },
  },
})
