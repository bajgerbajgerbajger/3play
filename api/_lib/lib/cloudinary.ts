import { v2 as cloudinary } from 'cloudinary'
import * as multerStorageCloudinary from 'multer-storage-cloudinary'
import type { Request } from 'express'
import type { StorageEngine } from 'multer'

// Handle CloudinaryStorage export which might be a default export or named export depending on environment
type CloudinaryCtor = new (opts: object) => StorageEngine
const ms = multerStorageCloudinary as unknown as { CloudinaryStorage?: CloudinaryCtor; default?: { CloudinaryStorage?: CloudinaryCtor } }

const CloudinaryStorage = ms.CloudinaryStorage || (ms.default as any)?.CloudinaryStorage || ms.default

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

let storage: StorageEngine | undefined
if (CloudinaryStorage && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
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
}

export { cloudinary, storage }
