import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['76bc08aa537d.ngrok-free.app'], // Agrega el host público aquí
  },
})
