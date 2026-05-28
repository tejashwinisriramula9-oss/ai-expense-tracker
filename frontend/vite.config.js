import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    // Warn only above 1 MB — our bundle is ~580 KB which is fine
    chunkSizeWarningLimit: 1000,
  },
})
