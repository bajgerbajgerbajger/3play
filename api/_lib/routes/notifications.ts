import { Router, type Request, type Response } from 'express'
import dbConnect from '../lib/db.js'
import Notification from '../models/Notification.js'
import { requireAuth } from '../lib/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req: Request, res: Response) => {
  const db = await dbConnect()
  const auth = (req as Request & { auth: { sub: string } }).auth
  const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 20
  
  const items = await Notification.find({ userId: auth.sub })
    .sort({ createdAt: -1 })
    .limit(limit)

  const unreadCount = await Notification.countDocuments({ userId: auth.sub, isRead: false })

  res.status(200).json({ success: true, items, unreadCount })
})

router.patch('/:id/read', async (req: Request, res: Response) => {
  const db = await dbConnect()
  const { id } = req.params
  const auth = (req as Request & { auth: { sub: string } }).auth

  const notification = await Notification.findOne({ id, userId: auth.sub })
  if (!notification) {
    res.status(404).json({ success: false, error: 'Notification not found' })
    return
  }

  notification.isRead = true
  await notification.save()

  res.status(200).json({ success: true })
})

router.post('/mark-all-read', async (req: Request, res: Response) => {
  const db = await dbConnect()
  const auth = (req as Request & { auth: { sub: string } }).auth

  await Notification.updateMany(
    { userId: auth.sub, isRead: false },
    { $set: { isRead: true } }
  )

  res.status(200).json({ success: true })
})

export default router
