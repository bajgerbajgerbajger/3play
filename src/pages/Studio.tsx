import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { 
  LayoutDashboard, Video, BarChart2, MessageSquare, Settings, 
  Upload, DollarSign, Edit2, Trash2, Eye, Infinity as InfinityIcon, Cloud
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { STORAGE_LIMITS } from '../config/storage';

export function Studio() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Studio Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-4">
          <div className="flex flex-col items-center mb-6">
            <div className="h-20 w-20 rounded-full bg-gray-200 mb-2 overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=MyDashboard" 
                alt="My Dashboard" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="font-bold text-gray-900">Váš kanál</h2>
            <p className="text-xs text-gray-500">My Dashboard</p>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Přehled
            </button>
            <button 
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'content' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Video className="h-5 w-5" />
              Obsah
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <BarChart2 className="h-5 w-5" />
              Analytika
            </button>
            <button 
              onClick={() => setActiveTab('comments')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'comments' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <MessageSquare className="h-5 w-5" />
              Komentáře
            </button>
            <button 
              onClick={() => setActiveTab('monetization')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'monetization' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <DollarSign className="h-5 w-5" />
              Zpeněžení
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Settings className="h-5 w-5" />
              Nastavení
            </button>
          </nav>

          {/* Storage Indicator */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
              <Cloud className="h-4 w-4" />
              <span>Úložiště</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '1%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Použito: 1.2 GB</span>
              <span className="flex items-center gap-1">
                <InfinityIcon className="h-3 w-3" />
                Neomezeno
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'dashboard' && 'Přehled kanálu'}
            {activeTab === 'content' && 'Obsah kanálu'}
            {activeTab === 'analytics' && 'Analytika kanálu'}
            {activeTab === 'comments' && 'Komentáře'}
            {activeTab === 'monetization' && 'Zpeněžení'}
            {activeTab === 'settings' && 'Nastavení'}
          </h1>
          <Link to="/upload">
            <Button className="bg-red-600 hover:bg-red-700 gap-2">
              <Upload className="h-4 w-4" />
              VYTVOŘIT
            </Button>
          </Link>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest Video Performance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Výkon nejnovějšího videa</h3>
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                <img src="https://picsum.photos/seed/latest/640/360" alt="Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">10:24</div>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Jak začít s programováním v roce 2026</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Zhlédnutí</span>
                  <span className="font-medium">1,245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Míra prokliku (CTR)</span>
                  <span className="font-medium">5.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Průměrná doba sledování</span>
                  <span className="font-medium">4:12</span>
                </div>
              </div>
              <Button variant="link" className="mt-2 px-0 text-blue-600">Přejít na analýzu videa</Button>
            </div>

            {/* Analytics Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Analytika kanálu</h3>
              <p className="text-sm text-gray-500 mb-1">Aktuální počet odběratelů</p>
              <p className="text-3xl font-bold text-gray-900 mb-4">1,842</p>
              <p className="text-xs text-green-600 mb-6">+12 za posledních 28 dní</p>
              
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Zhlédnutí (28 dní)</span>
                    <span className="font-medium">12.5 tis.</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Doba sledování (hodiny)</span>
                    <span className="font-medium">458.2</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
              <Button variant="link" className="mt-4 px-0 text-blue-600">Přejít na analýzu kanálu</Button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Nedávná aktivita</h3>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Nový komentář od uživatele <span className="text-blue-600">Karel Novák</span></p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">"Super video, díky moc za vysvětlení!"</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" className="h-6 text-xs">Odpovědět</Button>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-red-600 hover:text-red-700">Smazat</Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 items-start pt-3 border-t border-gray-100">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Nový odběratel: <span className="text-blue-600">Jana Dvořáková</span></p>
                    <p className="text-xs text-gray-500 mt-1">Před 2 hodinami</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Video</th>
                    <th className="px-6 py-3">Viditelnost</th>
                    <th className="px-6 py-3">Datum</th>
                    <th className="px-6 py-3">Zhlédnutí</th>
                    <th className="px-6 py-3">Komentáře</th>
                    <th className="px-6 py-3">Líbí se</th>
                    <th className="px-6 py-3">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex gap-3 items-center min-w-[300px]">
                        <div className="h-16 w-28 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img src={`https://picsum.photos/seed/${i + 20}/160/90`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-2">Testovací video {i + 1} - Jak na to</p>
                          <p className="text-xs text-gray-500 mt-1">Popis videa...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Veřejné
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        24. 1. 2026
                      </td>
                      <td className="px-6 py-4">
                        {1200 + i * 50}
                      </td>
                      <td className="px-6 py-4">
                        {15 + i}
                      </td>
                      <td className="px-6 py-4">
                        {(95 + i * 2)}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-gray-400 hover:text-gray-600"><Edit2 className="h-4 w-4" /></button>
                          <button className="text-gray-400 hover:text-gray-600"><Eye className="h-4 w-4" /></button>
                          <button className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other tabs placeholders */}
        {['analytics', 'comments', 'monetization', 'settings'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            <Settings className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Tato sekce se připravuje</p>
            <p className="text-sm">Brzy zde najdete podrobné nástroje pro správu vašeho kanálu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
