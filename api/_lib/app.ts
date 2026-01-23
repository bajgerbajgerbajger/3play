/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import videoRoutes from './routes/videos.js'
import channelRoutes from './routes/channels.js'
import studioRoutes from './routes/studio.js'
import subscriptionRoutes from './routes/subscriptions.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config({ path: path.join(__dirname, '../../.env.local') })
dotenv.config()

const app: express.Application = express()

// General Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)
app.use(compression())
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors())
app.use(express.json({ limit: '500mb' }))
app.use(express.urlencoded({ extended: true, limit: '500mb' }))
app.use('/uploads', express.static(path.resolve('uploads')))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/channels', channelRoutes)
app.use('/api/studio', studioRoutes)
app.use('/api/subscriptions', subscriptionRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response): void => {
    // Add DB check if possible
    res.status(200).json({
      success: true,
      message: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  void next
  if (process.env.NODE_ENV !== 'production') {
    console.error(error)
  }
  res.status(500).json({
    success: false,
    error: 'Server internal error',
    details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
  })
})

/**
 * Serve frontend in production
 */
const distPath = path.join(__dirname, '../../dist')
if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ success: false, error: 'API not found' })
      return
    }
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  /**
   * 404 handler for API
   */
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'API not found',
    })
  })
}

export default app
