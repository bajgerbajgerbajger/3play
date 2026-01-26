import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = env.PORT || '3001'

  return {
    plugins: [
      react({
        babel: {
          plugins: mode === 'development' ? ['react-dev-locator'] : [],
        },
      }),
      tsconfigPaths(),
      VitePWA({
        registerType: 'autoUpdate',
        manifestFilename: 'manifest.json',
        includeAssets: [
          'favicons/favicon.ico',
          'favicons/favicon-16x16.png',
          'favicons/favicon-32x32.png',
          'favicons/apple-touch-icon.png',
          'favicons/android-chrome-192x192.png',
          'favicons/android-chrome-512x512.png',
        ],
        manifest: {
          name: '3Play',
          short_name: '3Play',
          start_url: '/',
          display: 'standalone',
          background_color: '#0B0B0D',
          theme_color: '#0B0B0D',
          icons: [
            {
              src: '/favicons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/favicons/favicon-256x256.png',
              sizes: '256x256',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/favicons/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: `http://localhost:${PORT}`,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react-vendor';
              }
              if (id.includes('framer-motion') || id.includes('lucide-react')) {
                return 'ui-vendor';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  }
})
