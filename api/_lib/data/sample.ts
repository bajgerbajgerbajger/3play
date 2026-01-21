import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, 'db.json')

export type Profile = {
  id: string
  handle: string
  displayName: string
  avatarUrl: string
  bannerUrl: string
  bio: string
  subscribers: number
}

export type VideoVisibility = 'draft' | 'unlisted' | 'published'
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed'

export type Video = {
  id: string
  ownerId: string
  title: string
  description: string
  visibility: VideoVisibility
  status: VideoStatus
  thumbnailUrl: string
  sourceUrl: string
  durationSeconds: number
  views: number
  likes: number
  dislikes: number
  likedBy: string[]
  dislikedBy: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type Comment = {
  id: string
  videoId: string
  authorHandle: string
  authorName: string
  authorAvatarUrl: string
  message: string
  createdAt: string
  likes: number
}

export type User = {
  id: string
  email: string
  handle: string
  displayName: string
  avatarUrl: string
  passwordHash: string
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derived}`
}

export function verifyPassword(password: string, hash: string) {
  const [salt, expected] = hash.split(':')
  if (!salt || !expected) return false
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(expected, 'hex'))
}

function nowIso() {
  return new Date().toISOString()
}

function sdxlUrl(prompt: string, size: 'landscape_16_9' | 'square') {
  const p = encodeURIComponent(prompt)
  return `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${p}&image_size=${size}`
}

const sampleVideoSources = {
  bbb: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ele: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  sintel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  tears: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
}

const defaultProfiles: Profile[] = [
  {
    id: 'p-aurora',
    handle: '@aurora',
    displayName: 'Aurora Labs',
    avatarUrl: sdxlUrl('flat geometric avatar icon, tech creator, neon red accent, minimal, sharp edges, dark background, vector style', 'square'),
    bannerUrl: sdxlUrl('wide banner, abstract tech waveforms, deep near-black, strong red accents, subtle purple highlights, minimal, flat vector, clean symmetry', 'landscape_16_9'),
    bio: 'Creator-first engineering breakdowns, studio workflows, and performance tuning.',
    subscribers: 128400,
  },
  {
    id: 'p-kairo',
    handle: '@kairo',
    displayName: 'Kairo Motion',
    avatarUrl: sdxlUrl('flat geometric avatar icon, video editor, sharp edges, high contrast, red accent, minimal vector portrait', 'square'),
    bannerUrl: sdxlUrl('wide banner, cinematic gradient, near-black to dark gray, red highlight line, minimal tech aesthetic, flat design', 'landscape_16_9'),
    bio: 'Fast cuts, clean grading, creator tooling. Short, sharp, premium.',
    subscribers: 84210,
  },
  {
    id: 'p-nova',
    handle: '@novasynth',
    displayName: 'Nova Synth',
    avatarUrl: sdxlUrl('flat geometric avatar icon, synthwave creator, minimal, sharp, red and subtle blue accents, dark background, vector style', 'square'),
    bannerUrl: sdxlUrl('wide banner, synthwave city silhouette, near-black base, red sun disc, subtle blue haze, flat vector, symmetric', 'landscape_16_9'),
    bio: 'Design, sound, and modern interfaces. Premium but minimal.',
    subscribers: 203500,
  },
]

export const seedProfiles = defaultProfiles

const defaultUsers: User[] = [
  {
    id: 'u-aurora',
    email: 'creator@3play.dev',
    handle: '@aurora',
    displayName: 'Aurora Labs',
    avatarUrl: defaultProfiles[0].avatarUrl,
    passwordHash: hashPassword('password123'),
  },
]

export const seedUsers = defaultUsers

const defaultVideos: Video[] = [
  {
    id: 'v-001',
    ownerId: 'p-aurora',
    title: '3Play UI System: Dark-first, Minimal, Fast',
    description: 'A practical walkthrough of building a dark-mode-first design system with real components, fast interactions, and a premium feel.',
    visibility: 'published',
    status: 'ready',
    thumbnailUrl: sdxlUrl('video thumbnail, high contrast, readable title text "Dark-first UI", creator portrait on left, cinematic lighting, minimal tech, red accents, clean typography, flat overlay', 'landscape_16_9'),
    sourceUrl: sampleVideoSources.sintel,
    durationSeconds: 536,
    views: 182340,
    likes: 12840,
    dislikes: 402,
    likedBy: [],
    dislikedBy: [],
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'v-002',
    ownerId: 'p-kairo',
    title: 'Creator Studio Workflow: Upload → Process → Publish',
    description: 'A complete creator flow with progress UI, processing indicators, and publish controls. Built for speed and confidence.',
    visibility: 'published',
    status: 'ready',
    thumbnailUrl: sdxlUrl('video thumbnail, title "Studio Workflow", sleek dashboard screenshot style, red primary button, dark background, minimal, high contrast, cinematic', 'landscape_16_9'),
    sourceUrl: sampleVideoSources.tears,
    durationSeconds: 734,
    views: 95340,
    likes: 8021,
    dislikes: 221,
    likedBy: [],
    dislikedBy: [],
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'v-003',
    ownerId: 'p-nova',
    title: 'Motion That Feels Premium (Without Being Distracting)',
    description: 'Micro-interactions, thumbnail hovers, and page transitions that keep the focus on video.',
    visibility: 'published',
    status: 'ready',
    thumbnailUrl: sdxlUrl('video thumbnail, title "Premium Motion", abstract motion lines, near-black background, strong red highlight, subtle blue glow, minimal, high contrast', 'landscape_16_9'),
    sourceUrl: sampleVideoSources.ele,
    durationSeconds: 492,
    views: 241900,
    likes: 16920,
    dislikes: 510,
    likedBy: [],
    dislikedBy: [],
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'v-004',
    ownerId: 'p-aurora',
    title: 'Performance Playbook: Streaming UI at 60fps',
    description: 'Tech-focused breakdown: rendering budgets, skeletons, and perceived speed on modern media platforms.',
    visibility: 'published',
    status: 'ready',
    thumbnailUrl: sdxlUrl('video thumbnail, title "60fps Playbook", tech graphs, minimal UI, dark theme, red accent, crisp typography, high contrast', 'landscape_16_9'),
    sourceUrl: sampleVideoSources.bbb,
    durationSeconds: 596,
    views: 512300,
    likes: 44210,
    dislikes: 918,
    likedBy: [],
    dislikedBy: [],
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
]

export const seedVideos = defaultVideos

const defaultComments: Comment[] = [
  {
    id: 'c-001',
    videoId: 'v-001',
    authorHandle: '@novasynth',
    authorName: 'Nova Synth',
    authorAvatarUrl: defaultProfiles[2].avatarUrl,
    message: 'This feels like a real product. The spacing + hover polish is perfect.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 92,
  },
  {
    id: 'c-002',
    videoId: 'v-001',
    authorHandle: '@kairo',
    authorName: 'Kairo Motion',
    authorAvatarUrl: defaultProfiles[1].avatarUrl,
    message: 'The dark-first tokens make everything consistent. Great work.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    likes: 51,
  },
  {
    id: 'c-003',
    videoId: 'v-003',
    authorHandle: '@aurora',
    authorName: 'Aurora Labs',
    authorAvatarUrl: defaultProfiles[0].avatarUrl,
    message: 'Fast motion with restraint is the whole game. Nice.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    likes: 33,
  },
]

export const seedComments = defaultComments

// --- Persistence Layer ---

// Initialize with defaults if file doesn't exist
let data = {
  users: defaultUsers,
  profiles: defaultProfiles,
  videos: defaultVideos,
  comments: defaultComments,
}

// Try to load from disk
try {
  if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    // Merge loaded data with defaults if missing (simple migration)
    data = {
      users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : defaultUsers,
      profiles: Array.isArray(parsed.profiles) && parsed.profiles.length > 0 ? parsed.profiles : defaultProfiles,
      videos: Array.isArray(parsed.videos) && parsed.videos.length > 0 ? parsed.videos : defaultVideos,
      comments: Array.isArray(parsed.comments) && parsed.comments.length > 0 ? parsed.comments : defaultComments,
    }
    console.log(`[Database] Loaded ${data.users.length} users, ${data.profiles.length} profiles, ${data.videos.length} videos from ${DB_PATH}`)
  } else {
    // Save defaults initially
    saveData()
  }
} catch (err) {
  console.error('[Database] Failed to load database, using defaults:', err)
}

function saveData() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
    console.log('[Database] Saved changes to disk')
  } catch (err) {
    console.error('[Database] Failed to save database:', err)
  }
}

// Export references (Note: Re-exporting arrays directly works but mutating them 
// elsewhere won't automatically trigger save. We should use helper functions.)
export const users = data.users
export const profiles = data.profiles
export const videos = data.videos
export const comments = data.comments

// --- Helpers for Safe Mutation & Persistence ---

export function addUser(user: User) {
  users.unshift(user)
  saveData()
}

export function addProfile(profile: Profile) {
  profiles.unshift(profile)
  saveData()
}

export function addVideo(video: Video) {
  videos.unshift(video)
  saveData()
}

export function updateVideo(video: Video) {
  // Assuming video is a reference from the array, it's already updated in memory.
  // We just need to trigger save.
  saveData()
}

export function findProfileByHandle(handle: string) {
  const normalized = handle.startsWith('@') ? handle : `@${handle}`
  return profiles.find((p) => p.handle.toLowerCase() === normalized.toLowerCase()) || null
}

export function findProfileById(id: string) {
  return profiles.find((p) => p.id === id) || null
}

export function publicVideoList() {
  return videos
    .filter((v) => v.visibility === 'published' && v.status === 'ready')
    .slice()
}

export function sortVideos(list: Video[], sort: string | null) {
  if (sort === 'latest') {
    return list.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  }
  if (sort === 'popular') {
    return list.sort((a, b) => b.views - a.views)
  }
  return list.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
}

export function createDraftVideo(ownerId: string, input: { title: string; description?: string; sourceUrl?: string; thumbnailUrl?: string; duration?: number }) {
  const id = `v-${crypto.randomBytes(3).toString('hex')}`
  const ts = nowIso()
  const draft: Video = {
    id,
    ownerId,
    title: input.title,
    description: input.description || '',
    visibility: 'draft',
    status: 'processing',
    thumbnailUrl:
      input.thumbnailUrl ||
      sdxlUrl('video thumbnail, high contrast, title "New Upload", minimal tech, dark background, red accent, clean typography, cinematic', 'landscape_16_9'),
    sourceUrl: input.sourceUrl || sampleVideoSources.bbb,
    durationSeconds: input.duration || 0,
    views: 0,
    likes: 0,
    dislikes: 0,
    likedBy: [],
    dislikedBy: [],
    publishedAt: null,
    createdAt: ts,
    updatedAt: ts,
  }
  // Use helper to save
  addVideo(draft)
  
  setTimeout(() => {
    const v = videos.find((x) => x.id === id)
    if (!v) return
    v.status = 'ready'
    if (!input.duration) v.durationSeconds = 420 // Only set mock duration if real one wasn't provided
    v.updatedAt = nowIso()
    saveData() // Save after async update
  }, 4500)
  return draft
}
