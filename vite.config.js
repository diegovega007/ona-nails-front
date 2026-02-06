import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.mp4', '**/*.webm', '**/*.mov'],
  build: {
    assetsInlineLimit: 0, // No hacer inline de archivos grandes como videos
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Mantener videos en su propia carpeta
          if (assetInfo.name.endsWith('.mp4') || 
              assetInfo.name.endsWith('.webm') || 
              assetInfo.name.endsWith('.mov')) {
            return 'assets/videos/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
})
