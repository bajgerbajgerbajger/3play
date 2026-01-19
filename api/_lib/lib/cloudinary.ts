import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/')
    return {
      folder: '3play-uploads',
      resource_type: isVideo ? 'video' : 'image',
      public_id: `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
    }
  },
})

export { cloudinary, storage }
