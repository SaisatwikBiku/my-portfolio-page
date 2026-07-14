import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Mounts the Vercel serverless function at /api/chat during local dev, so the
// chatbot works under `npm run dev` exactly as it does in production.
function localApiRoutes(env) {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (!process.env.GEMINI_API_KEY && env.GEMINI_API_KEY) {
          process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
        }
        const { default: handler } = await server.ssrLoadModule('/api/chat.js')
        handler(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localApiRoutes(env)],
  }
})
