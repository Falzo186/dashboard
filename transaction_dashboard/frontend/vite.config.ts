// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react() as any],
  
  // Configuración de paths absolutos para imports con @/
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: 'localhost',
    open: true, // Abre automáticamente el navegador
    cors: true,
    // Proxy para el backend (opcional, ya tenemos CORS configurado)
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Configuración para build de producción
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          router: ['react-router-dom'],
          nivo: ['@nivo/core', '@nivo/bar', '@nivo/pie', '@nivo/line'],
        },
      },
    },
  },
  
  // Variables de entorno
  envPrefix: 'VITE_',
  
  // Configuración de CSS
  css: {
    devSourcemap: true,
  },
}
    )