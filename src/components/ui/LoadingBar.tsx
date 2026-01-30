import { useEffect, useState } from 'react';

export function LoadingBar() {
  const [loadingCount, setLoadingCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    const onStart = () => setLoadingCount(c => c + 1);
    const onEnd = () => setLoadingCount(c => Math.max(0, c - 1));
    const onUpload = (e: Event) => {
      const customEvent = e as CustomEvent<{ progress: number }>;
      if (customEvent.detail?.progress !== undefined) {
        setUploadProgress(customEvent.detail.progress);
      } else {
        setUploadProgress(null);
      }
    };

    window.addEventListener('api-load-start', onStart);
    window.addEventListener('api-load-end', onEnd);
    window.addEventListener('upload-progress', onUpload);

    return () => {
      window.removeEventListener('api-load-start', onStart);
      window.removeEventListener('api-load-end', onEnd);
      window.removeEventListener('upload-progress', onUpload);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;

    if (uploadProgress !== null) {
      setProgress(uploadProgress);
      return;
    }

    if (loadingCount > 0) {
      // Start/Continue progress
      setProgress(p => (p === 0 ? 10 : p));
      
      const animate = () => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          // Faster and more dynamic progress for "real" feel
          const remaining = 90 - prev;
          const step = remaining * 0.1 + Math.random() * 2;
          return Math.min(90, prev + step);
        });
        animationFrameId = requestAnimationFrame(animate);
      };
      
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Complete - fast finish
      setProgress(100);
      timeoutId = setTimeout(() => {
        setProgress(0);
        setUploadProgress(null);
      }, 200);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [loadingCount, uploadProgress]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none">
      <div 
        className="h-full relative bg-brand overflow-hidden"
        style={{ 
          width: `${progress}%`, 
          opacity: progress === 100 ? 0 : 1,
          backgroundColor: uploadProgress !== null ? '#ff0000' : undefined,
          transition: progress === 100 ? 'opacity 0.2s ease-out' : 'width 0.1s linear'
        }}
      >
        {/* Subtle shine effect */}
        <div 
          className="absolute inset-0 w-full h-full animate-[shimmer_0.8s_linear_infinite]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  );
}
