import { Router, type Request, type Response } from 'express'
import { findProfileByHandle, videos } from '../data/sample.js'

const router = Router()

router.get('/:handle', async (req: Request, res: Response) => {
  const { handle } = req.params
  const profile = findProfileByHandle(handle)
  if (!profile) {
    res.status(404).json({ success: false, error: 'Channel not found' })
    return
  }

  const published = videos.filter((v) => v.ownerId === profile.id && v.visibility === 'published' && v.status === 'ready')
  const totalViews = published.reduce((acc, v) => acc + v.views, 0)

  res.status(200).json({
    success: true,
    channel: {
      ...profile,
      totalViews,
      videoCount: published.length,
    },
  })
})

router.get('/:handle/videos', async (req: Request, res: Response) => {
  const { handle } = req.params
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'latest'
  const profile = findProfileByHandle(handle)
  if (!profile) {
    res.status(404).json({ success: false, error: 'Channel not found' })
    return
  }

  const list = videos
    .filter((v) => v.ownerId === profile.id && v.visibility === 'published' && v.status === 'ready')
    .slice()

  if (sort === 'popular') {
    list.sort((a, b) => b.views - a.views)
  } else {
    list.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  }

  const items = list.map((v) => ({
    id: v.id,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    durationSeconds: v.durationSeconds,
    views: v.views,
    publishedAt: v.publishedAt,
    channel: {
      id: profile.id,
      handle: profile.handle,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
  }))

  res.status(200).json({ success: true, items })
})

export default router

