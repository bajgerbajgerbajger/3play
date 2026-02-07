import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Video } from '../types';

interface VideoState {
  videos: Video[];
  addVideo: (video: Video) => void;
  deleteVideo: (id: string) => void;
  setVideos: (videos: Video[]) => void;
}

// Initial mock videos to populate the platform
const MOCK_VIDEOS: Video[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `mock-${i}`,
  title: `Video Title ${i + 1} - Ukázka obsahu`,
  description: 'Toto je ukázkové video pro testování platformy.',
  thumbnail: `https://picsum.photos/seed/${i}/320/180`,
  channelName: `Kanál ${i + 1}`,
  channelAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  views: Math.floor(Math.random() * 1000000),
  uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  duration: "10:30"
}));

export const useVideoStore = create<VideoState>()(
  persist(
    (set) => ({
      videos: MOCK_VIDEOS,
      addVideo: (video) => set((state) => ({ videos: [video, ...state.videos] })),
      deleteVideo: (id) => set((state) => ({ videos: state.videos.filter((v) => v.id !== id) })),
      setVideos: (videos) => set({ videos }),
    }),
    {
      name: 'video-storage',
    }
  )
);
