import { v2 as cloudinary } from 'cloudinary'
import * as multerStorageCloudinary from 'multer-storage-cloudinary'

// Handle CloudinaryStorage export which might be a default export or named export depending on environment
const CloudinaryStorage = (multerStorageCloudinary as any).CloudinaryStorage || (multerStorageCloudinary as any).default?.CloudinaryStorage || multerStorageCloudinary.default

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    const isVideo = file.mimetype.startsWith('video/')
    return {
      folder: '3play-uploads',
      resource_type: isVideo ? 'video' : 'image',
      public_id: `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
    }
  },
})

export { cloudinary, storage }
