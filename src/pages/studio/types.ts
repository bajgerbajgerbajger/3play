export type StudioVideo = {
  id: string
  ownerId: string
  title: string
  description: string
  visibility: 'draft' | 'unlisted' | 'published'
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  thumbnailUrl: string
  sourceUrl: string
  durationSeconds: number
  views: number
  likes: number
  dislikes: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type Tab = 'upload' | 'videos' | 'settings'

export const sampleSources = [
  {
    label: 'Big Buck Bunny (Official Platform)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    label: 'Sintel (Official Platform)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  },
  {
    label: 'Tears of Steel (Official Platform)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
] as const

