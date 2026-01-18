import { Router, type Request, type Response } from 'express'
import { comments, findProfileById, publicVideoList, sortVideos, videos, updateVideo } from '../data/sample.js'
import { getAuthToken, requireAuth, verifyToken } from '../lib/auth.js'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const sort = typeof req.query.sort === 'string' ? req.query.sort : null
  const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 24

  let list = publicVideoList()
  if (query) {
    const q = query.toLowerCase()
    list = list.filter((v) => {
      const channel = findProfileById(v.ownerId)
      return (
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        (channel?.displayName || '').toLowerCase().includes(q)
      )
    })
  }
  list = sortVideos(list, sort)

  const items = list.slice(0, Math.max(1, Math.min(60, Number.isFinite(limit) ? limit : 24))).map((v) => {
    const owner = findProfileById(v.ownerId)
    return {
      id: v.id,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      durationSeconds: v.durationSeconds,
      views: v.views,
      publishedAt: v.publishedAt,
      channel: owner,
    }
  })

  res.status(200).json({ success: true, items })
})

router.get('/:videoId', async (req: Request, res: Response) => {
  const { videoId } = req.params
  const v = videos.find((x) => x.id === videoId)
  if (!v || v.visibility !== 'published') {
    res.status(404).json({ success: false, error: 'Video not found' })
    return
  }
  
  // Increment views
  v.views += 1
  updateVideo(v)

  const owner = findProfileById(v.ownerId)

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
      ...v,
      channel: owner,
      viewerRating,
    },
  })
})

router.get('/:videoId/comments', async (req: Request, res: Response) => {
  const { videoId } = req.params
  const list = comments
    .filter((c) => c.videoId === videoId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.status(200).json({ success: true, items: list })
})

router.post('/:videoId/engagement', requireAuth, async (req: Request, res: Response) => {
  const { videoId } = req.params
  const { action } = (req.body || {}) as { action?: 'like' | 'dislike' }
  const v = videos.find((x) => x.id === videoId)
  if (!v) {
    res.status(404).json({ success: false, error: 'Video not found' })
    return
  }

  const userId = (req as any).auth.sub
  
  if (action === 'like') {
    if (v.likedBy.includes(userId)) {
      // Toggle off
      v.likedBy = v.likedBy.filter((id) => id !== userId)
      v.likes = Math.max(0, v.likes - 1)
    } else {
      // Add like
      v.likedBy.push(userId)
      v.likes += 1
      // Remove dislike if present
      if (v.dislikedBy.includes(userId)) {
        v.dislikedBy = v.dislikedBy.filter((id) => id !== userId)
        v.dislikes = Math.max(0, v.dislikes - 1)
      }
    }
  }

  if (action === 'dislike') {
    if (v.dislikedBy.includes(userId)) {
      // Toggle off
      v.dislikedBy = v.dislikedBy.filter((id) => id !== userId)
      v.dislikes = Math.max(0, v.dislikes - 1)
    } else {
      // Add dislike
      v.dislikedBy.push(userId)
      v.dislikes += 1
      // Remove like if present
      if (v.likedBy.includes(userId)) {
        v.likedBy = v.likedBy.filter((id) => id !== userId)
        v.likes = Math.max(0, v.likes - 1)
      }
    }
  }

  updateVideo(v)

  // Calculate new rating
  let viewerRating = 'none'
  if (v.likedBy.includes(userId)) viewerRating = 'like'
  if (v.dislikedBy.includes(userId)) viewerRating = 'dislike'

  res.status(200).json({ success: true, likes: v.likes, dislikes: v.dislikes, viewerRating })
})

export default router
