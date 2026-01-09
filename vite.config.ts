import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // Brotli compression for even smaller files
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    // Gzip compression as fallback
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable build optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2, // Multiple passes for better compression
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // More granular chunking for better caching
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Motion library (large)
            if (id.includes('motion')) {
              return 'motion-vendor';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            // Stripe
            if (id.includes('stripe')) {
              return 'stripe';
            }
            // Supabase
            if (id.includes('supabase')) {
              return 'supabase';
            }
            // Lucide icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Other vendors
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for smaller bundles
    target: 'es2015',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Reduce chunk size
    cssMinify: true,
  },
  // Ensure public folder assets are copied
  publicDir: 'public',
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
  },
})
