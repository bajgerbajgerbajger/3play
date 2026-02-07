import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Video, User as UserIcon, LogOut, Settings, LayoutDashboard, Globe, Play } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { Button } from './ui/Button';
import { Notifications } from './Notifications';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { i18n } = useTranslation();

  const languages = [
    { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
    { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'rom', name: 'Romština', flag: '🌍' },
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setShowLangMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:bg-red-700 transition-colors">
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-red-600 transition-colors">3Play</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Hledat..."
            className="w-full h-10 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button className="absolute right-0 top-0 h-10 w-16 bg-gray-100 border-l border-gray-300 rounded-r-full flex items-center justify-center hover:bg-gray-200">
            <Search className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <div className="relative mr-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowLangMenu(!showLangMenu)}
            title="Změnit jazyk"
          >
            <Globe className="h-5 w-5 text-gray-600" />
          </Button>

          {showLangMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 max-h-80 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left",
                    i18n.language === lang.code ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <>
            <Button variant="ghost" size="icon">
              <Video className="h-6 w-6" />
            </Button>
            <Notifications />
            
            <div className="relative ml-2">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-500" />
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                  
                  <Link 
                    to={`/channel/${user?.id}`}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>
                  
                  <Link 
                    to="/studio"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    My Dashboard
                  </Link>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <Link 
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Nastavení
                  </Link>
                  
                  <button 
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Odhlásit se
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login">
            <Button variant="outline" className="gap-2 text-blue-600 border-gray-200">
              <UserIcon className="h-4 w-4" />
              Přihlásit se
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
