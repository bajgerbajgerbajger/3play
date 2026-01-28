import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import { getAuthToken, requireAuth, verifyToken } from '../lib/auth.js'
import { seedDatabase } from '../lib/seed.js'
import dbConnect from '../lib/db.js'
import Video from '../models/Video.js'
import Profile from '../models/Profile.js'
import Comment from '../models/Comment.js'
import Notification from '../models/Notification.js'

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
  // Sort: Pinned first, then by date (newest first)
  list = list.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    return tb - ta
  })
  res.status(200).json({ success: true, items: list })
})

router.post('/:videoId/comments', requireAuth, async (req: Request, res: Response) => {
  await dbConnect()
  const { videoId } = req.params
  const { message, parentId } = (req.body || {}) as { message?: string, parentId?: string }
  const auth = (req as Request & { auth: { sub: string } }).auth

  if (!message || !message.trim()) {
    res.status(400).json({ success: false, error: 'Message required' })
    return
  }

  // Fetch user details for the comment
  const User = (await import('../models/User.js')).default
  const u = await User.findOne({ id: auth.sub })
  if (!u) {
    res.status(401).json({ success: false, error: 'User not found' })
    return
  }

  const commentId = `c-${Math.random().toString(16).slice(2, 10)}`
  const comment = await Comment.create({
    id: commentId,
    videoId,
    parentId: parentId || null,
    authorHandle: u.handle,
    authorName: u.displayName,
    authorAvatarUrl: u.avatarUrl,
    message: message.trim(),
    likes: 0,
    pinned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  // Notification Logic
  try {
    const video = await Video.findOne({ id: videoId })
    if (video) {
      // 1. Notify Video Owner (if comment is not by owner)
      const videoOwner = await Profile.findOne({ id: video.ownerId })
      if (videoOwner && videoOwner.userId !== auth.sub) {
        // We need userId of the owner. Profile model has userId.
        if (videoOwner.userId) {
          await Notification.create({
            id: `n-${Math.random().toString(16).slice(2, 10)}`,
            userId: videoOwner.userId,
            actorId: auth.sub,
            actorName: u.displayName,
            actorAvatarUrl: u.avatarUrl,
            type: 'comment',
            title: `New comment on "${video.title}"`,
            message: message.trim(),
            resourceId: videoId,
            link: `/watch/${videoId}`,
            createdAt: new Date()
          })
        }
      }

      // 2. Notify Parent Comment Author (if reply)
      if (parentId) {
        const parentComment = await Comment.findOne({ id: parentId })
        if (parentComment) {
          // Find original commenter's user ID. We stored handle, but not userId in Comment.
          // We need to look up Profile by handle to get userId.
          const parentAuthorProfile = await Profile.findOne({ handle: parentComment.authorHandle })
          
          // Don't notify if replying to self
          if (parentAuthorProfile && parentAuthorProfile.userId && parentAuthorProfile.userId !== auth.sub) {
             // Also don't notify if the video owner is the one replying (already covered above? No, above is for video owner receiving comment)
             // If I reply to a comment, the comment author gets notified.
             
             await Notification.create({
                id: `n-${Math.random().toString(16).slice(2, 10)}`,
                userId: parentAuthorProfile.userId,
                actorId: auth.sub,
                actorName: u.displayName,
                actorAvatarUrl: u.avatarUrl,
                type: 'reply',
                title: `Reply to your comment on "${video.title}"`,
                message: message.trim(),
                resourceId: videoId,
                link: `/watch/${videoId}`,
                createdAt: new Date()
             })
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to create notification', e)
  }

  res.status(200).json({ success: true, item: comment })
})

router.post('/:videoId/comments/:commentId/pin', requireAuth, async (req: Request, res: Response) => {
  await dbConnect()
  const { videoId, commentId } = req.params
  const auth = (req as Request & { auth: { sub: string } }).auth

  // Verify user owns the video
  const v = await Video.findOne({ id: videoId })
  if (!v) {
    res.status(404).json({ success: false, error: 'Video not found' })
    return
  }
  
  // Check ownership via Profile or direct ID match
  // Video ownerId is a Profile ID. User ID is auth.sub.
  // We need to check if Profile.userId === auth.sub
  const profile = await Profile.findOne({ id: v.ownerId })
  if (!profile || profile.userId !== auth.sub) {
    res.status(403).json({ success: false, error: 'Only video owner can pin comments' })
    return
  }

  const comment = await Comment.findOne({ id: commentId, videoId })
  if (!comment) {
    res.status(404).json({ success: false, error: 'Comment not found' })
    return
  }

  // Toggle pin
  comment.pinned = !comment.pinned
  await comment.save()

  res.status(200).json({ success: true, pinned: comment.pinned })
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
