import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true, // This can help in WSL but might increase CPU usage
    },
    hmr: {
      // These might be needed if accessing from Windows browser to WSL server
      // protocol: 'ws',
      // host: 'localhost', 
    }
  }
})
