import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  videoId: { type: String, required: true, ref: 'Video' },
  authorHandle: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAvatarUrl: { type: String },
  message: { type: String, required: true },
  likes: { type: Number, default: 0 },
}, { timestamps: true })

const Model = process.env.MONGODB_URI
  ? (mongoose.models.Comment || mongoose.model('Comment', CommentSchema))
  : new LocalModel('comments')

export default Model as mongoose.Model<any>
