import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
}

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveChat({ isOpen, onClose }: LiveChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock initial messages
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          userId: 'system',
          userName: 'System',
          content: 'Vítejte v živé diskuzi 3Play!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Tester',
          content: 'Ahoj všem, jak se líbí nová platforma?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.displayName || 'User',
      userAvatar: user.avatarUrl,
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-surface border-l border-border/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border/10 flex items-center justify-between bg-surface2/50 backdrop-blur-sm">
        <div>
          <h3 className="font-heading font-bold text-lg">Živá diskuze</h3>
          <p className="text-xs text-muted">Online komunita 3Play</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-text"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg) => {
          const isMe = user && msg.userId === user.id;
          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-3 max-w-[85%]",
                isMe ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className="flex-shrink-0">
                {msg.userId === 'system' ? (
                   <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand">
                     <span className="text-xs font-bold">SYS</span>
                   </div>
                ) : (
                  msg.userAvatar ? (
                    <img src={msg.userAvatar} alt={msg.userName} className="w-8 h-8 rounded-full object-cover border border-border/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-muted">
                      <UserIcon size={14} />
                    </div>
                  )
                )}
              </div>
              
              <div className={cn(
                "flex flex-col",
                isMe ? "items-end" : "items-start"
              )}>
                <span className="text-[10px] text-muted mb-1 px-1">
                  {msg.userName} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className={cn(
                  "px-3 py-2 rounded-2xl text-sm break-words shadow-sm",
                  isMe 
                    ? "bg-brand text-white rounded-tr-sm" 
                    : "bg-surface2 text-text rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/10 bg-surface2/30 backdrop-blur-md">
        {user ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Napište zprávu..."
              className="flex-1 bg-surface border border-border/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all placeholder:text-muted/50"
            />
            <Button 
              type="submit" 
              variant="primary" 
              size="sm"
              disabled={!inputValue.trim()}
              className="rounded-xl px-3"
            >
              <Send size={18} />
            </Button>
          </form>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted mb-2">Pro zapojení do diskuze se musíte přihlásit</p>
          </div>
        )}
      </div>
    </div>
  );
}
