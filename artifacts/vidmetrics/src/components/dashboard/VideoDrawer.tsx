import React from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ThumbsUp, MessageSquare, Eye, Calendar, Clock } from 'lucide-react';
import { formatNumber, formatDuration, cn } from '@/lib/utils';
import { MetricPill, TrendBadge, GlowButton } from '../ui/Primitives';
import { format } from 'date-fns';

export function VideoDrawer() {
  const { drawerOpen, closeDrawer, selectedVideoId, result } = useStore();
  
  const video = result?.videos.find(v => v.id === selectedVideoId);

  return (
    <AnimatePresence>
      {drawerOpen && video && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface/95 backdrop-blur-2xl border-l border-border/80 shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header / Thumbnail Area */}
            <div className="relative w-full aspect-video bg-black shrink-0">
              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              
              <button 
                onClick={closeDrawer}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
              
              {/* Title & Badges */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <TrendBadge video={video} />
                  <MetricPill tier={video.engagementTier} value={`Engagement: ${video.engagementRate.toFixed(1)}%`} />
                </div>
                <h2 className="text-xl font-bold text-text-primary leading-snug">
                  {video.title}
                </h2>
              </div>

              {/* Action Button */}
              <a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="w-full block">
                <GlowButton className="w-full" size="md">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch on YouTube
                </GlowButton>
              </a>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatBox icon={<Eye />} label="Views" value={formatNumber(video.viewCount)} color="text-cyan" />
                <StatBox icon={<ThumbsUp />} label="Likes" value={formatNumber(video.likeCount)} color="text-blue" />
                <StatBox icon={<MessageSquare />} label="Comments" value={formatNumber(video.commentCount)} color="text-violet" />
                <StatBox icon={<ActivityIcon />} label="Engagement" value={`${video.engagementRate.toFixed(1)}%`} color="text-green" />
              </div>

              <div className="h-px w-full bg-border/50" />

              {/* Meta Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Video Details</h3>
                
                <div className="flex flex-col gap-3">
                  <MetaRow icon={<Calendar />} label="Published" value={format(new Date(video.publishedAt), 'MMMM do, yyyy')} />
                  <MetaRow icon={<Clock />} label="Duration" value={formatDuration(video.durationSeconds)} />
                </div>
              </div>

              {/* Keywords */}
              {video.keywords && video.keywords.length > 0 && (
                <div className="space-y-3 mt-2">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Detected Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {video.keywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-elevated border border-border text-xs text-text-secondary">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatBox({ icon, label, value, color }: any) {
  return (
    <div className="bg-elevated/50 border border-border/50 rounded-xl p-4 flex flex-col items-center text-center">
      <div className={cn("mb-2 w-5 h-5", color)}>
        {React.cloneElement(icon, { className: "w-full h-full" })}
      </div>
      <span className="text-lg font-mono font-bold text-text-primary mb-0.5">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">{label}</span>
    </div>
  );
}

function MetaRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-text-muted">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
        <span>{label}</span>
      </div>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
