import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { existsSync } from 'fs'
import { generateRoutes } from './routes/generate'
import { workflowRoutes } from './routes/workflows'
import { uploadRoutes } from './routes/upload'

const PORT = process.env.PORT ?? 3000
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

/**
 * Create and configure the Elysia server instance.
 */
function createApp() {
  let server = new Elysia()
    // Enable CORS for development
    .use(cors())

  // Serve static files from dist/client in production only
  if (IS_PRODUCTION && existsSync('dist/client')) {
    server = server.use(
      staticPlugin({
        assets: 'dist/client',
        prefix: '/',
      })
    )
  }

  return server
    // Health check endpoint
    .get('/api/health', () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }))

    // Mount route groups
    .use(generateRoutes)
    .use(workflowRoutes)
    .use(uploadRoutes)

    // Error handling
    .onError(({ error, code }) => {
      console.error(`[${code}]`, error)

      if (code === 'NOT_FOUND') {
        return {
          error: 'Not found',
          message: 'The requested resource was not found',
        }
      }

      const errorMessage = error instanceof Error ? error.message : String(error)

      return {
        error: 'Internal server error',
        message: errorMessage,
      }
    })

    // Start server
    .listen(PORT)
}

const app = createApp()

console.log(`🍌 NanoNodeBanana server running at http://localhost:${PORT}`)

// Export app for potential testing/extension use
export { app }
export type App = typeof app
