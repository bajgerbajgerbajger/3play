import { Router, type Request, type Response } from 'express'
import dbConnect from '../lib/db.js'
import Profile from '../models/Profile.js'
import Video from '../models/Video.js'

const router = Router()

router.get('/:handle', async (req: Request, res: Response) => {
  await dbConnect()
  const { handle } = req.params
  // Handle in DB is stored with @ or not?
  // Our seed data has @. User input might not.
  // We should normalize or search carefully.
  // The Profile model has `handle` as string.
  // In `auth.ts` we normalize to `@handle`.
  // So we should try to match exact or with @.
  
  const normalized = handle.startsWith('@') ? handle : `@${handle}`
  const profile = await Profile.findOne({ handle: new RegExp(`^${normalized}$`, 'i') })
  
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
  
  const normalized = handle.startsWith('@') ? handle : `@${handle}`
  const profile = await Profile.findOne({ handle: new RegExp(`^${normalized}$`, 'i') })

  if (!profile) {
    res.status(404).json({ success: false, error: 'Channel not found' })
    return
  }

  let sortOption: any = { publishedAt: -1 }
  if (sort === 'popular') {
    sortOption = { views: -1 }
  }

  const list = await Video.find({ 
    ownerId: profile.id, 
    visibility: 'published', 
    status: 'ready' 
  }).sort(sortOption)

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
