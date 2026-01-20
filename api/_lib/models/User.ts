import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  handle: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String },
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

export default Model as mongoose.Model<any>
