import { Router, type Request, type Response } from 'express'
import { requireAuth } from '../lib/auth.js'
import multer from 'multer'
import dbConnect from '../lib/db.js'
import Video from '../models/Video.js'
import Profile from '../models/Profile.js'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import { cloudinary } from '../lib/cloudinary.js'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath)
}

const router = Router()

// Helper to process local video
const processLocalVideo = (filePath: string, outputDir: string): Promise<{ duration: number; thumbnailFilename: string }> => {
  return new Promise((resolve) => {
    let duration = 0
    const thumbnailFilename = `thumb-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`
    
    ffmpeg(filePath)
      .on('codecData', (data) => {
        // data.duration format: "00:00:10.50"
        if (data.duration) {
          const parts = data.duration.split(':')
          if (parts.length === 3) {
            duration = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
          }
        }
      })
      .on('end', () => {
        resolve({ duration, thumbnailFilename })
      })
      .on('error', (err) => {
        console.error('FFmpeg processing error:', err)
        resolve({ duration: 0, thumbnailFilename: '' })
      })
      .screenshots({
        count: 1,
        timestamps: ['20%'],
        filename: thumbnailFilename,
        folder: outputDir,
        size: '640x360'
      })
  })
}



// Configure Storage
let storage: multer.StorageEngine

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
)

if (hasCloudinaryConfig) {
  const { storage: cloudinaryStorage } = await import('../lib/cloudinary.js')
  if (cloudinaryStorage) {
    storage = cloudinaryStorage
    console.log('✅ Cloudinary Storage Enabled')
  }
}

if (!storage) {
  console.log('⚠️ Cloudinary keys missing. Using local storage (videos might not play if not MP4).')
  const uploadDir = path.resolve('uploads')
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true })
    } catch (err) {
      console.error('Failed to create uploads directory:', err)
    }
  }

  storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, uploadDir)
    },
    filename(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = path.extname(file.originalname)
      cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    },
  })
}

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 * 1024, // 50GB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true)
      } else {
        cb(null, false)
      }
    } else if (file.fieldname === 'thumbnail') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true)
      } else {
        cb(null, false)
      }
    } else {
      cb(null, true)
    }
  }
})

router.use(requireAuth)

router.post('/upload-signature', (req: Request, res: Response) => {
  if (!hasCloudinaryConfig) {
    res.json({ mode: 'local' })
    return
  }
  const timestamp = Math.round(new Date().getTime() / 1000)
  const folder = '3play-uploads'
  const signature = cloudinary.utils.api_sign_request({
    timestamp,
    folder
  }, process.env.CLOUDINARY_API_SECRET)
  
  res.json({ 
    mode: 'cloud',
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  })
})

router.post('/upload', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
  
  if (!files || (!files['file'] && !files['thumbnail'])) {
    res.status(400).json({ success: false, error: 'No file or thumbnail uploaded' })
    return
  }
  
  let url = ''
  let thumbnailUrl = ''
  let duration = 0

  if (hasCloudinaryConfig) {
    // Cloudinary Logic
    if (files['file']?.[0]) {
      const file = files['file'][0]
      url = file.path
      const fileData = file as Partial<{ duration: number }>
      
      // Default thumbnail from video
      thumbnailUrl = url
      if (file.mimetype.startsWith('video/')) {
         const lastDot = url.lastIndexOf('.')
         if (lastDot !== -1) {
           thumbnailUrl = url.substring(0, lastDot) + '.jpg'
         } else {
           thumbnailUrl = url + '.jpg'
         }
         if (typeof fileData.duration === 'number') {
           duration = fileData.duration
         }
      }
    }
    
    // If custom thumbnail is provided, override it
    if (files['thumbnail']?.[0]) {
        thumbnailUrl = files['thumbnail'][0].path
    }
  } else {
    // Local Logic
    if (files['file']?.[0]) {
        const file = files['file'][0]
        url = `/uploads/${file.filename}`
        
        // Generate metadata & thumbnail
        try {
            const { duration: d, thumbnailFilename } = await processLocalVideo(file.path, path.dirname(file.path))
            duration = d
            if (thumbnailFilename) {
                thumbnailUrl = `/uploads/${thumbnailFilename}`
            }
        } catch (e) {
            console.error('Video processing failed', e)
        }
    }
    
    if (files['thumbnail']?.[0]) {
        thumbnailUrl = `/uploads/${files['thumbnail'][0].filename}`
    }
  }

  res.status(200).json({ success: true, url, thumbnailUrl, duration })
})

router.get('/me', async (req: Request, res: Response) => {
  const db = await dbConnect()
  if (!db) {
    res.status(500).json({ success: false, error: 'Chybí konfigurace databáze (MONGODB_URI)' })
    return
  }
  const auth = (req as Request & { auth: { sub: string; handle: string } }).auth
  // auth.sub is user.id. We need to find profile by user handle or link.
  // In our model, User.handle == Profile.handle.
  const channel = await Profile.findOne({ handle: auth.handle })
  res.status(200).json({ success: true, channel })
})

