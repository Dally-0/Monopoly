import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- ESTO ES LA CLAVE DE TAILWIND 4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- AQUÍ SE INVOCA EL PLUGIN
  ],
})