import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

export type CommentDoc = {
  id: string
  videoId: string
  parentId?: string | null
  authorHandle: string
  authorName: string
  authorAvatarUrl?: string
  message: string
  likes: number
  dislikes: number
  likedBy: string[]
  dislikedBy: string[]
  pinned: boolean
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  videoId: { type: String, required: true, ref: 'Video' },
  parentId: { type: String, default: null },
  authorHandle: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAvatarUrl: { type: String },
  message: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  dislikedBy: { type: [String], default: [] },
  pinned: { type: Boolean, default: false },
}, { timestamps: true })

const Model = process.env.MONGODB_URI
  ? (mongoose.models.Comment || mongoose.model('Comment', CommentSchema))
  : new LocalModel('comments')

export default Model as mongoose.Model<CommentDoc>
