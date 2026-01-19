import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  handle: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String },
  passwordHash: { type: String, required: true },
}, { timestamps: true })

export default (mongoose.models.User || mongoose.model('User', UserSchema)) as mongoose.Model<any>
