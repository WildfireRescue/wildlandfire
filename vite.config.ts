import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

/**
 * Vite Configuration
 * Production SPA builds with blog prerendering support
 * 
 * Build Pipeline:
 * 1. prebuild: Generate sitemap & RSS feed
 * 2. vite build: Bundle SPA + create dist/index.html template
 * 3. postbuild: Use JSom + Supabase to prerender /blog and /blog/:slug
 * 
 * Result: Static HTML files for blog routes (SEO-friendly)
 *         SPA for all other routes (fast, interactive)
 */

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

/**
 * PRERENDERING STRATEGY
 * 
 * The vite.config.ts builds a traditional SPA where every route returns index.html.
 * After the build completes, the postbuild script (npm run postbuild) takes over:
 * 
 * What postbuild does:
 * 1. Reads the compiled dist/index.html (SPA shell)
 * 2. Fetches all published blog posts from Supabase
 * 3. For each blog post, uses JSDOM to inject SEO meta tags:
 *    - <title> from meta_title_final
 *    - meta description from meta_description_final
 *    - og:image/width/height/type tags
 *    - twitter:card tags
 *    - canonical URL
 *    - robots directives
 *    - JSON-LD BlogPosting schema with mainEntityOfPage
 * 4. Writes static HTML files:
 *    - dist/blog/index.html (blog listing page)
 *    - dist/blog/[slug]/index.html (individual blog posts)
 * 
 * Result:
 * - Search engines crawl static HTML with correct meta tags ✓
 * - Social media scrapers see correct OG/Twitter tags ✓
 * - All other routes still use SPA (fast, interactive) ✓
 * 
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous/public anon key
 * 
 * These should be set in:
 * - Development: .env.local
 * - Netlify Production: Site settings → Environment variables
 * 
 * See: POSTS_SEO_INTEGRATION.md for data model details
 * See: netlify.toml for build configuration
 */

