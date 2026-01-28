import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

export type VideoDoc = {
  id: string
  ownerId: string
  title: string
  description?: string
  type: 'video' | 'movie' | 'episode'
  visibility: 'draft' | 'unlisted' | 'published'
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  thumbnailUrl?: string
  sourceUrl?: string
  embedCode?: string
  durationSeconds: number
  tags?: string[]
  category?: string
  views: number
  likes: number
  dislikes: number
  likedBy: string[]
  dislikedBy: string[]
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const VideoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true, ref: 'Profile' }, // Reference by string ID
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['video', 'movie', 'episode'],
    default: 'video'
  },
  visibility: { 
    type: String, 
    enum: ['draft', 'unlisted', 'published'], 
    default: 'draft' 
  },
  status: { 
    type: String, 
    enum: ['uploading', 'processing', 'ready', 'failed'], 
    default: 'processing' 
  },
  thumbnailUrl: { type: String },
  sourceUrl: { type: String },
  embedCode: { type: String },
  durationSeconds: { type: Number, default: 0 },
  tags: [{ type: String }],
  category: { type: String, default: 'People & Blogs' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: String }], // Array of User IDs
  dislikedBy: [{ type: String }], // Array of User IDs
  publishedAt: { type: Date },
}, { timestamps: true })

// Add text index for search
VideoSchema.index({ title: 'text', description: 'text' })
// Add compound index for common filtering
VideoSchema.index({ visibility: 1, status: 1, publishedAt: -1 })

const Model = process.env.MONGODB_URI
  ? (mongoose.models.Video || mongoose.model('Video', VideoSchema))
  : new LocalModel('videos')

export default Model as mongoose.Model<VideoDoc>
