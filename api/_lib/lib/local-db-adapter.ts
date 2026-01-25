import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Navigate from api/_lib/lib/local-db-adapter.ts to api/_lib/data/db.json
const DB_PATH = path.resolve(__dirname, '../data/db.json')

type DBRecord = Record<string, unknown>
interface DBData {
  [key: string]: DBRecord[]
}

// Basic ID generator
const generateId = (prefix: string = '') => {
  return prefix + Math.random().toString(36).substring(2, 10)
}

// Helper to check if object matches query
function matchesQuery(item: DBRecord, query: Record<string, unknown>): boolean {
  if (!query || typeof query !== 'object') return true

  for (const key in query) {
    const qVal = query[key]

    if (key === '$or') {
      const arr = qVal as unknown
      if (!Array.isArray(arr)) return false
      if (!arr.some((sub) => matchesQuery(item, sub as Record<string, unknown>))) return false
      continue
    }

    if (key === '$and') {
      const arr = qVal as unknown
      if (!Array.isArray(arr)) return false
      if (!arr.every((sub) => matchesQuery(item, sub as Record<string, unknown>))) return false
      continue
    }

    const iVal = (item as Record<string, unknown>)?.[key]

    if (qVal instanceof RegExp) {
      if (typeof iVal !== 'string') return false
      if (!qVal.test(iVal)) return false
      continue
    }

    if (qVal && typeof qVal === 'object' && !Array.isArray(qVal)) {
      const obj = qVal as Record<string, unknown>
      if ('$in' in obj) {
        const list = obj.$in as unknown
        if (!Array.isArray(list)) return false
        if (!list.includes(iVal)) return false
        continue
      }
    }

    if (qVal !== iVal) return false
  }

  return true
}

let cachedDB: DBData | null = null

async function getDB(): Promise<DBData> {
  if (cachedDB) return cachedDB

  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    cachedDB = JSON.parse(data)
    return cachedDB!
  } catch {
    // If file doesn't exist, return empty structure
    cachedDB = { users: [], videos: [], profiles: [], codes: [], comments: [] }
    return cachedDB!
  }
}

async function saveDB(data: DBData) {
  cachedDB = data // Update cache immediately so read-only environments still "work" in memory
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('[LocalDB] Warning: Failed to save database (filesystem might be read-only). Changes will not persist.', err)
  }
}

type HydratedDoc<T extends DBRecord> = T & {
  save: () => Promise<HydratedDoc<T> | null>
  toObject: () => T
}

export class LocalModel<T extends DBRecord = DBRecord> {
  collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  async countDocuments(query: Record<string, unknown> = {}) {
    const items = await this.find(query)
    return items.length
  }

  // Helper to convert raw data to "document" with save() method
  _hydrate(item: T | null): HydratedDoc<T> | null {
    if (!item) return null
    const collectionName = this.collectionName
    return {
      ...item,
      // Mongoose-like methods
      save: async function() {
        const db = await getDB()
        const list = (db[collectionName] || []) as DBRecord[]
        const idx = list.findIndex((i: DBRecord) => (i as Record<string, unknown>).id === (this as unknown as Record<string, unknown>).id || (i as Record<string, unknown>)._id === (this as unknown as Record<string, unknown>)._id)
        
        // Remove save method before writing to JSON
        const { save: _save, ...dataToSave } = this as unknown as Record<string, unknown>
        void _save
        
        if (idx >= 0) {
          list[idx] = dataToSave
        } else {
          list.push(dataToSave)
        }
        db[collectionName] = list
        await saveDB(db)
        const saved = list[idx >= 0 ? idx : list.length - 1] as T
        return (new LocalModel<T>(collectionName))._hydrate(saved)
      },
      toObject: function() {
        const { save: _save, toObject: _toObject, ...rest } = this as unknown as Record<string, unknown>
        void _save
        void _toObject
        return rest as T
      }
    }
  }

  async findOne(query: Record<string, unknown>) {
    const db = await getDB()
    const list = (db[this.collectionName] || []) as DBRecord[]
    const item = list.find((i: DBRecord) => matchesQuery(i, query)) as T | undefined
    return this._hydrate(item ?? null)
  }

  async find(query: Record<string, unknown> = {}) {
    const db = await getDB()
    const list = (db[this.collectionName] || []) as DBRecord[]
    const items = list.filter((i: DBRecord) => matchesQuery(i, query)) as T[]
    return items.map(i => this._hydrate(i)!)
  }

  async findById(id: string) {
    return this.findOne({ id })
  }

  async create(data: T) {
    const db = await getDB()
    const list = (db[this.collectionName] || []) as DBRecord[]
    
    const newItem = {
      ...data,
      id: (data as Record<string, unknown>).id || generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    list.push(newItem)
    db[this.collectionName] = list
    await saveDB(db)
    return this._hydrate(newItem as T)
  }

  // Basic implementation of findOneAndUpdate for EmailVerificationCode
  async findOneAndUpdate(query: Record<string, unknown>, update: Record<string, unknown>, options: Record<string, unknown> = {}) {
    const doc = await this.findOne(query)
    
    if (!doc && (options as Record<string, unknown>).upsert) {
      // Merge query and update to create new
      const newData = { ...query, ...update } as T
      return this.create(newData)
    }

    if (doc) {
      // Apply updates
      Object.assign(doc, update)
      // If there are $set operators (common in Mongoose), handle them
      if ((update as Record<string, unknown>).$set) {
        Object.assign(doc as Record<string, unknown>, (update as Record<string, unknown>).$set as Record<string, unknown>)
      }
      
      // Save logic is manual here since we are mocking
      const db = await getDB()
      const list = (db[this.collectionName] || []) as DBRecord[]
      const idx = list.findIndex((i: DBRecord) => matchesQuery(i, query))
      
      if (idx >= 0) {
        const { save: _save, ...dataToSave } = doc as unknown as Record<string, unknown>
        void _save
        list[idx] = dataToSave
        db[this.collectionName] = list
        await saveDB(db)
      }
      
      return doc
    }
    
    return null
  }
  
  // Sort, limit, etc. are chainable in Mongoose, but hard to mock fully.
  // We'll return the promise directly for basic calls.
  // If usage involves .sort(), this will crash. We might need a Proxy.
}

// Proxy to handle chainable methods like .sort().limit() if needed
// For now, let's hope basic usage is simple.
