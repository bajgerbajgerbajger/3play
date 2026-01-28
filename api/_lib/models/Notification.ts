import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

export type NotificationDoc = {
  id: string
  userId: string
  actorId?: string
  actorName?: string
  actorAvatarUrl?: string
  type: 'comment' | 'reply' | 'like' | 'subscribe' | 'system'
  title: string
  message?: string
  resourceId?: string
  link?: string
  isRead: boolean
  createdAt: Date
}

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  actorId: { type: String },
  actorName: { type: String },
  actorAvatarUrl: { type: String },
  type: { 
    type: String, 
    enum: ['comment', 'reply', 'like', 'subscribe', 'system'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String },
  resourceId: { type: String },
  link: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true })

const Model = process.env.MONGODB_URI
  ? (mongoose.models.Notification || mongoose.model('Notification', NotificationSchema))
  : new LocalModel('notifications')

export default Model as mongoose.Model<NotificationDoc>
