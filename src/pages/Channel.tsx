import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Settings, List } from 'lucide-react';

export function Channel() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'videos' | 'about' | 'playlists'>('videos');

  // Mock data
  const profile = {
    id: id || '1',
    name: 'TechGuru CZ',
    handle: '@techgurucz',
    subscribers: 50000,
    videos: 142,
    description: 'Vše o technologiích, programování a novinkách ze světa IT.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechGuru',
    banner: 'https://picsum.photos/seed/techguru/1200/300'
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Banner */}
      <div className="h-40 md:h-60 w-full bg-gray-200 rounded-xl overflow-hidden mb-6">
        <img 
          src={profile.banner} 
          alt="Profile Banner" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 px-4">
        <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white -mt-12 md:-mt-16 z-10">
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-500 text-sm mb-2">{profile.handle} • {new Intl.NumberFormat('cs-CZ').format(profile.subscribers)} odběratelů • {profile.videos} videí</p>
          <p className="text-gray-600 line-clamp-2 max-w-2xl">{profile.description}</p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button className="rounded-full bg-black text-white hover:bg-gray-800">
            Odebírat
          </Button>
          <Button variant="outline" className="rounded-full">
            Připojit se
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6 px-4">
          <button 
            onClick={() => setActiveTab('videos')}
            className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'videos' ? 'text-black' : 'text-gray-500 hover:text-black'}`}
          >
            Videa
            {activeTab === 'videos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </button>
          <button 
            onClick={() => setActiveTab('playlists')}
            className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'playlists' ? 'text-black' : 'text-gray-500 hover:text-black'}`}
          >
            Playlisty
            {activeTab === 'playlists' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'about' ? 'text-black' : 'text-gray-500 hover:text-black'}`}
          >
            Informace
            {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden mb-2">
                  <img 
                    src={`https://picsum.photos/seed/${i + 500}/320/180`} 
                    alt={`Video ${i}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    12:30
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
                  Jak naprogramovat vlastní sociální síť - Část {i + 1}
                </h3>
                <p className="text-sm text-gray-500">1.2 tis. zhlédnutí • před 3 dny</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="font-bold text-lg mb-4">Popis</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.description}</p>
              <p className="mt-4 text-gray-700">
                Vítejte na mém kanálu! Jsem vývojář s vášní pro React, TypeScript a moderní webové technologie.
                Každý týden vydávám nová videa o programování.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Statistiky</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>Připojen(a): 1. 1. 2024</p>
                <p>{new Intl.NumberFormat('cs-CZ').format(1524890)} zhlédnutí</p>
                <div className="pt-4 border-t">
                  <Button variant="ghost" size="sm" className="w-full justify-start px-0 text-gray-600">
                    <Settings className="h-4 w-4 mr-2" />
                    Nahlásit uživatele
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="text-center py-10 text-gray-500">
            <List className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Žádné playlisty k zobrazení</p>
          </div>
        )}
      </div>
    </div>
  );
}
