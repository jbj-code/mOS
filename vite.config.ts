// vite.config.ts
// Vite build configuration for the mOS PWA (React, Tailwind, GitHub Pages base path).

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/mOS/',
  plugins: [react(), tailwindcss()],
})
