import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Não precisa mais de um arquivo postcss.config.js!
// A configuração está toda aqui.

export default defineConfig({
  plugins: [react()],
  
  // Adicione esta seção 'css'
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },

  // Adicione esta seção 'resolve' para caminhos mais limpos
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
