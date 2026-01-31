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
import EmailVerificationCode from '../models/EmailVerificationCode.js'
import { sendVerificationEmail } from '../lib/mail.js'
import { DEFAULT_AVATARS } from '../default-avatars.js'

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
function isSafeInput(str: unknown) {
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

const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many verification requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.use('/request-code', codeLimiter)

router.post('/request-code', async (req: Request, res: Response): Promise<void> => {
  await dbConnect()

  const { email, _gotcha } = (req.body || {}) as { email?: string; _gotcha?: string }

  if (_gotcha) {
    res.status(200).json({ success: false, error: 'Verification failed security check.' })
    return
  }

  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required' })
    return
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await EmailVerificationCode.findOneAndUpdate(
    { email: normalizedEmail, used: false },
    { email: normalizedEmail, code, expiresAt, used: false, attempts: 0 },
    { upsert: true, new: true },
  )

  if (process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY) {
    console.log('Dev email verification code for', normalizedEmail, 'is', code)
    // In dev mode, we return the code to the frontend for convenience
    // But we also try to send it if API key is present
    if (process.env.RESEND_API_KEY) {
       await sendVerificationEmail(normalizedEmail, code)
    }
    res.status(200).json({ success: true, devCode: code })
    return
  }

  // Production: Send email
  const emailResult = await sendVerificationEmail(normalizedEmail, code)
  
  if (!emailResult.success) {
    res.status(500).json({ success: false, error: 'Failed to send verification email' })
    return
  }

  res.status(200).json({ success: true })
})

router.post('/verify-code', async (req: Request, res: Response): Promise<void> => {
  await dbConnect()

  const { email, verificationCode } = (req.body || {}) as { email?: string; verificationCode?: string }
  
  if (!email || !verificationCode) {
    res.status(400).json({ success: false, error: 'Email and code required' })
    return
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const codeDoc = await EmailVerificationCode.findOne({ email: normalizedEmail, used: false })

  if (!codeDoc || !codeDoc.code || codeDoc.code !== verificationCode) {
    res.status(400).json({ success: false, error: 'Invalid verification code' })
    return
  }

  if (codeDoc.expiresAt && codeDoc.expiresAt.getTime() < Date.now()) {
    res.status(400).json({ success: false, error: 'Verification code has expired' })
    return
  }

  res.status(200).json({ success: true })
})

/**
 * User Login
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  await dbConnect()

  const { email, password, displayName, handle, verificationCode, acceptTerms, gender, _gotcha } = (req.body || {}) as {
    email?: string
    password?: string
    displayName?: string
    handle?: string
    verificationCode?: string
    acceptTerms?: boolean
    gender?: 'male' | 'female' | 'other'
    _gotcha?: string // Honeypot field
  }

  // 1. Anti-Bot: Honeypot Check
  if (_gotcha) {
    // Silently fail for bots
    res.status(200).json({ success: false, error: 'Registration failed security check.' })
    return
  }

  // 2. Input Validation
  if (!email || !password || !displayName || !handle || !verificationCode) {
    res.status(400).json({ success: false, error: 'Missing required fields' })
    return
  }

  if (!acceptTerms) {
    res.status(400).json({ success: false, error: 'You must accept the terms to continue' })
    return
  }

  // 3. Antivirus / Safety Check
  if (!isSafeInput(displayName) || !isSafeInput(handle) || !isSafeInput(email)) {
    res.status(400).json({ success: false, error: 'Input contains unsafe characters.' })
    return
  }

  const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`
  const normalizedEmail = String(email).trim().toLowerCase()
  
  // 4. Persistence Check
  const existingEmail = await User.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') })
  if (existingEmail) {
    res.status(409).json({ success: false, error: 'Email already registered' })
    return
  }

  const existingHandle = await User.findOne({ handle: new RegExp(`^${normalizedHandle}$`, 'i') })
  if (existingHandle) {
    res.status(409).json({ success: false, error: 'Handle already taken' })
    return
  }

  const codeDoc = await EmailVerificationCode.findOne({ email: normalizedEmail, used: false })

  if (!codeDoc || !codeDoc.code || codeDoc.code !== verificationCode) {
    res.status(400).json({ success: false, error: 'Invalid verification code' })
    return
  }

  if (codeDoc.expiresAt && codeDoc.expiresAt.getTime() < Date.now()) {
    res.status(400).json({ success: false, error: 'Verification code has expired' })
    return
  }

  codeDoc.used = true
  await codeDoc.save()

  const userId = `u-${Math.random().toString(16).slice(2, 10)}`
  const profileId = `p-${Math.random().toString(16).slice(2, 10)}`
  
  let avatarUrl = DEFAULT_AVATARS.other
  if (gender === 'male') avatarUrl = DEFAULT_AVATARS.male
  else if (gender === 'female') avatarUrl = DEFAULT_AVATARS.female

  const user = new User({
    id: userId,
    email: normalizedEmail,
    handle: normalizedHandle,
    displayName,
    avatarUrl,
    gender: gender || 'other',
    passwordHash: hashPassword(password),
    emailVerified: true,
    channelId: profileId, // Link to the auto-created channel
    plan: 'free',
    subscriptionStatus: 'active', // Permanently active
    newAccount: true, // Mark as new account for visibility
  })
  
  await user.save()

  // Create a channel profile for the new user
  const profile = new Profile({
    id: profileId,
    userId: user.id,
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
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      newAccount: user.newAccount,
      role: user.role,
      isBlocked: user.isBlocked,
      trialEndsAt: user.trialEndsAt,
      channelId: user.channelId,
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

  if (user.isBlocked) {
    res.status(403).json({ success: false, error: 'Your account has been blocked.' })
    return
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save()
  
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
      gender: user.gender,
      plan: user.plan || 'free',
      subscriptionStatus: user.subscriptionStatus || 'inactive',
      newAccount: user.newAccount,
      role: user.role,
      isBlocked: user.isBlocked,
      trialEndsAt: user.trialEndsAt,
      subscriptionEndsAt: user.subscriptionEndsAt,
      channelId: user.channelId,
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
      gender: user.gender,
      plan: user.plan || 'free',
      subscriptionStatus: user.subscriptionStatus || 'inactive',
      newAccount: user.newAccount,
      role: user.role,
      isBlocked: user.isBlocked,
      trialEndsAt: user.trialEndsAt,
      subscriptionEndsAt: user.subscriptionEndsAt,
    },
  })
})

export default router
