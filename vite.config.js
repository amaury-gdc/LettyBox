import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages sert depuis /LettyBox/ en prod, / en local
  base: process.env.NODE_ENV === 'production' ? '/LettyBox/' : '/',
})
