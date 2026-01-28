import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import { getAuthToken, requireAuth, verifyToken } from '../lib/auth.js'
import { seedDatabase } from '../lib/seed.js'
import dbConnect from '../lib/db.js'
import Video from '../models/Video.js'
import Profile from '../models/Profile.js'
import Comment from '../models/Comment.js'

const router = Router()

// Helper to sort videos since we might get mixed results
function sortVideos<T extends { publishedAt?: string | Date | null; views: number }>(list: T[], sort: string | null): T[] {
  const toTime = (v: string | Date | null | undefined) => {
    if (!v) return 0
    if (typeof v === 'string') {
      const t = Date.parse(v)
      return Number.isNaN(t) ? 0 : t
    }
    return v.getTime()
  }
  if (sort === 'latest') {
    return list.sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt))
  }
  if (sort === 'popular') {
    return list.sort((a, b) => b.views - a.views)
  }
  return list.sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt))
}

router.get('/', async (req: Request, res: Response) => {
  // Ensure DB connection before any queries (Mongoose buffering disabled)
  await dbConnect()
  // Try to seed if empty (fire and forget to avoid timeout on cold start)
  seedDatabase().catch(err => console.error('Seed failed:', err))

  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const sort = typeof req.query.sort === 'string' ? req.query.sort : null
  const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 24
  
  let filter: Record<string, unknown> = { visibility: 'published', status: 'ready' }

  // Subscriptions Filter
  if (sort === 'subscriptions') {
    const token = getAuthToken(req)
    if (!token) {
       res.status(401).json({ success: false, error: 'Unauthorized' })
       return
    }
    const payload = verifyToken(token)
    if (!payload) {
       res.status(401).json({ success: false, error: 'Invalid token' })
       return
    }
    
    // Find all channels user is subscribed to
    const Subscription = (await import('../models/Subscription.js')).default
    const subs = await Subscription.find({ subscriberId: payload.sub })
    const channelIds = subs.map(s => s.channelId)
    
    filter.ownerId = { $in: channelIds }
  }
  
  if (query) {
    const qRegex = new RegExp(query, 'i')
    // We need to look up profiles to filter by channel name, which is hard in one query without aggregation.
    // For simplicity, we'll fetch matches by title/desc first.
    // Or we can use aggregation.
    // Let's stick to simple find for now, maybe finding profiles first.
    
    const profiles = await Profile.find({ displayName: qRegex })
    const profileIds = profiles.map(p => p.id)
    
    filter = {
      visibility: 'published', 
      status: 'ready',
      $or: [
        { title: qRegex },
        { description: qRegex },
        { ownerId: { $in: profileIds } }
      ]
    }
  }

  let list = await Video.find(filter)
  list = sortVideos(list, sort)

  // Hydrate with profile info
  const items = await Promise.all(list.slice(0, Math.max(1, Math.min(60, Number.isFinite(limit) ? limit : 24))).map(async (v) => {
    const owner = await Profile.findOne({ id: v.ownerId })
    return {
      id: v.id,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      durationSeconds: v.durationSeconds,
      views: v.views,
      publishedAt: v.publishedAt,
      embedCode: v.embedCode,
      sourceUrl: v.sourceUrl,
      channel: owner,
    }
  }))

  res.status(200).json({ success: true, items })
})

router.get('/:videoId', async (req: Request, res: Response) => {
  await dbConnect()
  const { videoId } = req.params
  
  const v = await Video.findOne({ id: videoId })
  if (!v || v.visibility !== 'published') {
    res.status(404).json({ success: false, error: 'Video not found' })
    return
  }
  
  // Increment views
  v.views += 1
  await v.save()

  const owner = await Profile.findOne({ id: v.ownerId })

  // Check viewer rating
  let viewerRating = 'none'
  const token = getAuthToken(req)
  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      if (v.likedBy.includes(payload.sub)) viewerRating = 'like'
      if (v.dislikedBy.includes(payload.sub)) viewerRating = 'dislike'
    }
  }

  res.status(200).json({
    success: true,
    video: {
      ...v.toObject(),
      channel: owner,
      viewerRating,
    },
  })
})

router.get('/:videoId/comments', async (req: Request, res: Response) => {
  await dbConnect()
  const { videoId } = req.params
  let list = await Comment.find({ videoId })
  list = list.sort((a, b) => {
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    return tb - ta
  })
  res.status(200).json({ success: true, items: list })
})

router.post('/:videoId/engagement', requireAuth, async (req: Request, res: Response) => {
  await dbConnect()
  const { videoId } = req.params
  const { action } = (req.body || {}) as { action?: 'like' | 'dislike' }
  
  const v = await Video.findOne({ id: videoId })
  if (!v) {
    res.status(404).json({ success: false, error: 'Video not found' })
    return
  }

  const userId = (req as Request & { auth: { sub: string } }).auth.sub

  if (!action || !['like', 'dislike'].includes(action)) {
    res.status(400).json({ success: false, error: 'Invalid action' })
    return
  }
  
  if (action === 'like') {
    if (v.likedBy.includes(userId)) {
      // Toggle off
      v.likedBy = v.likedBy.filter((id: string) => id !== userId)
      v.likes = Math.max(0, v.likes - 1)
    } else {
      // Add like
      v.likedBy.push(userId)
      v.likes += 1
      // Remove dislike if present
      if (v.dislikedBy.includes(userId)) {
        v.dislikedBy = v.dislikedBy.filter((id: string) => id !== userId)
        v.dislikes = Math.max(0, v.dislikes - 1)
      }
    }
  }

  if (action === 'dislike') {
    if (v.dislikedBy.includes(userId)) {
      // Toggle off
      v.dislikedBy = v.dislikedBy.filter((id: string) => id !== userId)
      v.dislikes = Math.max(0, v.dislikes - 1)
    } else {
      // Add dislike
      v.dislikedBy.push(userId)
      v.dislikes += 1
      // Remove like if present
      if (v.likedBy.includes(userId)) {
        v.likedBy = v.likedBy.filter((id: string) => id !== userId)
        v.likes = Math.max(0, v.likes - 1)
      }
    }
  }

  await v.save()

  // Calculate new rating
  let viewerRating = 'none'
  if (v.likedBy.includes(userId)) viewerRating = 'like'
  if (v.dislikedBy.includes(userId)) viewerRating = 'dislike'

  res.status(200).json({ success: true, likes: v.likes, dislikes: v.dislikes, viewerRating })
})

export default router
