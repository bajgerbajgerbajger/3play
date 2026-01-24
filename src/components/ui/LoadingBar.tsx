import { useEffect, useState } from 'react';

export function LoadingBar() {
  const [loadingCount, setLoadingCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onStart = () => setLoadingCount(c => c + 1);
    const onEnd = () => setLoadingCount(c => Math.max(0, c - 1));

    window.addEventListener('api-load-start', onStart);
    window.addEventListener('api-load-end', onEnd);

    return () => {
      window.removeEventListener('api-load-start', onStart);
      window.removeEventListener('api-load-end', onEnd);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loadingCount > 0) {
      // Start/Continue progress
      setProgress(p => (p === 0 ? 10 : p));
      
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) return p;
          return p + (90 - p) * 0.1;
        });
      }, 200);
    } else {
      // Complete
      setProgress(p => (p > 0 ? 100 : 0));
      const t = setTimeout(() => setProgress(0), 400);
      return () => clearTimeout(t);
    }
    
    return () => clearInterval(interval);
  }, [loadingCount]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none" style={{ pointerEvents: 'none' }}>
      <div 
        className="h-full bg-brand shadow-[0_0_10px_rgba(229,9,20,0.5)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}
