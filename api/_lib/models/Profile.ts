import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

const ProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, unique: true, sparse: true }, // Link to User.id
  handle: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String },
  bannerUrl: { type: String },
  bio: { type: String },
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

export default Model as mongoose.Model<any>
