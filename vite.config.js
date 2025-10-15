/*
============================================================================
FILE: vite.config.js
============================================================================
PURPOSE:
  Vite configuration for the EagleAI React application. Sets up the build
  tool with React plugin and development server configuration.

FEATURES:
  - React plugin for JSX support
  - Development server configuration
  - Build optimization settings
  - Path resolution for clean imports
============================================================================
*/

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    host: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  }
})

