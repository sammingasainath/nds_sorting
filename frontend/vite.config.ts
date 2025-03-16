import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
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
      // Reduce build strictness for Docker deployment
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // Changed to false to keep console logs
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      commonjsOptions: {
        include: [/plotly\.js-dist/, /node_modules/],
      },
    },
    server: {
      port: 5174,
      host: true
    },
    define: {
      // Ensure environment variables are exposed
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      __VITE_API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL),
    },
  }
})
