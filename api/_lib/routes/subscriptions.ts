import { Router, type Request, type Response } from 'express'
import { requireAuth } from '../lib/auth.js'
import dbConnect from '../lib/db.js'
import Subscription from '../models/Subscription.js'
import Profile from '../models/Profile.js'

const router = Router()

// Toggle subscription
router.post('/toggle', requireAuth, async (req: Request, res: Response) => {
  const db = await dbConnect()
  if (!db) {
    res.status(500).json({ success: false, error: 'Chybí konfigurace databáze (MONGODB_URI)' })
    return
  }
  const { channelId } = req.body // Expecting Profile ID
  const subscriberId = (req as Request & { auth: { sub: string } }).auth.sub

  if (!channelId) {
    res.status(400).json({ error: 'Channel ID is required' })
    return
  }

  // Check if trying to subscribe to own channel
  const channelProfile = await Profile.findOne({ id: channelId })
  if (!channelProfile) {
    res.status(404).json({ error: 'Channel not found' })
    return
  }

  if (channelProfile.userId === subscriberId) {
    res.status(400).json({ error: 'Cannot subscribe to yourself' })
    return
  }

  try {
    const existing = await Subscription.findOne({ subscriberId, channelId })
    let subscribed = false

    if (existing) {
      // Unsubscribe
      await Subscription.deleteOne({ _id: existing._id })
      await Profile.findOneAndUpdate(
        { id: channelId },
        { $inc: { subscribers: -1 } }
      )
      subscribed = false
    } else {
      // Subscribe
      await Subscription.create({ subscriberId, channelId })
      await Profile.findOneAndUpdate(
        { id: channelId },
        { $inc: { subscribers: 1 } }
      )
      subscribed = true
    }

    // Get updated count
    const updatedProfile = await Profile.findOne({ id: channelId })
    res.json({ subscribed, count: updatedProfile?.subscribers || 0 })
  } catch {
    // Log suppressed to avoid exposing internals
    res.status(500).json({ error: 'Failed to toggle subscription' })
  }
})

// Check status
router.get('/status/:channelId', requireAuth, async (req: Request, res: Response) => {
  const db = await dbConnect()
  if (!db) {
    res.status(500).json({ success: false, error: 'Chybí konfigurace databáze (MONGODB_URI)' })
    return
  }
  const { channelId } = req.params
  const subscriberId = (req as Request & { auth: { sub: string } }).auth.sub

  try {
    const existing = await Subscription.findOne({ subscriberId, channelId })
    res.json({ subscribed: !!existing })
  } catch {
    res.status(500).json({ error: 'Failed to check status' })
  }
})

export default router
