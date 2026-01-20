import mongoose from 'mongoose'

const EmailVerificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
}, { timestamps: true })

export default (mongoose.models.EmailVerificationCode || mongoose.model('EmailVerificationCode', EmailVerificationCodeSchema)) as mongoose.Model<any>