router.patch('/channel', async (req: Request, res: Response) => {
  const db = await dbConnect()
  if (!db) {
    res.status(500).json({ success: false, error: 'Chybí konfigurace databáze (MONGODB_URI)' })
    return
  }
  const auth = (req as Request & { auth: { handle: string } }).auth
  
  const { displayName, bio, avatarUrl, bannerUrl, phone } = (req.body || {}) as {
    displayName?: string
    bio?: string
    avatarUrl?: string
    bannerUrl?: string
    phone?: string
  }

  if (displayName && displayName.trim().length < 2) {
    res.status(400).json({ success: false, error: 'Display name is too short' })
    return
  }

  const channel = await Profile.findOneAndUpdate(
    { handle: auth.handle },
    { 
      $set: {
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(phone !== undefined && { phone }),
      }
    },
    { new: true }
  )

  if (!channel) {
    res.status(404).json({ success: false, error: 'Channel not found' })
    return
  }

  res.status(200).json({ success: true, channel })
})

router.get('/videos', async (req: Request, res: Response) => {
  const db = await dbConnect()
  if (!db) {
    res.status(500).json({ success: false, error: 'Chybí konfigurace databáze (MONGODB_URI)' })
    return
  }
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = await Profile.findOne({ handle: auth.handle })
  
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  let list = await Video.find({ ownerId: channel.id })
  list = list.sort((a, b) => {
    const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
    const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
    return tb - ta
  })
  res.status(200).json({ success: true, items: list })
})

router.post('/videos', async (req: Request, res: Response) => {
  const db = await dbConnect()
  if (!db) {
    res.status(500).json({ success: false, error: 'Chybí konfigurace databáze (MONGODB_URI)' })
    return
  }
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = await Profile.findOne({ handle: auth.handle })
  
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  const { title, description, sourceUrl, thumbnailUrl, duration, type, embedCode, tags, category } = (req.body || {}) as {
    title?: string
    description?: string
    sourceUrl?: string
    thumbnailUrl?: string
    duration?: number
    type?: 'video' | 'movie' | 'episode'
    embedCode?: string
    tags?: string[]
    category?: string
  }

  // Allow either file upload (sourceUrl) or embedCode
  if (!embedCode && (!sourceUrl || sourceUrl.trim().length === 0)) {
     // If both are missing, it's an error
     res.status(400).json({ success: false, error: 'Source URL or Embed Code is required' })
     return
  }

  if (!title || title.trim().length < 1) {
    res.status(400).json({ success: false, error: 'Title is required' })
    return
  }

  const id = `v-${crypto.randomBytes(3).toString('hex')}`
  
  const draft = await Video.create({
    id,
    ownerId: channel.id,
    title: title.trim(),
    description: description || '',
    type: type || 'video',
    visibility: 'draft',
    status: 'ready',
    thumbnailUrl: thumbnailUrl || '',
    sourceUrl: sourceUrl || '', // Can be empty if embedCode is present
    embedCode: embedCode || '',
    durationSeconds: duration || 0,
    tags: tags || [],
    category: category || 'People & Blogs',
    views: 0,
    likes: 0,
    dislikes: 0,
    publishedAt: null,
  })

  res.status(200).json({ success: true, video: draft })
})

router.patch('/videos/:videoId', async (req: Request, res: Response) => {
  const db = await dbConnect()
  if (!db) {
    res.status(500).json({ success: false, error: 'Chybí konfigurace databáze (MONGODB_URI)' })
    return
  }
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = await Profile.findOne({ handle: auth.handle })
  
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  const { videoId } = req.params
  const v = await Video.findOne({ id: videoId })
  
  if (!v || v.ownerId !== channel.id) {
    res.status(404).json({ success: false, error: 'Video not found' })
    return
  }

  const { title, description, visibility, thumbnailUrl, tags, category } = (req.body || {}) as {
    title?: string
    description?: string
    visibility?: 'draft' | 'unlisted' | 'published'
    thumbnailUrl?: string
    tags?: string[]
    category?: string
  }

  if (typeof title === 'string') v.title = title
  if (typeof description === 'string') v.description = description
  if (typeof thumbnailUrl === 'string') v.thumbnailUrl = thumbnailUrl
  if (Array.isArray(tags)) v.tags = tags
  if (typeof category === 'string') v.category = category
  if (visibility === 'draft' || visibility === 'unlisted' || visibility === 'published') {
    v.visibility = visibility
    if (visibility === 'published' && !v.publishedAt) v.publishedAt = new Date()
  }
  
  await v.save()
  res.status(200).json({ success: true, video: v })
})

router.post('/videos/:videoId/publish', async (req: Request, res: Response) => {
  const db = await dbConnect()
  if (!db) {
    res.status(500).json({ success: false, error: 'Chybí konfigurace databáze (MONGODB_URI)' })
    return
  }
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = await Profile.findOne({ handle: auth.handle })
  
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  const { videoId } = req.params
  const v = await Video.findOne({ id: videoId })
  
  if (!v || v.ownerId !== channel.id) {
    res.status(404).json({ success: false, error: 'Video not found' })
    return
  }

  
  // We don't really have "processing" status with Cloudinary direct upload in this flow,
  // but if we did, check here.
  
  v.visibility = 'published'
  if (!v.publishedAt) v.publishedAt = new Date()
  
  await v.save()
  res.status(200).json({ success: true, video: v })
})

export default router
