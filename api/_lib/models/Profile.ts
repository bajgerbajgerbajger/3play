import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

export type ProfileDoc = {
  id: string
  userId?: string
  handle: string
  displayName: string
  avatarUrl?: string
  bannerUrl?: string
  bio?: string
  socialLinks?: { platform: string; url: string }[]
  subscribers: number
  phone?: string
  consentContact?: boolean
  consentMarketing?: boolean
  consentVersion?: string
  consentedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, unique: true, sparse: true }, // Link to User.id
  handle: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String },
  bannerUrl: { type: String },
  bio: { type: String },
  socialLinks: [{
    platform: { type: String, required: true },
    url: { type: String, required: true }
  }],
  subscribers: { type: Number, default: 0 },
  phone: { type: String },
  consentContact: { type: Boolean, default: false },
  consentMarketing: { type: Boolean, default: false },
  consentVersion: { type: String },
  consentedAt: { type: Date },
}, { timestamps: true })

const Model = process.env.MONGODB_URI
  ? (mongoose.models.Profile || mongoose.model('Profile', ProfileSchema))
  : new LocalModel('profiles')

export default Model as mongoose.Model<ProfileDoc>
