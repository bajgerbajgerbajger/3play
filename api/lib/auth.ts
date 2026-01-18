import crypto from 'crypto'
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
  exp: number
}

const secret = process.env.AUTH_SECRET || 'dev-secret'

function base64urlEncode(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return b
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64urlDecode(input: string) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = (4 - (padded.length % 4)) % 4
  const withPad = padded + '='.repeat(padLen)
  return Buffer.from(withPad, 'base64')
}

function sign(data: string) {
  return base64urlEncode(crypto.createHmac('sha256', secret).update(data).digest())
}

export function signToken(user: { id: string; email: string; handle: string }, ttlSeconds = 60 * 60 * 24 * 14) {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    handle: user.handle,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }
  const payloadPart = base64urlEncode(JSON.stringify(payload))
  const unsigned = `${header}.${payloadPart}`
  const sig = sign(unsigned)
  return `${unsigned}.${sig}`
}

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [h, p, s] = parts
  const unsigned = `${h}.${p}`
  if (sign(unsigned) !== s) return null
  try {
    const payload = JSON.parse(base64urlDecode(p).toString('utf8')) as TokenPayload
    if (!payload?.sub || !payload.exp) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
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

