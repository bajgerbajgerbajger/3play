import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

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
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: String }], // Array of User IDs
  dislikedBy: [{ type: String }], // Array of User IDs
  publishedAt: { type: Date },
}, { timestamps: true })

const Model = process.env.MONGODB_URI
  ? (mongoose.models.Video || mongoose.model('Video', VideoSchema))
  : new LocalModel('videos')

export default Model as mongoose.Model<any>
