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
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})

