import Video from '../models/Video.js'
import Profile from '../models/Profile.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import { users as defaultUsers, profiles as defaultProfiles, videos as defaultVideos, comments as defaultComments } from '../data/sample.js'

export async function seedDatabase() {
  try {
    const videoCount = await Video.countDocuments()
    if (videoCount > 0) return

    console.log('[Seeding] Database is empty. Seeding default data...')

    // Seed Users
    for (const u of defaultUsers) {
      const exists = await User.findOne({ id: u.id })
      if (!exists) await new User(u).save()
    }

    // Seed Profiles
    for (const p of defaultProfiles) {
      const exists = await Profile.findOne({ id: p.id })
      if (!exists) await new Profile(p).save()
    }

    // Seed Videos
    for (const v of defaultVideos) {
      const exists = await Video.findOne({ id: v.id })
      if (!exists) await new Video(v).save()
    }

    // Seed Comments
    for (const c of defaultComments) {
      const exists = await Comment.findOne({ id: c.id })
      if (!exists) await new Comment(c).save()
    }

    console.log('[Seeding] Done.')
  } catch (error) {
    console.error('[Seeding] Failed:', error)
  }
}
