import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, LogOut, Video, CircleUserRound, Menu, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/hooks/useTheme";
import { IconButton } from "@/components/ui/IconButton";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { Notifications } from "@/components/Notifications";
import { LiveChat } from "@/components/chat/LiveChat";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { isDark } = useTheme();
  const { user, hydrated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-user-menu]')) return;
      setMenuOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  // Update query when URL changes
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    if (q !== null) {
      setQuery(q);
    } else if (location.pathname === '/') {
        setQuery('');
    }
  }, [location.search, location.pathname]);

  const handleSearch = () => {
    const next = query.trim();
    if (next) {
        navigate(`/?q=${encodeURIComponent(next)}&sort=latest`);
    } else {
        navigate('/');
    }
  };

  const tone: 'dark' | 'light' = isDark ? 'dark' : 'light';

  const isActive = (path: string, sort?: string) => {
    if (path === '/' && sort) {
      return location.pathname === '/' && new URLSearchParams(location.search).get('sort') === sort;
    }
    if (path === '/' && !sort) {
       // Home is active if path is / and sort is not popular (default or latest)
       const currentSort = new URLSearchParams(location.search).get('sort');
       return location.pathname === '/' && (!currentSort || currentSort === 'latest');
    }
    return location.pathname === path;
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/10 bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="container flex h-14 items-center gap-4">
        <div>
          <IconButton aria-label="Menu" onClick={onOpenMobileMenu}>
            <Menu size={20} />
          </IconButton>
        </div>
        <Link to="/" className="flex items-center gap-3">
          <Logo variant="horizontal" tone={tone} className="h-10" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Link 
            to="/" 
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors", 
              isActive('/', undefined) ? "bg-white/10 text-text" : "text-muted hover:text-text hover:bg-white/5"
            )}
          >
            Domů
          </Link>
          <Link 
            to="/subscriptions" 
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors", 
              isActive('/subscriptions') ? "bg-white/10 text-text" : "text-muted hover:text-text hover:bg-white/5"
            )}
          >
            Odebírané
          </Link>
          <Link 
            to="/?sort=popular" 
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors", 
              isActive('/', 'popular') ? "bg-white/10 text-text" : "text-muted hover:text-text hover:bg-white/5"
            )}
          >
            Trendy
          </Link>
        </nav>

        <div className="flex-1" />
        
        <div className="hidden md:flex w-[380px] items-center gap-2">
          <div className="relative w-full">
            <Input
              aria-label="Search"
              placeholder="Search videos and channels"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                handleSearch();
              }}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hydrated && user && <Notifications />}
          <IconButton 
            aria-label="Chat"
            onClick={() => user ? setChatOpen(true) : navigate('/auth')}
            className={chatOpen ? 'bg-white/10 text-brand' : ''}
          >
            <MessageSquare size={18} />
          </IconButton>
          {hydrated && user ? (
            <div className="relative" data-user-menu>
              <IconButton
                aria-label="Account"
                onClick={() => setMenuOpen((v) => !v)}
                className="overflow-hidden"
              >
                <Avatar 
                  src={user.avatarUrl} 
                  alt={user.displayName} 
                  gender={user.gender}
                  className="h-10 w-10"
                />
              </IconButton>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/10 bg-surface shadow-soft">
                  <div className="px-3 py-2 border-b border-border/10">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {user.displayName}
                      {user.newAccount && (
                        <span className="bg-brand/20 text-brand text-[10px] px-1.5 py-0.5 rounded font-bold border border-brand/20">NEW</span>
                      )}
                    </div>
                    <div className="text-xs text-muted">{user.handle}</div>
                  </div>
                  <Link to={`/channel/${encodeURIComponent(user.handle)}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5">
                    <CircleUserRound size={16} />
                    Channel
                  </Link>
                  <Link to="/studio" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5">
                    <Video size={16} />
                    Studio
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="primary" size="sm" className="gap-2">
                <User size={16} />
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
    <LiveChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
