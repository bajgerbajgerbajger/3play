import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Video } from '../types';

interface VideoState {
  videos: Video[];
  addVideo: (video: Video) => void;
  deleteVideo: (id: string) => void;
  setVideos: (videos: Video[]) => void;
}

// Initial state is empty for real application usage
const MOCK_VIDEOS: Video[] = [];

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
      version: 1,
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // Migration from version 0 to 1: Add videoUrl to all videos if missing
          return {
            ...persistedState,
            videos: persistedState.videos.map((v: Video) => ({
              ...v,
              videoUrl: v.videoUrl || 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4'
            }))
          };
        }
        return persistedState as VideoState;
      },
    }
  )
);
