import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Navigate from api/_lib/lib/local-db-adapter.ts to api/_lib/data/db.json
const DB_PATH = path.resolve(__dirname, '../data/db.json')

interface DBData {
  [key: string]: any[]
}

// Basic ID generator
const generateId = (prefix: string = '') => {
  return prefix + Math.random().toString(36).substring(2, 10)
}

// Helper to check if object matches query
function matchesQuery(item: any, query: any): boolean {
  for (const key in query) {
    if (query[key] !== item[key]) return false
  }
  return true
}

async function getDB(): Promise<DBData> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    // If file doesn't exist, return empty structure
    return { users: [], videos: [], profiles: [], codes: [] }
  }
}

async function saveDB(data: DBData) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export class LocalModel {
  collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  // Helper to convert raw data to "document" with save() method
  _hydrate(item: any) {
    if (!item) return null
    const self = this
    return {
      ...item,
      // Mongoose-like methods
      save: async function() {
        const db = await getDB()
        const list = db[self.collectionName] || []
        const idx = list.findIndex((i: any) => i.id === this.id || i._id === this._id)
        
        // Remove save method before writing to JSON
        const { save, ...dataToSave } = this
        
        if (idx >= 0) {
          list[idx] = dataToSave
        } else {
          list.push(dataToSave)
        }
        db[self.collectionName] = list
        await saveDB(db)
        return self._hydrate(list[idx >= 0 ? idx : list.length - 1])
      },
      toObject: function() {
        const { save, toObject, ...rest } = this
        return rest
      }
    }
  }

  async findOne(query: any) {
    const db = await getDB()
    const list = db[this.collectionName] || []
    const item = list.find((i: any) => matchesQuery(i, query))
    return this._hydrate(item)
  }

  async find(query: any = {}) {
    const db = await getDB()
    const list = db[this.collectionName] || []
    const items = list.filter((i: any) => matchesQuery(i, query))
    return items.map(i => this._hydrate(i))
  }

  async findById(id: string) {
    return this.findOne({ id })
  }

  async create(data: any) {
    const db = await getDB()
    const list = db[this.collectionName] || []
    
    const newItem = {
      ...data,
      id: data.id || generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    list.push(newItem)
    db[this.collectionName] = list
    await saveDB(db)
    return this._hydrate(newItem)
  }

  // Basic implementation of findOneAndUpdate for EmailVerificationCode
  async findOneAndUpdate(query: any, update: any, options: any = {}) {
    let doc = await this.findOne(query)
    
    if (!doc && options.upsert) {
      // Merge query and update to create new
      const newData = { ...query, ...update }
      return this.create(newData)
    }

    if (doc) {
      // Apply updates
      Object.assign(doc, update)
      // If there are $set operators (common in Mongoose), handle them
      if (update.$set) {
        Object.assign(doc, update.$set)
      }
      
      // Save logic is manual here since we are mocking
      const db = await getDB()
      const list = db[this.collectionName] || []
      const idx = list.findIndex((i: any) => matchesQuery(i, query))
      
      if (idx >= 0) {
        const { save, ...dataToSave } = doc
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
