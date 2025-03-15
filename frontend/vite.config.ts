import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['@radix-ui/react-slot', '@radix-ui/react-select', '@radix-ui/react-dialog'],
    include: ['plotly.js-dist']
  },
  build: {
    commonjsOptions: {
      include: [/plotly\.js-dist/, /node_modules/],
    },
  },
  server: {
    port: 5174,
    host: true
  }
})
