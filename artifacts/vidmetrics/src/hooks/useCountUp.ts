import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration = 1200, enabled = true) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);
  
  useEffect(() => {
    if (!enabled || hasRun.current || target === 0) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentVal = Math.floor(easeOutExpo(progress) * target);
      setCount(currentVal);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
        hasRun.current = true;
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, enabled]);

  return count;
}
