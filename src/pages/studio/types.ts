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
    url: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
  },
  {
    label: 'Sintel (Official Platform)',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
  },
  {
    label: 'Tears of Steel (Official Platform)',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
  },
] as const

