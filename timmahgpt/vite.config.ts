import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to work in the browser for this specific setup
    'process.env.API_KEY': JSON.stringify("AIzaSyDZGUC69SQQBn09PYAzB_8b_GborQ280n4")
  }
})