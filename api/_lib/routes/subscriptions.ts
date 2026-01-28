import { Router, type Request, type Response } from 'express'
import { requireAuth } from '../lib/auth.js'
import dbConnect from '../lib/db.js'
import Subscription from '../models/Subscription.js'
import Profile from '../models/Profile.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'

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

      // Notify Channel Owner
      try {
        if (channelProfile.userId) {
          const subscriberUser = await User.findOne({ id: subscriberId })
          if (subscriberUser) {
             await Notification.create({
              id: `n-${Math.random().toString(16).slice(2, 10)}`,
              userId: channelProfile.userId,
              actorId: subscriberId,
              actorName: subscriberUser.displayName,
              actorAvatarUrl: subscriberUser.avatarUrl,
              type: 'subscribe',
              title: `New subscriber`,
              message: `${subscriberUser.displayName} subscribed to your channel`,
              resourceId: channelId,
              link: `/channel/${subscriberId}`, // Link to subscriber's channel
              createdAt: new Date()
            })
          }
        }
      } catch (e) {
        console.error('Failed to create subscription notification', e)
      }
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
