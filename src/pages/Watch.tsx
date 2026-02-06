import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Save, MoreHorizontal, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VideoAnalytics } from '../components/VideoAnalytics';
import { LiveChat } from '../components/LiveChat';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';

export function Watch() {
  const { id } = useParams();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(true);

  // Mock data
  const video = {
    id: id || '1',
    title: 'Jak vytvořit moderní React aplikaci v roce 2026',
    url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    description: '<p>V tomto videu se podíváme na <strong>nejnovější technologie</strong> v ekosystému Reactu.</p><p>Probereme:</p><ul><li>React 19+ features</li><li>Vite a jeho výhody</li><li>Tailwind CSS pro styling</li></ul>',
    views: 125000,
    likes: 5400,
    shares: 1200,
    uploadedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    channel: {
      name: 'TechGuru CZ',
      subscribers: 50000,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechGuru'
    }
  };

  return (
    <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2">
        {/* Video Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
          <video 
            src={video.url} 
            controls 
            className="w-full h-full object-contain"
            poster={`https://picsum.photos/seed/${id}/1280/720`}
          >
            Váš prohlížeč nepodporuje přehrávání videa.
          </video>
        </div>

        {/* Video Info */}
        <div className="mt-4">
          <h1 className="text-xl font-bold text-gray-900">{video.title}</h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={video.channel.avatar} 
                alt={video.channel.name}
                className="h-10 w-10 rounded-full bg-gray-200"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{video.channel.name}</h3>
                <p className="text-xs text-gray-500">
                  {new Intl.NumberFormat('cs-CZ', { notation: "compact" }).format(video.channel.subscribers)} odběratelů
                </p>
              </div>
              <Button 
                variant={isSubscribed ? "secondary" : "default"}
                className={`ml-4 rounded-full ${isSubscribed ? 'bg-gray-100 text-gray-900' : 'bg-black text-white hover:bg-gray-800'}`}
                onClick={() => setIsSubscribed(!isSubscribed)}
              >
                {isSubscribed ? 'Odebíráno' : 'Odebírat'}
              </Button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <div className="flex items-center bg-gray-100 rounded-full">
                <Button variant="ghost" size="sm" className="rounded-l-full px-4 gap-2 hover:bg-gray-200">
                  <ThumbsUp className="h-5 w-5" />
                  {new Intl.NumberFormat('cs-CZ', { notation: "compact" }).format(video.likes)}
                </Button>
                <div className="w-px h-6 bg-gray-300" />
                <Button variant="ghost" size="sm" className="rounded-r-full px-4 hover:bg-gray-200">
                  <ThumbsDown className="h-5 w-5" />
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full px-4 gap-2 hover:bg-gray-200">
                <Share2 className="h-5 w-5" />
                Sdílet
              </Button>
              
              <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full px-4 gap-2 hover:bg-gray-200">
                <Save className="h-5 w-5" />
                Uložit
              </Button>
              
              <Button variant="ghost" size="icon" className="bg-gray-100 rounded-full hover:bg-gray-200">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 bg-gray-100 rounded-xl p-3 text-sm hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => setShowFullDescription(!showFullDescription)}>
            <div className="font-semibold mb-1">
              {new Intl.NumberFormat('cs-CZ').format(video.views)} zhlédnutí • {formatDistanceToNow(video.uploadedAt, { addSuffix: true, locale: cs })}
            </div>
            <div 
              className={`prose prose-sm max-w-none ${!showFullDescription ? 'line-clamp-2' : ''}`}
              dangerouslySetInnerHTML={{ __html: video.description }}
            />
            <button className="mt-2 font-semibold text-gray-700">
              {showFullDescription ? 'Zobrazit méně' : 'Zobrazit více'}
            </button>
          </div>

          {/* Analytics (Owner only view - mocked) */}
          <VideoAnalytics 
            videoId={video.id} 
            views={video.views} 
            likes={video.likes} 
            shares={video.shares} 
          />

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="font-bold text-xl mb-4">Komentáře</h3>
            {/* Mock Comment Input */}
            <div className="flex gap-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                J
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Přidejte komentář..." 
                  className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
                />
                <div className="flex justify-end mt-2 gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full">Zrušit</Button>
                  <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white" disabled>Komentovat</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar / Recommended Videos / Live Chat */}
              <div className="lg:col-span-1 space-y-6">
                {/* Live Chat Toggle */}
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">
                    {showLiveChat ? 'Živý chat' : 'Další v pořadí'}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowLiveChat(!showLiveChat)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {showLiveChat ? 'Zobrazit doporučené' : 'Zobrazit chat'}
                  </Button>
                </div>

                {showLiveChat ? (
                  <LiveChat videoId={id || '1'} />
                ) : (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex gap-2 cursor-pointer group">
                        <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <img 
                            src={`https://picsum.photos/seed/${i + 100}/320/180`} 
                            alt={`Video ${i}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                            8:45
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600">
                            Doporučené video {i + 1}
                          </h4>
                          <p className="text-xs text-gray-500">Autor Kanálu</p>
                          <p className="text-xs text-gray-500">15 tis. zhlédnutí • před 2 dny</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
    </div>
  );
}
