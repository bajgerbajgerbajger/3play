import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  handle: string
  avatarUrl: string
}

type TokenPayload = {
  sub: string
  email: string
  handle: string
  exp?: number
  iat?: number
}

const secret = process.env.AUTH_SECRET || 'dev-secret'

if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
  throw new Error('CRITICAL SECURITY ERROR: AUTH_SECRET is not set in production environment! The application cannot start securely.')
}

export function signToken(user: { id: string; email: string; handle: string }, ttlSeconds = 60 * 60 * 24 * 14) {
  return jwt.sign(
    { 
      sub: user.id,
      email: user.email,
      handle: user.handle 
    },
    secret,
    { expiresIn: ttlSeconds }
  )
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    // jwt.verify throws if invalid or expired
    const payload = jwt.verify(token, secret) as TokenPayload
    return payload
  } catch (error) {
    return null
  }
}

export function getAuthToken(req: Request) {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice('Bearer '.length)
  return null
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getAuthToken(req)
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }
  ;(req as Request & { auth: TokenPayload }).auth = payload
  next()
}
