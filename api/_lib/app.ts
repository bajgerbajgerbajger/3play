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
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import videoRoutes from './routes/videos.js'
import channelRoutes from './routes/channels.js'
import studioRoutes from './routes/studio.js'
import subscriptionRoutes from './routes/subscriptions.js'
import notificationRoutes from './routes/notifications.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config({ path: path.join(__dirname, '../../.env.local') })
dotenv.config()

const app: express.Application = express()

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false, // Disable COEP to allow cross-origin resources
  crossOriginOpenerPolicy: false, // Disable COOP to allow cross-origin windows
  xFrameOptions: false, // Disable X-Frame-Options to allow embedding anywhere
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"], 
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "data:", "https:", "http:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:", "*"],
      mediaSrc: ["'self'", "data:", "blob:", "https:", "http:", "*"],
      fontSrc: ["'self'", "data:", "https:", "http:"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      frameSrc: ["*"], // Allow frames from any source (for embeds)
      frameAncestors: ["*"], // Allow 3Play to be embedded anywhere
      connectSrc: ["'self'", "https:", "http:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null, // Allow mixed content for HTTP embeds
    },
  },
}))
app.use(cors({
  origin: true, // Reflect request origin
  credentials: true, // Allow cookies
}))
app.use(express.json({ limit: '50gb' }))
app.use(express.urlencoded({ extended: true, limit: '50gb' }))
app.use('/uploads', express.static(path.resolve('uploads')))

// Serve frontend static files
const distPath = path.join(__dirname, '../../dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/channels', channelRoutes)
app.use('/api/studio', studioRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/notifications', notificationRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error Handler]:', error)
  
  if (res.headersSent) {
    return next(error)
  }

  res.status(500).json({
    success: false,
    error: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  })
})

/**
 * SPA Fallback & 404 handler
 */
app.use((req: Request, res: Response) => {
  // API 404
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      error: 'API not found',
    })
    return
  }

  // SPA Fallback
  const indexFile = path.join(distPath, 'index.html')
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile)
  } else {
    res.status(404).send('Not Found')
  }
})

export default app
