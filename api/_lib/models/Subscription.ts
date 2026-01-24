import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

export type SubscriptionDoc = {
  subscriberId: string
  channelId: string
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new mongoose.Schema({
  subscriberId: { type: String, required: true, index: true }, // The user who is subscribing
  channelId: { type: String, required: true, index: true },    // The channel being subscribed to
}, { timestamps: true })

// Compound index to prevent duplicate subscriptions
SubscriptionSchema.index({ subscriberId: 1, channelId: 1 }, { unique: true })

const Model = process.env.MONGODB_URI
  ? (mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema))
  : new LocalModel('subscriptions')

export default Model as mongoose.Model<SubscriptionDoc>
