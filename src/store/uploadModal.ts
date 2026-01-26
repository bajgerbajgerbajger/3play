import { create } from 'zustand'

type UploadModalStore = {
  isOpen: boolean
  progress: number
  speed: string
  timeRemaining: string
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error'
  error: string | null
  
  open: () => void
  close: () => void
  setProgress: (progress: number) => void
  setStats: (speed: string, time: string) => void
  setStatus: (status: UploadModalStore['status']) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useUploadModal = create<UploadModalStore>((set) => ({
  isOpen: false,
  progress: 0,
  speed: '',
  timeRemaining: '',
  status: 'idle',
  error: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setProgress: (progress) => set({ progress }),
  setStats: (speed, time) => set({ speed, timeRemaining: time }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),
  reset: () => set({ 
    progress: 0, 
    speed: '', 
    timeRemaining: '', 
    status: 'idle', 
    error: null 
  })
}))
