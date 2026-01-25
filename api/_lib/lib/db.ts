import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  // Warn only, don't crash, so build can pass if env vars are missing
  console.warn('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
type Cached = { conn: mongoose.Mongoose | null; promise: Promise<mongoose.Mongoose> | null }
const g = globalThis as unknown as { mongoose?: Cached }
const cached: Cached = g.mongoose ?? { conn: null, promise: null }
if (!g.mongoose) {
  g.mongoose = cached
}

async function dbConnect() {
  if (!MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('MONGODB_URI is not defined. Falling back to in-memory/local database (changes may be ephemeral).')
    }
    console.log('Running in Local Mode (db.json)')
    return null
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Fail fast if we can't connect (5s)
      socketTimeoutMS: 45000,
    }

    console.log('Connecting to MongoDB...')
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully')
      return mongoose
    }).catch((err) => {
      console.error('MongoDB connection failed immediately:', err)
      throw err
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('MongoDB connection error:', e)
    throw e
  }

  return cached.conn
}

export default dbConnect
