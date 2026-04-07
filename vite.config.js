import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],

    server: {
      proxy: {
        // Redirige /v1.0/* al backend para evitar CORS preflight en desarrollo.
        // La URL del backend se lee desde VITE_API_URL en el .env
        '/v1.0': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },

    assetsInclude: ['**/*.mp4', '**/*.webm', '**/*.mov'],

    build: {
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (
              assetInfo.name.endsWith('.mp4') ||
              assetInfo.name.endsWith('.webm') ||
              assetInfo.name.endsWith('.mov')
            ) {
              return 'assets/videos/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    },
  }
})
