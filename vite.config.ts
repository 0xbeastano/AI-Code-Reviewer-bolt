import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    chunkSizeWarningLimit: 3000, // Increased for large editor bundle
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion', 'react-hot-toast'],
          editor: ['@monaco-editor/react', 'monaco-editor'],
          charts: ['recharts'],
          utils: ['lodash-es', 'date-fns', 'nanoid'],
          auth: ['@supabase/supabase-js'],
          ai: ['@anthropic-ai/sdk', 'openai'],
          analysis: ['@babel/parser', '@babel/traverse', 'acorn', 'esprima'],
        },
      },
    },
  },
  // Optimize dependencies for faster builds
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'framer-motion',
      '@monaco-editor/react'
    ]
  },
  // Improve development experience
  esbuild: {
    // Remove console statements in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});