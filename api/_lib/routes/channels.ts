import { Router, type Request, type Response } from 'express'
import dbConnect from '../lib/db.js'
import Profile from '../models/Profile.js'
import Video from '../models/Video.js'
import { requireAuth } from '../lib/auth.js'

const router = Router()

// Duplicate helper locally to avoid complex imports if not exported
function localNormalizeHandle(input: string) {
  const raw = String(input || '').trim()
  const noAt = raw.replace(/^@+/, '')
  return `@${noAt.toLowerCase()}`
}

router.post('/', requireAuth, async (req: Request, res: Response) => {
  await dbConnect()
  const userId = (req as any).auth.sub
  const { handle, displayName, description } = req.body || {}

  if (!handle || !displayName) {
    res.status(400).json({ success: false, error: 'Handle and Display Name are required' })
    return
  }

  // Check if user already has a channel
  const existing = await Profile.findOne({ userId })
  if (existing) {
    res.status(409).json({ success: false, error: 'User already has a channel' })
    return
  }

  const normalized = localNormalizeHandle(handle)
  
  // Check handle uniqueness
  const handleTaken = await Profile.findOne({ handle: normalized })
  if (handleTaken) {
    res.status(409).json({ success: false, error: 'Handle already taken' })
    return
  }

  const profileId = `p-${Math.random().toString(16).slice(2, 10)}`
  
  const profile = await Profile.create({
    id: profileId,
    userId,
    handle: normalized,
    displayName,
    bio: description,
    subscribers: 0,
    avatarUrl: `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      'flat geometric avatar icon, number 3, minimal, vector',
    )}&image_size=square`,
    bannerUrl: `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      'abstract tech banner, dark theme',
    )}&image_size=landscape_16_9`,
  })

  res.status(200).json({ success: true, channel: profile })
})

router.get('/:handle', async (req: Request, res: Response) => {
  await dbConnect()
  const { handle } = req.params
  // Handle in DB is stored with @ or not?
  // Our seed data has @. User input might not.
  // We should normalize or search carefully.
  // The Profile model has `handle` as string.
  // In `auth.ts` we normalize to `@handle`.
  // So we should try to match exact or with @.
  
  const normalized = (handle.startsWith('@') ? handle : `@${handle}`).toLowerCase()
  const profile = await Profile.findOne({ handle: normalized })
  
  if (!profile) {
    res.status(404).json({ success: false, error: 'Channel not found' })
    return
  }

  const published = await Video.find({ ownerId: profile.id, visibility: 'published', status: 'ready' })
  const totalViews = published.reduce((acc, v) => acc + v.views, 0)

  res.status(200).json({
    success: true,
    channel: {
      ...profile.toObject(),
      totalViews,
      videoCount: published.length,
    },
  })
})

router.get('/:handle/videos', async (req: Request, res: Response) => {
  await dbConnect()
  const { handle } = req.params
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'latest'
  
  const normalized = (handle.startsWith('@') ? handle : `@${handle}`).toLowerCase()
  const profile = await Profile.findOne({ handle: normalized })

  if (!profile) {
    res.status(404).json({ success: false, error: 'Channel not found' })
    return
  }

  let list = await Video.find({
    ownerId: profile.id,
    visibility: 'published',
    status: 'ready',
  })

  if (sort === 'popular') {
    list = list.sort((a, b) => (b.views || 0) - (a.views || 0))
  } else {
    list = list.sort((a, b) => {
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      return tb - ta
    })
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
