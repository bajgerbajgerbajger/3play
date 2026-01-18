/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import { signToken, requireAuth } from '../lib/auth.js'
import { users, profiles, verifyPassword, hashPassword, addUser, addProfile } from '../data/sample.js'

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
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(409).json({ success: false, error: 'Email already registered' })
    return
  }
  if (users.some((u) => u.handle.toLowerCase() === normalizedHandle.toLowerCase())) {
    res.status(409).json({ success: false, error: 'Handle already taken' })
    return
  }

  const user = {
    id: `u-${Math.random().toString(16).slice(2, 10)}`,
    email,
    handle: normalizedHandle,
    displayName,
    avatarUrl: `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      'flat geometric avatar icon, readable number 3 with play triangle motif, minimal, sharp edges, red accent, dark background, vector style',
    )}&image_size=square`,
    passwordHash: hashPassword(password),
  }
  
  // Use Persistence Helper
  addUser(user)

  // Create a channel profile for the new user
  const profile = {
    id: `p-${Math.random().toString(16).slice(2, 10)}`,
    handle: normalizedHandle,
    displayName,
    avatarUrl: user.avatarUrl,
    bannerUrl: `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      'wide banner, abstract tech background, dark theme, minimal geometric shapes, subtle gradient',
    )}&image_size=landscape_16_9`,
    bio: `Welcome to ${displayName}'s channel`,
    subscribers: 0,
  }
  // Use Persistence Helper
  addProfile(profile)

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
  const { email, password } = (req.body || {}) as { email?: string; password?: string }
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Missing email or password' })
    return
  }
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
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
  const auth = (req as Request & { auth: { sub: string } }).auth
  const user = users.find((u) => u.id === auth.sub)
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
