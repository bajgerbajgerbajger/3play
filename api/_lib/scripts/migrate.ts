import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import dbConnect from '../lib/db.js'
import User from '../models/User.js'
import Profile from '../models/Profile.js'
import Video from '../models/Video.js'
import Comment from '../models/Comment.js'
import { users, profiles, videos, comments } from '../data/sample.js'

// Load env from root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../../../')
dotenv.config({ path: path.join(rootDir, '.env.local') })

async function migrate() {
  console.log('Connecting to database...')
  await dbConnect()
  
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local')
    process.exit(1)
  }

  console.log('Migrating Users...')
  for (const u of users) {
    const exists = await User.findOne({ id: u.id })
    if (!exists) {
      await new User(u).save()
      console.log(`Created user: ${u.handle}`)
    } else {
      // Update fields if needed
      if (!exists.role) {
        exists.role = (u.email === 'creator@3play.dev') ? 'admin' : 'user'
        await exists.save()
        console.log(`Updated user role: ${u.handle} -> ${exists.role}`)
      }
    }
  }

  console.log('Migrating Profiles...')
  for (const p of profiles) {
    const exists = await Profile.findOne({ id: p.id })
    if (!exists) {
      // Find matching user to link userId
      const user = await User.findOne({ handle: p.handle })
      const profileData = { ...p, userId: user ? user.id : undefined }
      
      await new Profile(profileData).save()
      console.log(`Created profile: ${p.handle} (linked to user: ${user ? 'yes' : 'no'})`)
    } else {
      // Backfill userId if missing
      if (!exists.userId) {
        const user = await User.findOne({ handle: exists.handle })
        if (user) {
          exists.userId = user.id
          await exists.save()
          console.log(`Linked profile ${exists.handle} to user ${user.id}`)
        }
      }
    }
  }

  console.log('Migrating Videos...')
  for (const v of videos) {
    const exists = await Video.findOne({ id: v.id })
    if (!exists) {
      await new Video(v).save()
      console.log(`Created video: ${v.title}`)
    }
  }

  console.log('Migrating Comments...')
  for (const c of comments) {
    const exists = await Comment.findOne({ id: c.id })
    if (!exists) {
      await new Comment(c).save()
      console.log(`Created comment: ${c.id}`)
    }
  }

  console.log('Migration complete.')
  process.exit(0)
}

migrate().catch(console.error)
