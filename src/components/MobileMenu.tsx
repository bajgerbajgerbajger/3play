import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Home, 
  Flame, 
  Gamepad2, 
  User, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  ChevronUp,
  Video,
  Sun,
  Moon
} from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [gamesOpen, setGamesOpen] = useState(true);

  // Close menu when route changes
  React.useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-surface/90 backdrop-blur-xl border-r border-border/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/10">
              <Logo className="h-8" />
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              
              {/* Main Navigation */}
              <div className="space-y-1">
                <NavItem to="/" icon={<Home size={20} />} label="Domů" onClick={onClose} />
                <NavItem to="/subscriptions" icon={<Video size={20} />} label="Odebírané" onClick={onClose} />
                <NavItem to="/?sort=popular" icon={<Flame size={20} />} label="Trendy" onClick={onClose} />
              </div>

              {/* Games Section */}
              <div className="space-y-1">
                <button 
                  onClick={() => setGamesOpen(!gamesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Gamepad2 size={20} className="text-primary" />
                    <span>Hry</span>
                  </div>
                  {gamesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                <AnimatePresence>
                  {gamesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 space-y-1 mt-1 border-l-2 border-white/5 ml-4">
                        <NavItem to="/games/prsi" label="Prší" onClick={onClose} small />
                        <NavItem to="/games/ludo" label="Člověče, nezlob se" onClick={onClose} small />
                        <NavItem to="/games/chess" label="Šachy" onClick={onClose} small />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Settings Section */}
              <div className="space-y-1">
                 <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-white/5 transition-colors"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{isDark ? 'Světlý režim' : 'Tmavý režim'}</span>
                </button>
              </div>

              {/* User Section */}
              <div className="pt-4 border-t border-border/10">
                {user ? (
                  <div className="space-y-4">
                    <div className="px-3 flex items-center gap-3">
                      <Avatar 
                        src={user.avatarUrl} 
                        alt={user.displayName} 
                        gender={user.gender}
                        className="w-10 h-10 border border-border/20"
                        size="custom"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{user.displayName}</div>
                        <div className="text-xs text-muted truncate">{user.handle}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <NavItem to={`/channel/${user.handle}`} icon={<User size={20} />} label="Můj kanál" onClick={onClose} />
                      <NavItem to="/studio" icon={<Video size={20} />} label="Studio" onClick={onClose} />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={20} />
                        <span>Odhlásit se</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 px-1">
                    <div className="text-sm text-muted px-2 mb-2">Přihlášení</div>
                    <Link to="/auth" onClick={onClose} className="block">
                      <Button className="w-full justify-center gap-2">
                        <LogIn size={18} />
                        Přihlásit se
                      </Button>
                    </Link>
                    <Link to="/auth?mode=register" onClick={onClose} className="block">
                      <Button variant="secondary" className="w-full justify-center">
                        Registrovat
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/10 text-xs text-muted text-center">
              <p>&copy; 2026 3Play</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NavItem({ 
  to, 
  icon, 
  label, 
  onClick, 
  small = false 
}: { 
  to: string; 
  icon?: React.ReactNode; 
  label: string; 
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/5",
        small ? "text-sm text-muted hover:text-text" : "font-medium"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
