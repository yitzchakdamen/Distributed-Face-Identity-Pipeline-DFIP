import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Use dev HTML file for development to avoid CSP issues
  const htmlInput = mode === 'development' ? './index.dev.html' : './index.html';
  
  return {
    plugins: [react()],
    assetsInclude: ['**/*.svg'],
    
    // Use different HTML files for dev and production
    ...(mode === 'development' && {
      define: {
        __DEV_MODE__: true
      }
    }),
    
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },
    
    preview: {
      allowedHosts: true
    },
    
    build: {
      assetsDir: 'assets',
      copyPublicDir: true,
      
      // SEO and Performance Optimizations
      sourcemap: true,
      
      // Minimize bundle size
      minify: 'esbuild', // Use esbuild instead of terser for better compatibility
      
      // Optimize chunk splitting for better caching
      rollupOptions: {
        input: htmlInput,
        output: {
          manualChunks: {
            // Vendor chunk for React and related libraries
            vendor: ['react', 'react-dom', 'react-router-dom'],
            
            // Services chunk for API calls
            services: ['./src/services/api.tsx', './src/services/authService.tsx']
          }
        }
      }
    },
    
    define: {
      __API_URL__: JSON.stringify(mode === 'production' ? 'https://api.facealert.live' : 'http://localhost:3000'),
      __APP_VERSION__: JSON.stringify('1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    },
    
    // Optimize dependencies for better performance
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['@vite/client', '@vite/env']
    }
  };
});
