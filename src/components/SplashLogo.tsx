import { motion } from 'framer-motion';
import { useState } from 'react';

interface SplashLogoProps {
  onIntroComplete?: () => void;
  className?: string;
}

export function SplashLogo({ onIntroComplete, className }: SplashLogoProps) {
  const [isRotating, setIsRotating] = useState(false);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* "3" Text */}
      <motion.span 
        className="text-white text-5xl font-bold tracking-tighter mr-1 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        3
      </motion.span>

      {/* Container for the triangle */}
      <motion.div
        className="relative z-20 flex items-center justify-center"
        animate={isRotating ? { rotate: 360 } : { rotate: 0 }}
        transition={isRotating ? {
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        } : { duration: 0 }}
      >
        {/* The Red Play Triangle */}
        {/* Using a custom SVG to match the brand Play button shape */}
        <svg 
          width="64" 
          height="64" 
          viewBox="0 0 100 100" 
          className="fill-primary drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 0 10px rgba(229, 9, 20, 0.5))' }}
        >
           <path d="M30 20 L85 50 L30 80 Z" className="fill-primary" />
        </svg>
      </motion.div>

      {/* "Play" Text */}
      {/* We place this absolute or relative? Relative allows flow. 
          We want it to move LEFT into the triangle. 
          So we animate width/opacity/x.
      */}
      <motion.div
        className="overflow-hidden z-0"
        initial={{ width: 'auto', opacity: 1, x: 0 }}
        animate={{ width: 0, opacity: 0, x: -60 }}
        transition={{
            duration: 0.8,
            delay: 0.8, // Wait a bit before starting the hide animation
            ease: "easeInOut"
        }}
        onAnimationComplete={() => {
          setIsRotating(true);
          onIntroComplete?.();
        }}
      >
        <span className="text-white text-5xl font-bold tracking-tighter ml-1 whitespace-nowrap">
          Play
        </span>
      </motion.div>
    </div>
  );
}
