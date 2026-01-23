import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
import { BehaviorTracker } from '@/lib/behavior';
import { useAuthStore } from '@/store/auth';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Animated Character Component
const AgentCharacter = ({ onClick, isThinking }: { onClick: () => void, isThinking: boolean }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="fixed bottom-6 right-6 z-50 cursor-pointer"
  >
    <div className="relative h-16 w-16">
      {/* Body */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30">
        <div className="absolute inset-[2px] rounded-full bg-surface" />
        <div className="absolute inset-[4px] rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 backdrop-blur-sm" />
      </div>
      
      {/* Eyes */}
      <div className="absolute top-[35%] left-[25%] h-3 w-2.5 rounded-full bg-text transition-all duration-300">
        <div className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-white opacity-60" />
      </div>
      <div className="absolute top-[35%] right-[25%] h-3 w-2.5 rounded-full bg-text transition-all duration-300">
        <div className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-white opacity-60" />
      </div>

      {/* Mouth */}
      {isThinking ? (
        <div className="absolute bottom-[30%] left-[40%] h-1.5 w-3 rounded-full bg-text animate-pulse" />
      ) : (
        <div className="absolute bottom-[25%] left-[35%] h-1.5 w-5 rounded-full bg-text/80 transition-all duration-300" 
             style={{ borderRadius: '0 0 50% 50%' }} />
      )}

      {/* Accessories */}
      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-surface animate-pulse" />
    </div>
  </motion.div>
);

export function SmartAgent() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const tracker = useRef(BehaviorTracker.getInstance());
  
  const [messages, setMessages] = useState<Message[]>([]);

  // Only show for registered users
  if (!user) return null;

  // Initialize chat
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'assistant',
        content: tracker.current.getSuggestedGreeting()
      }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    tracker.current.track('search', input);

    setTimeout(() => {
      const response = generateResponse(userMsg.content);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1200);
  };

  const generateResponse = (text: string): string => {
    // ... same logic ...
    const lower = text.toLowerCase();
    const profile = tracker.current.getProfile();
    const topGenre = Object.entries(profile.preferences.favoriteGenres)
      .sort((a, b) => b[1] - a[1])[0];

    if (lower.includes('doporuč') || lower.includes('co') || lower.includes('film')) {
      const recs = tracker.current.getRecommendations();
      if (Array.isArray(recs) && recs.length > 1) {
         return `Podle toho, co u nás sleduješ (${topGenre ? topGenre[0] : 'všehochuť'}), bych ti doporučil:\n\n${recs.map(r => `• ${r}`).join('\n')}`;
      }
      return recs[0];
    }
    
    if (lower.includes('ahoj') || lower.includes('čau')) {
      return 'Ahoj! 👋 Co pro tebe dnes můžu udělat?';
    }

    if (lower.includes('co víš') || lower.includes('data')) {
      return `Vím, že jsi u nás provedl ${profile.activities.length} akcí. ${topGenre ? `A vypadá to, že máš rád ${topGenre[0]}.` : ''} Všechna tato data mám uložená jen u tebe v zařízení, abych ti mohl lépe sloužit! 🔒`;
    }

    return 'Rozumím. Jsem tu, abych ti pomohl najít ten nejlepší obsah přesně pro tebe. Zeptej se mě na doporučení!';
  };

  return (
    <>
      <AgentCharacter onClick={() => setIsOpen(!isOpen)} isThinking={isTyping} />

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-40 w-full max-w-[400px] border-l border-border/10 bg-surface/95 shadow-2xl backdrop-blur-xl md:w-[400px]"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/10 p-4">
                  <div>
                    <h3 className="font-bold text-lg">Smart Guide</h3>
                    <p className="text-xs text-muted">Tvůj osobní průvodce světem 3Play</p>
                  </div>
                  <IconButton onClick={() => setIsOpen(false)}>
                    <ChevronRight size={24} />
                  </IconButton>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex max-w-[85%] flex-col gap-1",
                        msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm shadow-sm",
                          msg.role === 'user'
                            ? "bg-primary text-white rounded-br-none"
                            : "bg-surface2 text-text rounded-bl-none"
                        )}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-muted px-1">
                        {msg.role === 'assistant' ? 'Guide' : 'Ty'}
                      </span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex self-start items-center gap-1 rounded-2xl bg-surface2 px-4 py-3 rounded-bl-none">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-border/10 p-4 bg-surface/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Zeptej se mě na cokoliv..."
                      className="flex-1 rounded-xl border border-border/10 bg-surface2 px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all"
                    />
                    <Button 
                      size="md"
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className={cn("shrink-0 h-[46px] w-[46px] p-0", !input.trim() && "opacity-50")}
                    >
                      <Send size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

