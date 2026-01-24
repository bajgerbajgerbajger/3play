import mongoose from 'mongoose'
import { LocalModel } from '../lib/local-db-adapter.js'

export type EmailVerificationCodeDoc = {
  email: string
  code: string
  expiresAt: Date
  used: boolean
  attempts: number
  createdAt: Date
  updatedAt: Date
}

const EmailVerificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
}, { timestamps: true })

const Model = process.env.MONGODB_URI
  ? (mongoose.models.EmailVerificationCode || mongoose.model('EmailVerificationCode', EmailVerificationCodeSchema))
  : new LocalModel('codes')

export default Model as mongoose.Model<EmailVerificationCodeDoc>

