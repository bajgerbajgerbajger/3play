import Video from '../models/Video.js'
import Profile from '../models/Profile.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import { seedUsers, seedProfiles, seedVideos, seedComments } from '../data/sample.js'

export async function seedDatabase() {
  try {
    const publishedReadyCount = await Video.countDocuments({ visibility: 'published', status: 'ready' })
    if (publishedReadyCount > 0) return

    console.log('[Seeding] Database is empty. Seeding default data...')

    // Seed Users
    for (const u of seedUsers) {
      const exists = await User.findOne({ id: u.id })
      if (!exists) await User.create(u)
    }

    // Seed Profiles
    for (const p of seedProfiles) {
      const exists = await Profile.findOne({ id: p.id })
      if (!exists) await Profile.create(p)
    }

    // Seed Videos
    for (const v of seedVideos) {
      const exists = await Video.findOne({ id: v.id })
      if (!exists) await Video.create(v)
    }

    // Seed Comments
    for (const c of seedComments) {
      const exists = await Comment.findOne({ id: c.id })
      if (!exists) await Comment.create(c)
    }

    console.log('[Seeding] Done.')
  } catch (error) {
    console.error('[Seeding] Failed:', error)
    // Rethrow so the API knows something went wrong (e.g. DB connection failed)
    throw error
  }
}
