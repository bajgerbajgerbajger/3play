import { Router, type Request, type Response } from 'express'
import { createDraftVideo, findProfileByHandle, videos, updateVideo, addProfile } from '../data/sample.js'
import { requireAuth } from '../lib/auth.js'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath)
}

const router = Router()

// Configure uploads
const uploadDir = path.join(process.cwd(), 'api/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'video-' + uniqueSuffix + ext)
  }
})
const upload = multer({ storage })

router.use(requireAuth)

router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' })
    return
  }
  const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  
  // Check if it's an image upload
  if (req.file.mimetype.startsWith('image/')) {
    res.status(200).json({ success: true, url: videoUrl, thumbnailUrl: videoUrl })
    return
  }

  // Generate thumbnail for video
  const thumbFilename = `thumb-${req.file.filename.split('.')[0]}.jpg`
  const thumbPath = path.join(uploadDir, thumbFilename)

  ffmpeg(req.file.path)
    .on('end', () => {
      // Get duration
      ffmpeg.ffprobe(req.file.path, (err, metadata) => {
        const duration = metadata?.format?.duration || 0
        const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/${thumbFilename}`
        res.status(200).json({ success: true, url: videoUrl, thumbnailUrl, duration })
      })
    })
    .on('error', (err) => {
      console.error('Thumbnail generation failed:', err)
      // Return success anyway, just without thumbnail
      res.status(200).json({ success: true, url: videoUrl })
    })
    .screenshots({
      count: 1,
      timemarks: ['20%'],
      folder: uploadDir,
      filename: thumbFilename,
      size: '1280x720'
    })
})

router.get('/me', async (req: Request, res: Response) => {
  const auth = (req as Request & { auth: { sub: string; handle: string } }).auth
  const channel = findProfileByHandle(auth.handle)
  res.status(200).json({ success: true, channel })
})

router.get('/videos', async (req: Request, res: Response) => {
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = findProfileByHandle(auth.handle)
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  const list = videos
    .filter((v) => v.ownerId === channel.id)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  res.status(200).json({ success: true, items: list })
})

router.post('/videos', async (req: Request, res: Response) => {
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = findProfileByHandle(auth.handle)
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
  const draft = createDraftVideo(channel.id, { title: title.trim(), description, sourceUrl, thumbnailUrl, duration })
  res.status(200).json({ success: true, video: draft })
})

router.patch('/videos/:videoId', async (req: Request, res: Response) => {
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = findProfileByHandle(auth.handle)
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  const { videoId } = req.params
  const v = videos.find((x) => x.id === videoId)
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
    if (visibility === 'published' && !v.publishedAt) v.publishedAt = new Date().toISOString()
  }
  v.updatedAt = new Date().toISOString()
  updateVideo(v)
  res.status(200).json({ success: true, video: v })
})

router.post('/videos/:videoId/publish', async (req: Request, res: Response) => {
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = findProfileByHandle(auth.handle)
  if (!channel) {
    res.status(403).json({ success: false, error: 'No channel profile' })
    return
  }

  const { videoId } = req.params
  const v = videos.find((x) => x.id === videoId)
  if (!v || v.ownerId !== channel.id) {
    res.status(404).json({ success: false, error: 'Video not found' })
    return
  }
  if (v.status !== 'ready') {
    res.status(409).json({ success: false, error: 'Video is not ready to publish' })
    return
  }
  v.visibility = 'published'
  v.publishedAt = v.publishedAt || new Date().toISOString()
  v.updatedAt = new Date().toISOString()
  updateVideo(v)
  res.status(200).json({ success: true, video: v })
})

router.patch('/channel', async (req: Request, res: Response) => {
  const auth = (req as Request & { auth: { handle: string } }).auth
  const channel = findProfileByHandle(auth.handle)
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
  // Trigger save via re-adding? No, updateProfile isn't exported.
  // We can use updateVideo as a generic saver since it just calls saveData()
  updateVideo(channel as any) 
  res.status(200).json({ success: true, channel })
})

export default router
