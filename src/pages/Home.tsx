import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useVideoStore } from '../store/videos';

export function Home() {
  const { videos } = useVideoStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <div key={video.id} className="flex flex-col gap-2 cursor-pointer group">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
              {video.duration}
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <img 
                src={video.channelAvatar} 
                alt={video.channelName}
                className="h-9 w-9 rounded-full bg-gray-200"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600">
                {video.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1 hover:text-gray-700">
                {video.channelName}
              </p>
              <p className="text-xs text-gray-500">
                {new Intl.NumberFormat('cs-CZ', { notation: "compact" }).format(video.views)} zhlédnutí • {formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true, locale: cs })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
