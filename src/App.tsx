import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "@/pages/Home";
import Watch from "@/pages/Watch";
import Channel from "@/pages/Channel";
import Studio from "@/pages/Studio";
import Auth from "@/pages/Auth";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/hooks/useTheme";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "@/components/MobileMenu";
import { SmartAgent } from "@/components/agents/SmartAgent";
import { Search, Sun, Moon, User, LogOut, Video, CircleUserRound, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

// Games
import Prsi from "@/pages/games/Prsi";
import Ludo from "@/pages/games/Ludo";
import Chess from "@/pages/games/Chess";

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const { user, init, hydrated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (hydrated) {
      // Signal to the loader that the app is ready (data + initial render)
      (window as any).IntroLoader?.done();
    }
  }, [hydrated]);

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

  const tone: 'dark' | 'light' = isDark ? 'dark' : 'light';

  return (
    <Router>
      <div className="min-h-dvh flex flex-col bg-bg text-text">
        <header className="sticky top-0 z-40 border-b border-border/10 bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
          <div className="container flex h-14 items-center gap-4">
            <div className="md:hidden">
              <IconButton aria-label="Menu" onClick={() => setMobileNavOpen(true)}>
                <Menu size={20} />
              </IconButton>
            </div>
            <Link to="/" className="flex items-center gap-3">
              <Logo variant="horizontal" tone={tone} className="h-10" />
            </Link>
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
                    const next = query.trim();
                    window.location.href = next ? `/?q=${encodeURIComponent(next)}&sort=latest` : '/';
                  }}
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconButton aria-label="Toggle theme" onClick={toggleTheme}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </IconButton>
              {hydrated && user ? (
                <div className="relative" data-user-menu>
                  <IconButton
                    aria-label="Account"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="overflow-hidden"
                  >
                    <img src={user.avatarUrl} alt={user.displayName} className="h-10 w-10 object-cover" />
                  </IconButton>
                  {menuOpen ? (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/10 bg-surface shadow-soft">
                      <div className="px-3 py-2 border-b border-border/10">
                        <div className="text-sm font-semibold">{user.displayName}</div>
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
                  <Button variant="secondary" className="px-3 sm:px-4">
                    <User size={16} />
                    <span className="hidden sm:inline ml-2">Sign in</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>
        <main className="container flex-1 py-6 animate-fadeUp">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:videoId" element={<Watch />} />
            <Route path="/channel/:handle" element={<Channel />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Games */}
            <Route path="/games/prsi" element={<Prsi />} />
            <Route path="/games/ludo" element={<Ludo />} />
            <Route path="/games/chess" element={<Chess />} />
          </Routes>
        </main>
        <MobileMenu isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <SmartAgent />
        <footer className="border-t border-border/10 bg-surface/50 py-6">
          <div className="container text-center text-sm text-muted">
            &copy; {new Date().getFullYear()} 3Play. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}
