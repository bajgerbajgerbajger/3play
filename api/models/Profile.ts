import mongoose from 'mongoose'

const ProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  handle: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String },
  bannerUrl: { type: String },
  bio: { type: String },
  subscribers: { type: Number, default: 0 },
}, { timestamps: true })

export default (mongoose.models.Profile || mongoose.model('Profile', ProfileSchema)) as mongoose.Model<any>
