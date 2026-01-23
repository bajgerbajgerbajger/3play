import mongoose, { Document, Schema } from 'mongoose'

export interface IChannel extends Document {
  ownerId: mongoose.Types.ObjectId
  handle: string
  displayName: string
  description?: string
  avatarUrl?: string
  bannerUrl?: string
  subscribersCount: number
  videosCount: number
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

const ChannelSchema = new Schema<IChannel>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    handle: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    description: { type: String },
    avatarUrl: { type: String },
    bannerUrl: { type: String },
    subscribersCount: { type: Number, default: 0 },
    videosCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Index for search
ChannelSchema.index({ displayName: 'text', handle: 'text' })

export const Channel = mongoose.models.Channel || mongoose.model<IChannel>('Channel', ChannelSchema)
