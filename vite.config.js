import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', 
      includeAssets: ['icon.png'],
      manifest: {
        name: 'AutoDuty GH',
        short_name: 'AutoDuty',
        theme_color: '#064e3b', 
        background_color: '#ffffff',
        display: 'standalone', 
        start_url: '/', // Tells the app where to open
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable' // Crucial for Android!
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Crucial for Android!
          }
        ]
      }
    })
  ]
})