import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ESM config with plugin-react for Fast Refresh and JSX support.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
