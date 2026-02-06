import { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Smile, Trash2, Check, CheckCheck } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Socket } from 'socket.io-client';
import { Button } from './ui/Button';
import { useAuthStore } from '../store/auth';

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  color?: string;
  isRead?: boolean;
}

interface LiveChatProps {
  videoId: string;
}

export function LiveChat({ videoId }: LiveChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Colors for usernames
  const nameColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#FFA500', '#800080', '#008080', '#FFC0CB', '#4B0082', '#A52A2A'
  ];

  const [userColor, setUserColor] = useState(user?.chatColor || nameColors[Math.floor(Math.random() * nameColors.length)]);

  useEffect(() => {
    // Mock socket connection
    // In a real app: socketRef.current = io('http://localhost:3001');
    
    // Mock initial messages
    setMessages([
      { id: '1', userId: '2', username: 'Fanoušek1', text: 'Super video!', timestamp: new Date().toISOString(), color: '#FF0000', isRead: true },
      { id: '2', userId: '3', username: 'Hater123', text: 'Nuda...', timestamp: new Date().toISOString(), color: '#0000FF', isRead: true },
    ]);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [videoId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      text: newMessage,
      timestamp: new Date().toISOString(),
      color: userColor,
      isRead: false // Initially unread
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(false);
    
    // Simulate read receipt after 2 seconds
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, isRead: true } : m));
    }, 2000);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing start
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit typing stop
    }, 1000);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const deleteMessage = (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Živý chat</h3>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <div 
              className="w-4 h-4 rounded-full cursor-pointer border border-gray-300" 
              style={{ backgroundColor: userColor }}
            />
            <div className="absolute right-0 top-full hidden group-hover:grid grid-cols-4 gap-1 p-2 bg-white border rounded-lg shadow-lg z-10 w-32">
              {nameColors.map(color => (
                <button
                  key={color}
                  className="w-5 h-5 rounded-full hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => setUserColor(color)}
                />
              ))}
            </div>
          </div>
          <MoreVertical className="h-5 w-5 text-gray-500 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="group flex items-start gap-2 hover:bg-gray-50 p-1 rounded">
            <div className="flex-1 min-w-0">
              <span 
                className="font-medium text-sm mr-2"
                style={{ color: msg.color }}
              >
                {msg.username}
              </span>
              <span className="text-sm text-gray-800 break-words">{msg.text}</span>
            </div>
            
            {/* Message Actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              {user?.id === msg.userId && (
                <button 
                  onClick={() => deleteMessage(msg.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Read Status */}
            {user?.id === msg.userId && (
              <div className="text-gray-400">
                {msg.isRead ? (
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="text-xs text-gray-500 italic">
            {typingUsers.join(', ')} píše...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t bg-gray-50">
        <div className="relative flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Smile className="h-6 w-6" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-20">
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowEmojiPicker(false)} 
                />
                <div className="relative z-20">
                  <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                </div>
              </div>
            )}
          </div>
          
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Napište zprávu..."
            className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            maxLength={200}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full bg-blue-600 hover:bg-blue-700 h-9 w-9"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-right text-[10px] text-gray-400 mt-1 px-2">
          {newMessage.length}/200
        </div>
      </form>
    </div>
  );
}
