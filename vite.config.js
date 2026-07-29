import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Mounts the Vercel serverless functions during local dev, so the chatbot and
// the contact form's email verification work under `npm run dev` exactly as
// they do in production.
const API_ROUTES = ['chat', 'otp']

function localApiRoutes(env) {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      for (const route of API_ROUTES) {
        server.middlewares.use(`/api/${route}`, async (req, res) => {
          // .env.local reaches the handlers the same way Vercel's project
          // environment does — through process.env.
          for (const [key, value] of Object.entries(env)) {
            if (process.env[key] === undefined) process.env[key] = value
          }
          const { default: handler } = await server.ssrLoadModule(`/api/${route}.js`)
          handler(req, res)
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localApiRoutes(env)],
    // Honour PORT when something else assigns one (tooling, a second dev
    // server); otherwise Vite's usual 5173.
    server: { port: Number(process.env.PORT) || 5173 },
  }
})
