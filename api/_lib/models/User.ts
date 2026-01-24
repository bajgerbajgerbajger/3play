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
  role: 'user' | 'admin'
  lastLogin?: Date
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
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  lastLogin: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true })

const Model = process.env.MONGODB_URI 
  ? (mongoose.models.User || mongoose.model('User', UserSchema))
  : new LocalModel('users')

export default Model as mongoose.Model<UserDoc>
