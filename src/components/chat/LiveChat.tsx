import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon, Users, Smile, Image as ImageIcon, Paperclip, Gift, File } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { cn } from '@/lib/utils';
import { DEFAULT_AVATARS } from '@/lib/default-avatars';
import { Avatar } from '@/components/ui/Avatar';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userGender?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  timestamp: Date;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  gender?: string;
  status: 'online' | 'idle' | 'dnd';
}

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveChat({ isOpen, onClose }: LiveChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock online users
  const onlineUsers: OnlineUser[] = [
    { id: '1', name: 'Admin', avatar: '', gender: 'male', status: 'online' },
    { id: '2', name: 'Support', avatar: '', gender: 'female', status: 'idle' },
    { id: '3', name: 'Moderator', avatar: '', gender: 'other', status: 'dnd' },
    ...(user ? [{ id: user.id, name: user.displayName, avatar: user.avatarUrl, gender: user.gender, status: 'online' } as OnlineUser] : [])
  ];

  // Mock initial messages
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          userId: 'system',
          userName: 'System',
          content: 'Vítejte v živé diskuzi 3Play!',
          type: 'text',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Tester',
          userAvatar: '',
          userGender: 'male',
          content: 'Ahoj všem! Koukněte na tuhle fotku.',
          type: 'text',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, showUsers]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.displayName || 'User',
      userAvatar: user.avatarUrl,
      userGender: user.gender,
      content: inputValue.trim(),
      type: 'text',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setShowEmojis(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // In a real app, upload to server here.
    // For now, use FileReader for preview.
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const isImage = file.type.startsWith('image/');

      const newMessage: Message = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.displayName || 'User',
        userAvatar: user.avatarUrl,
        content: isImage ? 'Sent an image' : 'Sent a file',
        type: isImage ? 'image' : 'file',
        fileUrl: result,
        fileName: file.name,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
  };

  const COMMON_EMOJIS = ['😊', '😂', '🔥', '👍', '❤️', '🎉', '👋', '🤔', '😎', '👀', '✨', '🚀'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-surface border-l border-border/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border/10 flex items-center justify-between bg-surface2/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse absolute -right-0.5 -top-0.5" />
            <h3 className="font-heading font-bold text-lg">Chat</h3>
          </div>
          <div className="h-4 w-[1px] bg-border/20" />
          <p className="text-xs text-muted flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {onlineUsers.length} online
          </p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton 
            onClick={() => setShowUsers(!showUsers)}
            className={cn("hover:bg-brand/10", showUsers && "text-brand bg-brand/10")}
            title="Online uživatelé"
            aria-label="Online users"
          >
            <Users size={20} />
          </IconButton>
          <IconButton 
            onClick={onClose}
            className="hover:bg-red-500/10 hover:text-red-500"
            title="Zavřít"
            aria-label="Close chat"
          >
            <X size={20} />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg) => {
              const isMe = user && msg.userId === user.id;
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex gap-3 max-w-[90%]",
                    isMe ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className="flex-shrink-0">
                    {msg.userId === 'system' ? (
                       <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand">
                         <span className="text-xs font-bold">SYS</span>
                       </div>
                    ) : (
                      <Avatar 
                        src={msg.userAvatar} 
                        alt={msg.userName} 
                        gender={msg.userGender}
                        className="w-8 h-8 border border-border/10"
                        size="custom"
                      />
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
                        : "bg-surface2 text-text rounded-tl-sm",
                      msg.type === 'image' && "p-1 bg-transparent hover:bg-white/5 transition-colors border border-border/10"
                    )}>
                      {msg.type === 'text' && msg.content}
                      
                      {msg.type === 'image' && msg.fileUrl && (
                        <div className="relative group cursor-pointer">
                          <img 
                            src={msg.fileUrl} 
                            alt="Attachment" 
                            className="max-w-[200px] max-h-[200px] rounded-lg object-cover" 
                          />
                        </div>
                      )}

                      {msg.type === 'file' && (
                        <div className="flex items-center gap-2 p-1">
                          <div className="w-8 h-8 bg-black/20 rounded flex items-center justify-center">
                            <File size={16} />
                          </div>
                          <span className="underline decoration-white/30 underline-offset-4">{msg.fileName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Toolbar */}
          <div className="p-3 border-t border-border/10 bg-surface2/30 backdrop-blur-md space-y-3">
            {showEmojis && (
              <div className="flex gap-2 flex-wrap p-2 bg-surface rounded-lg border border-border/10 mb-2 animate-in slide-in-from-bottom-2">
                {COMMON_EMOJIS.map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-xl hover:bg-white/10 p-1.5 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            
            {user ? (
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-1 px-1">
                    <IconButton 
                      onClick={() => setShowEmojis(!showEmojis)} 
                      className={cn("h-8 w-8", showEmojis ? 'text-yellow-400' : 'text-muted hover:text-yellow-400')}
                      aria-label="Add emoji"
                    >
                      <Smile size={18} />
                    </IconButton>
                    <IconButton 
                      onClick={() => fileInputRef.current?.click()} 
                      className="h-8 w-8 text-muted hover:text-blue-400"
                      aria-label="Upload image"
                    >
                      <ImageIcon size={18} />
                    </IconButton>
                    <IconButton 
                      className="h-8 w-8 text-muted hover:text-purple-400"
                      aria-label="Send gift"
                    >
                      <Gift size={18} />
                    </IconButton>
                    <IconButton 
                      onClick={() => fileInputRef.current?.click()} 
                      className="h-8 w-8 text-muted hover:text-green-400"
                      aria-label="Attach file"
                    >
                      <Paperclip size={18} />
                    </IconButton>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                 </div>
                 
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
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-muted mb-2">Pro zapojení do diskuze se musíte přihlásit</p>
              </div>
            )}
          </div>
        </div>

        {/* Online Users Panel (Slide Over) */}
        <div 
          className={cn(
            "absolute inset-y-0 right-0 w-64 bg-surface border-l border-border/10 transform transition-transform duration-300 ease-in-out z-10",
            showUsers ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-4 border-b border-border/10 bg-surface2/50">
            <h4 className="font-bold text-sm">Online uživatelé ({onlineUsers.length})</h4>
          </div>
          <div className="p-2 overflow-y-auto h-full pb-20">
            {onlineUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                <div className="relative">
                  <Avatar 
                    src={u.avatar} 
                    alt={u.name} 
                    gender={u.gender}
                    className="w-8 h-8"
                    size="custom"
                  />
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface",
                    u.status === 'online' ? "bg-green-500" :
                    u.status === 'idle' ? "bg-yellow-500" : "bg-red-500"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-brand transition-colors">{u.name}</p>
                  <p className="text-[10px] text-muted capitalize">{u.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
