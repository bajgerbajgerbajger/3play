import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import dbConnect from '../lib/db.js'
import User from '../models/User.js'
import { hashPassword } from '../data/sample.js'

// Load env from root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../../../')
dotenv.config({ path: path.join(rootDir, '.env.local') })

async function createAdmin() {
  console.log('Connecting to database...')
  await dbConnect()

  const email = 'creator@3play.dev'
  const password = 'password123'
  const handle = '@aurora'

  console.log(`Checking for user: ${email}`)
  let user = await User.findOne({ email })

  if (!user) {
    console.log('User not found, creating new admin...')
    // Use create() instead of new User() to support both Mongoose and LocalModel
    user = await User.create({
      id: `u-${Math.random().toString(16).slice(2, 10)}`,
      email,
      handle,
      displayName: 'Aurora Labs (Admin)',
      avatarUrl: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=admin_avatar&image_size=square',
      passwordHash: hashPassword(password),
      emailVerified: true,
      role: 'admin'
    })
  } else {
    console.log('User found, updating credentials and role...')
    user.passwordHash = hashPassword(password)
    user.role = 'admin'
    await user.save()
  }

  console.log('----------------------------------------')
  console.log('Admin Access Configured Successfully')
  console.log('----------------------------------------')
  console.log(`Email:    ${email}`)
  console.log(`Password: ${password}`)
  console.log(`Role:     ${user.role}`)
  console.log('----------------------------------------')
  
  process.exit(0)
}

createAdmin().catch(console.error)
