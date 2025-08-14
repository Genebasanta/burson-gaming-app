/*
  Este es el archivo 'vite.config.js'.
  Debes crearlo en la raíz de tu proyecto.
  Es la configuración para Vite, el compilador que usará Vercel para construir tu aplicación.
*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
