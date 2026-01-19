/**
 * This is a user authentication API route.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import { signToken, requireAuth } from '../lib/auth.js'
import { verifyPassword, hashPassword } from '../data/sample.js'
import dbConnect from '../lib/db.js'
import User from '../models/User.js'
import Profile from '../models/Profile.js'

const router = Router()

// --- Security Middlewares ---

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 accounts per hour
  message: { success: false, error: 'Too many registrations from this IP.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Antivirus / Input Sanitization Check
function isSafeInput(str: any) {
  if (typeof str !== 'string') return true // Let validation handle types
  // Basic XSS and malicious pattern check
  if (/<script\b[^>]*>([\s\S]*?)<\/script>/gm.test(str)) return false
  if (/javascript:/i.test(str)) return false
  if (/\b(on\w+)=/i.test(str)) return false // e.g. onclick=
  if (/\.\.\//.test(str)) return false // Directory traversal
  return true
}

// Apply Rate Limits
router.use('/login', authLimiter)
router.use('/register', registerLimiter)

/**
 * User Login
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  await dbConnect()

  const { email, password, displayName, handle, _gotcha } = (req.body || {}) as {
    email?: string
    password?: string
    displayName?: string
    handle?: string
    _gotcha?: string // Honeypot field
  }

  // 1. Anti-Bot: Honeypot Check
  if (_gotcha) {
    // Silently fail for bots
    res.status(200).json({ success: false, error: 'Registration failed security check.' })
    return
  }

  // 2. Input Validation
  if (!email || !password || !displayName || !handle) {
    res.status(400).json({ success: false, error: 'Missing required fields' })
    return
  }

  // 3. Antivirus / Safety Check
  if (!isSafeInput(displayName) || !isSafeInput(handle) || !isSafeInput(email)) {
    res.status(400).json({ success: false, error: 'Input contains unsafe characters.' })
    return
  }

  const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`
  
  // 4. Persistence Check
  const existingEmail = await User.findOne({ email: new RegExp(`^${email}$`, 'i') })
  if (existingEmail) {
    res.status(409).json({ success: false, error: 'Email already registered' })
    return
  }

  const existingHandle = await User.findOne({ handle: new RegExp(`^${normalizedHandle}$`, 'i') })
  if (existingHandle) {
    res.status(409).json({ success: false, error: 'Handle already taken' })
    return
  }

  const userId = `u-${Math.random().toString(16).slice(2, 10)}`
  const profileId = `p-${Math.random().toString(16).slice(2, 10)}`
  
  const avatarUrl = `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    'flat geometric avatar icon, readable number 3 with play triangle motif, minimal, sharp edges, red accent, dark background, vector style',
  )}&image_size=square`

  const user = new User({
    id: userId,
    email,
    handle: normalizedHandle,
    displayName,
    avatarUrl,
    passwordHash: hashPassword(password),
  })
  
  await user.save()

  // Create a channel profile for the new user
  const profile = new Profile({
    id: profileId,
    handle: normalizedHandle,
    displayName,
    avatarUrl,
    bannerUrl: `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      'wide banner, abstract tech background, dark theme, minimal geometric shapes, subtle gradient',
    )}&image_size=landscape_16_9`,
    bio: `Welcome to ${displayName}'s channel`,
    subscribers: 0,
  })
  
  await profile.save()

  const token = signToken({ id: user.id, email: user.email, handle: user.handle })
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      handle: user.handle,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  })
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  await dbConnect()

  const { email, password } = (req.body || {}) as { email?: string; password?: string }
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Missing email or password' })
    return
  }
  
  const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') })
  
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ success: false, error: 'Invalid credentials' })
    return
  }
  
  const token = signToken({ id: user.id, email: user.email, handle: user.handle })
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      handle: user.handle,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  })
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true })
})

router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  await dbConnect()

  const auth = (req as Request & { auth: { sub: string } }).auth
  const user = await User.findOne({ id: auth.sub })
  
  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }
  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      handle: user.handle,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  })
})

export default router
