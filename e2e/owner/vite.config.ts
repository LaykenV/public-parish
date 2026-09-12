import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const mock = fileURLToPath(new URL('./mock.ts', import.meta.url))
export default defineConfig({
  plugins: [
    {
      name: 'owner-fixture-hooks',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'convex/react' || id.endsWith('/auth/google-auth'))
          return mock
      },
    },
    {
      name: 'owner-fixture-html',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.startsWith('/operations/'))
            req.url = '/e2e/owner/index.html'
          next()
        })
      },
    },
    react(),
    tailwindcss(),
  ],
})
