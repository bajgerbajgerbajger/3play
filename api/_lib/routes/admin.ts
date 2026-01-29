import { Router, type Request, type Response, type NextFunction } from 'express'
import { requireAuth } from '../lib/auth.js'
import dbConnect from '../lib/db.js'
import User from '../models/User.js'
import Video from '../models/Video.js'
import Comment from '../models/Comment.js'

const router = Router()

// Admin Middleware
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = (req as Request & { auth: { sub: string } }).auth
    if (!auth) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    await dbConnect()
    const user = await User.findOne({ id: auth.sub })
    
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: Admin access required' })
      return
    }

    next()
  } catch (error) {
    console.error('Admin middleware error:', error)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
}

// Apply auth and admin check to all routes
router.use(requireAuth, requireAdmin)

// Stats Overview
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [users, videos, comments] = await Promise.all([
      User.countDocuments({}),
      Video.countDocuments({}),
      Comment.countDocuments({})
    ])

    // Recent activity (mock or real query)
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5)
    
    res.json({
      success: true,
      stats: {
        totalUsers: users,
        totalVideos: videos,
        totalComments: comments,
      },
      recentUsers
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' })
  }
})

// Users Management
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = 20
    const skip = (page - 1) * limit
    const search = req.query.q as string

    const query: any = {}
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { handle: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    const total = await User.countDocuments(query)

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' })
  }
})

router.post('/users/:id/block', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await User.findOneAndUpdate({ id }, { isBlocked: true })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to block user' })
  }
})

router.post('/users/:id/unblock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await User.findOneAndUpdate({ id }, { isBlocked: false })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to unblock user' })
  }
})

// Videos Management
router.get('/videos', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const videos = await Video.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      
    const total = await Video.countDocuments({})

    res.json({
      success: true,
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch videos' })
  }
})

router.delete('/videos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await Video.deleteOne({ id })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete video' })
  }
})

// Comments Management
router.get('/comments', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const comments = await Comment.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      
    const total = await Comment.countDocuments({})

    res.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch comments' })
  }
})

router.delete('/comments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await Comment.deleteOne({ id })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete comment' })
  }
})

export default router
