import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  videoId: { type: String, required: true, ref: 'Video' },
  authorHandle: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAvatarUrl: { type: String },
  message: { type: String, required: true },
  likes: { type: Number, default: 0 },
}, { timestamps: true })

export default (mongoose.models.Comment || mongoose.model('Comment', CommentSchema)) as mongoose.Model<any>
