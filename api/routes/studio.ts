import { Router, type Request, type Response } from 'express'
import { requireAuth } from '../lib/auth.js'
import multer from 'multer'
import { storage } from '../lib/cloudinary.js'
import dbConnect from '../lib/db.js'
import Video from '../models/Video.js'
import Profile from '../models/Profile.js'
import crypto from 'crypto'

const router = Router()
const upload = multer({ storage })

router.use(requireAuth)

router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' })
    return
  }
  
  // Cloudinary storage puts the URL in path
  const url = req.file.path
  // For videos, Cloudinary response might be in req.file (casted to any)
  const fileData = req.file as any
  
  let thumbnailUrl = url
  let duration = 0

  if (req.file.mimetype.startsWith('video/')) {
    // Cloudinary automatically generates thumbnails for videos by changing extension to .jpg
    // But the url might be .mp4.
    // Example: https://res.cloudinary.com/.../video/upload/.../video.mp4
    // Thumbnail: https://res.cloudinary.com/.../video/upload/.../video.jpg
    
    // Also, if resource_type is video, we can try to derive thumbnail
    const lastDot = url.lastIndexOf('.')
    if (lastDot !== -1) {
      thumbnailUrl = url.substring(0, lastDot) + '.jpg'
    } else {
      thumbnailUrl = url + '.jpg'
    }
    
    // duration might be available in fileData if Cloudinary returned it
    if (fileData.duration) {
      duration = fileData.duration
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

router.get('/videos', async (req: Request, res: Response) => {
  await dbConnect()
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = await Profile.findOne({ handle: auth.handle })
  
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  const list = await Video.find({ ownerId: channel.id }).sort({ updatedAt: -1 })
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

  const { title, description, sourceUrl, thumbnailUrl, duration } = (req.body || {}) as {
    title?: string
    description?: string
    sourceUrl?: string
    thumbnailUrl?: string
    duration?: number
  }

  if (!title || title.trim().length < 3) {
    res.status(400).json({ success: false, error: 'Title is required' })
    return
  }

  const id = `v-${crypto.randomBytes(3).toString('hex')}`
  const now = new Date().toISOString()
  
  const draft = new Video({
    id,
    ownerId: channel.id,
    title: title.trim(),
    description: description || '',
    visibility: 'draft',
    status: 'ready', // Cloudinary uploads are ready immediately usually
    thumbnailUrl: thumbnailUrl || '',
    sourceUrl: sourceUrl || '',
    durationSeconds: duration || 0,
    views: 0,
    likes: 0,
    dislikes: 0,
    publishedAt: null,
  })

  await draft.save()
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
