import React from 'react';
import { cn, formatNumber } from "@/lib/utils";
import { useTilt } from "@/hooks/useTilt";
import { useCountUp } from "@/hooks/useCountUp";
import { Loader2 } from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";
import type { VideoData } from "@/store/useStore";

// --- GlassCard ---
interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  glow?: 'blue' | 'cyan' | 'violet' | 'amber' | 'green' | 'none';
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, glow = 'none', children, ...props }, ref) => {
    
    const glowClasses = {
      none: '',
      blue: 'hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(37,99,235,0.15)] hover:border-blue/30',
      cyan: 'hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan/30',
      violet: 'hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(124,58,237,0.15)] hover:border-violet/30',
      amber: 'hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.15)] hover:border-amber/30',
      green: 'hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.15)] hover:border-green/30',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "bg-glass glass-border glass-shadow rounded-2xl overflow-hidden relative",
          hover && "transition-all duration-300 hover:-translate-y-1",
          hover && glowClasses[glow],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

// --- TiltCard ---
export const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { ref, style } = useTilt(8);
  return (
    <div ref={ref} className={cn("perspective-1000", className)}>
      <div style={style} className="w-full h-full preserve-3d">
        {children}
      </div>
    </div>
  );
};

// --- GlowButton ---
interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, loading, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    
    const base = "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl overflow-hidden whitespace-nowrap active:scale-95";
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    };
    
    const variants = {
      primary: "bg-blue text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:bg-blue-dim border border-blue/50",
      ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border",
      danger: "bg-red/10 text-red hover:bg-red/20 border border-red/20"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          sizes[size],
          variants[variant],
          (disabled || loading) && "opacity-60 cursor-not-allowed active:scale-100",
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
GlowButton.displayName = 'GlowButton';

// --- AnimatedNumber ---
export const AnimatedNumber: React.FC<{ value: number; formatter?: (n: number) => string; duration?: number; className?: string }> = 
  ({ value, formatter = formatNumber, duration = 1200, className }) => {
  const count = useCountUp(value, duration);
  return <span className={cn("font-mono tabular-nums", className)}>{formatter(count)}</span>;
};

// --- MetricPill ---
export const MetricPill: React.FC<{ tier: 'high' | 'normal' | 'low'; value: string; className?: string }> = ({ tier, value, className }) => {
  const styles = {
    high: "bg-green/10 text-green border-green/20",
    normal: "bg-blue/10 text-cyan border-cyan/20",
    low: "bg-void text-text-muted border-border"
  };
  
  const prefixes = { high: '↑', normal: '—', low: '↓' };

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium font-mono", styles[tier], className)}>
      <span className="mr-1 opacity-70">{prefixes[tier]}</span>
      {value}
    </span>
  );
};

// --- TrendBadge ---
// Shows all applicable badges independently — isTrending always renders even when isTopAllTime is also set.
export const TrendBadge: React.FC<{ video: VideoData; className?: string }> = ({ video, className }) => {
  const badges: React.ReactNode[] = [];

  if (video.isTrending) {
    badges.push(
      <span key="trending" className={cn("inline-flex items-center px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider", className)}>
        🔥 Trending
      </span>
    );
  }
  if (video.isTopAllTime) {
    badges.push(
      <span key="top" className={cn("inline-flex items-center px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20 text-[10px] font-bold uppercase tracking-wider", className)}>
        👑 Top Video
      </span>
    );
  }
  if (!video.isTrending && !video.isTopAllTime && video.isRecent) {
    badges.push(
      <span key="new" className={cn("inline-flex items-center px-2 py-0.5 rounded-full bg-blue/10 text-blue border border-blue/20 text-[10px] font-bold uppercase tracking-wider", className)}>
        ✨ New
      </span>
    );
  }

  if (badges.length === 0) return null;
  if (badges.length === 1) return <>{badges[0]}</>;
  return <span className="inline-flex items-center gap-1">{badges}</span>;
};
