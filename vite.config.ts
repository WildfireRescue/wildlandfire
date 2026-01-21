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
      threshold: 512, // Compress smaller files for mobile
      deleteOriginFile: false,
    }),
    // Gzip compression as fallback
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 512,
      deleteOriginFile: false,
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    // Enable build optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3, // More passes for better compression
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        dead_code: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        unused: true,
        toplevel: true,
        side_effects: true,
      },
      format: {
        comments: false, // Remove all comments
      },
      mangle: {
        safari10: true, // Better mobile compatibility
        toplevel: true,
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Aggressive code splitting for mobile performance
          if (id.includes('node_modules')) {
            // React core - critical path
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
              return 'react-core';
            }
            // Motion library - defer loading
            if (id.includes('motion') || id.includes('framer')) {
              return 'motion';
            }
            // Radix UI - load on demand
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            // Stripe - async only
            if (id.includes('@stripe') || id.includes('stripe')) {
              return 'payment';
            }
            // Supabase - async only
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'db';
            }
            // Icons - separate
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Router - critical
            if (id.includes('react-router')) {
              return 'router';
            }
            // All other vendor code
            return 'vendor';
          }
        },
        // Optimize chunk names for long-term caching
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          // Better asset organization
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'img/[name].[hash][extname]';
          } else if (/woff2?|ttf|eot/i.test(ext)) {
            return 'fonts/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
      },
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Mobile-optimized settings
    chunkSizeWarningLimit: 500, // Stricter limit
    target: 'es2015',
    cssCodeSplit: true,
    cssMinify: true,
    // Enable source maps for debugging but keep them separate
    sourcemap: false,
    reportCompressedSize: false, // Faster builds
  },
  // Ensure public folder assets are copied
  publicDir: 'public',
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
  },
})
