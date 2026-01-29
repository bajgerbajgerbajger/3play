import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

export type UserDoc = {
  id: string
  email: string
  handle: string
  displayName: string
  avatarUrl?: string
  gender?: 'male' | 'female' | 'other'
  passwordHash: string
  emailVerified: boolean
  channelId?: string
  isBlocked?: boolean
  role: 'user' | 'admin'
  plan: 'free' | 'creator' | 'pro'
  subscriptionStatus: 'active' | 'inactive' | 'trial'
  trialEndsAt?: Date
  subscriptionEndsAt?: Date
  lastLogin?: Date
  newAccount?: boolean
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  handle: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  passwordHash: { type: String, required: true },
  emailVerified: { type: Boolean, default: true },
  channelId: { type: String },
  isBlocked: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  plan: { type: String, enum: ['free', 'creator', 'pro'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'trial'], default: 'inactive' },
  trialEndsAt: { type: Date },
  subscriptionEndsAt: { type: Date },
  lastLogin: { type: Date },
  newAccount: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true })

const Model = process.env.MONGODB_URI 
  ? (mongoose.models.User || mongoose.model('User', UserSchema))
  : new LocalModel('users')

export default Model as mongoose.Model<UserDoc>
