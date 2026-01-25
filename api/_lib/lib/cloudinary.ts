import { v2 as cloudinary } from 'cloudinary'
import * as multerStorageCloudinary from 'multer-storage-cloudinary'
import multer, { type StorageEngine } from 'multer'
import type { Request } from 'express'
import path from 'path'
import fs from 'fs'

// Handle CloudinaryStorage export which might be a default export or named export depending on environment
type CloudinaryCtor = new (opts: object) => StorageEngine
type MaybeModule = { CloudinaryStorage?: unknown; default?: unknown }
function resolveCloudinaryCtor(mod: unknown): CloudinaryCtor | null {
  const m = mod as MaybeModule
  if (typeof m.CloudinaryStorage === 'function') return m.CloudinaryStorage as CloudinaryCtor
  if (m.default) {
    const d = m.default as MaybeModule | unknown
    if (typeof d === 'function') return d as unknown as CloudinaryCtor
    const dd = d as MaybeModule
    if (typeof dd.CloudinaryStorage === 'function') return dd.CloudinaryStorage as CloudinaryCtor
  }
  return null
}
const CloudinaryStorage = resolveCloudinaryCtor(multerStorageCloudinary)

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

let storage: StorageEngine
if (CloudinaryStorage) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: Request, file: Express.Multer.File) => {
      const isVideo = file.mimetype.startsWith('video/')
      return {
        folder: '3play-uploads',
        resource_type: isVideo ? 'video' : 'image',
        public_id: `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      }
    },
  })
} else {
  const uploadDir = path.resolve('uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(file.originalname)
      cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    },
  })
}

export { cloudinary, storage }
