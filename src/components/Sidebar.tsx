import { Home, Compass, PlaySquare, Clock, ThumbsUp, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Domů', path: '/' },
    { icon: Compass, label: 'Prozkoumat', path: '/explore' },
    { icon: PlaySquare, label: 'Shorts', path: '/shorts' },
    { icon: User, label: 'Odběry', path: '/subscriptions' },
    { icon: Clock, label: 'Historie', path: '/history' },
    { icon: ThumbsUp, label: 'Líbí se mi', path: '/liked' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r overflow-y-auto hidden md:block">
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "fill-current" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t my-2 mx-4"></div>
      
      <div className="px-4 py-2">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Odběry</h3>
        {/* Mock subscriptions list */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <div className="h-6 w-6 rounded-full bg-gray-200" />
              <span className="text-sm text-gray-700 truncate">Kanál {i}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
