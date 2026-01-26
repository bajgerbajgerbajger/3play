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
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
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
