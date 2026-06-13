import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to print backend landing page link in the Vite terminal output
const printBackendLink = () => ({
  name: 'print-backend-link',
  configureServer(server) {
    server.httpServer?.once('listening', () => {
      setTimeout(() => {
        console.log(`\n  🚀 \x1b[32mLanding Page & Server:\x1b[0m \x1b[36m\x1b[4mhttp://localhost:5001\x1b[0m\n`);
      }, 100);
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), printBackendLink()],
})


