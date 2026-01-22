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

const router = Router()

// Configure Storage
let storage: multer.StorageEngine

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  // Use Cloudinary
  const { storage: cloudinaryStorage } = await import('../lib/cloudinary.js')
  storage = cloudinaryStorage
} else {
  // Use Local Storage
  const uploadDir = path.resolve('uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(file.originalname)
      cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
  })
}

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 500 // 500MB
  }
})

router.use(requireAuth)

router.post('/upload-signature', (req: Request, res: Response) => {
  if (!process.env.CLOUDINARY_API_SECRET) {
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

router.post('/upload', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
  
  if (!files || (!files['file'] && !files['thumbnail'])) {
    res.status(400).json({ success: false, error: 'No file or thumbnail uploaded' })
    return
  }
  
  let url = ''
  let thumbnailUrl = ''
  let duration = 0

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    // Cloudinary Logic
    if (files['file']?.[0]) {
      const file = files['file'][0]
      url = file.path
      const fileData = file as any
      
      // Default thumbnail from video
      thumbnailUrl = url
      if (file.mimetype.startsWith('video/')) {
         const lastDot = url.lastIndexOf('.')
         if (lastDot !== -1) {
           thumbnailUrl = url.substring(0, lastDot) + '.jpg'
         } else {
           thumbnailUrl = url + '.jpg'
         }
         if (fileData.duration) {
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
        thumbnailUrl = url // Default fallback
    }
    
    if (files['thumbnail']?.[0]) {
        thumbnailUrl = `/uploads/${files['thumbnail'][0].filename}`
    }
  }

  res.status(200).json({ success: true, url, thumbnailUrl, duration })
})

router.get('/me', async (req: Request, res: Response) => {
  await dbConnect()
  const auth = (req as Request & { auth: { sub: string; handle: string } }).auth
  // auth.sub is user.id. We need to find profile by user handle or link.
  // In our model, User.handle == Profile.handle.
  const channel = await Profile.findOne({ handle: auth.handle })
  res.status(200).json({ success: true, channel })
})

router.patch('/channel', async (req: Request, res: Response) => {
  await dbConnect()
  const auth = (req as Request & { auth: { handle: string } }).auth
  
  const { displayName, bio, avatarUrl, bannerUrl } = (req.body || {}) as {
    displayName?: string
    bio?: string
    avatarUrl?: string
    bannerUrl?: string
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
        ...(avatarUrl && { avatarUrl }),
        ...(bannerUrl && { bannerUrl }),
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
  await dbConnect()
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
  await dbConnect()
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = await Profile.findOne({ handle: auth.handle })
  
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  const { title, description, sourceUrl, thumbnailUrl, duration, type, embedCode } = (req.body || {}) as {
    title?: string
    description?: string
    sourceUrl?: string
    thumbnailUrl?: string
    duration?: number
    type?: 'video' | 'movie' | 'episode'
    embedCode?: string
  }

  if (!title || title.trim().length < 3) {
    res.status(400).json({ success: false, error: 'Title is required' })
    return
  }

  const id = `v-${crypto.randomBytes(3).toString('hex')}`
  const now = new Date().toISOString()
  
  const draft = await Video.create({
    id,
    ownerId: channel.id,
    title: title.trim(),
    description: description || '',
    type: type || 'video',
    visibility: 'draft',
    status: 'ready',
    thumbnailUrl: thumbnailUrl || '',
    sourceUrl: sourceUrl || '',
    embedCode: embedCode || '',
    durationSeconds: duration || 0,
    views: 0,
    likes: 0,
    dislikes: 0,
    publishedAt: null,
  })

  res.status(200).json({ success: true, video: draft })
})

router.patch('/videos/:videoId', async (req: Request, res: Response) => {
  await dbConnect()
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

  const { title, description, visibility, thumbnailUrl } = (req.body || {}) as {
    title?: string
    description?: string
    visibility?: 'draft' | 'unlisted' | 'published'
    thumbnailUrl?: string
  }

  if (typeof title === 'string') v.title = title
  if (typeof description === 'string') v.description = description
  if (typeof thumbnailUrl === 'string') v.thumbnailUrl = thumbnailUrl
  if (visibility === 'draft' || visibility === 'unlisted' || visibility === 'published') {
    v.visibility = visibility
    if (visibility === 'published' && !v.publishedAt) v.publishedAt = new Date()
  }
  
  await v.save()
  res.status(200).json({ success: true, video: v })
})

router.post('/videos/:videoId/publish', async (req: Request, res: Response) => {
  await dbConnect()
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

router.patch('/channel', async (req: Request, res: Response) => {
  await dbConnect()
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = await Profile.findOne({ handle: auth.handle })
  
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  const { displayName, bio, bannerUrl, avatarUrl } = (req.body || {}) as {
    displayName?: string
    bio?: string
    bannerUrl?: string
    avatarUrl?: string
  }

  if (typeof displayName === 'string') channel.displayName = displayName
  if (typeof bio === 'string') channel.bio = bio
  if (typeof bannerUrl === 'string') channel.bannerUrl = bannerUrl
  if (typeof avatarUrl === 'string') channel.avatarUrl = avatarUrl
  
  await channel.save()
  res.status(200).json({ success: true, channel })
})

export default router
