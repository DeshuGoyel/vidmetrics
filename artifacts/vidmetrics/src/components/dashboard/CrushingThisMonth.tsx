import React from 'react';
import { useStore, VideoData, getMomentumVpd } from '@/store/useStore';
import { formatNumber, formatDuration, cn } from '@/lib/utils';
import { TrendingUp, Play, ExternalLink, Flame, Clock, ThumbsUp } from 'lucide-react';
import { TrendBadge } from '../ui/Primitives';
import { motion } from 'framer-motion';
import { differenceInDays, parseISO } from 'date-fns';

function getRecentVideos(videos: VideoData[], days = 30): VideoData[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return videos
    .filter(v => parseISO(v.publishedAt) >= cutoff)
    .sort((a, b) => getMomentumVpd(b) - getMomentumVpd(a));
}

const RANK_STYLES = [
  { glow: 'rgba(245,158,11,0.25)', badge: 'bg-amber text-black', ring: 'ring-amber/40' },
  { glow: 'rgba(156,163,175,0.2)', badge: 'bg-slate-400 text-black', ring: 'ring-slate-400/30' },
  { glow: 'rgba(180,107,60,0.2)', badge: 'bg-orange-700 text-white', ring: 'ring-orange-700/30' },
];

function FeaturedVideoCard({ video, rank }: { video: VideoData; rank: number }) {
  const { openDrawer } = useStore();
  const style = RANK_STYLES[rank] || { glow: 'rgba(37,99,235,0.15)', badge: 'bg-blue/80 text-white', ring: 'ring-blue/20' };
  const days = Math.max(1, differenceInDays(new Date(), parseISO(video.publishedAt)));
  const viewsPerDay = getMomentumVpd(video);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
      className="group relative flex flex-col bg-surface border border-border/60 rounded-2xl overflow-hidden cursor-pointer hover:border-blue/40 transition-all duration-300"
      style={{ boxShadow: `0 0 40px ${style.glow}` }}
      onClick={() => openDrawer(video.id)}
    >
      <div className="relative w-full aspect-video overflow-hidden bg-black">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        <div className={`absolute top-3 left-3 w-8 h-8 rounded-full ${style.badge} flex items-center justify-center text-sm font-black shadow-lg ring-2 ${style.ring}`}>
          {rank + 1}
        </div>

        {video.isTrending && (
          <div className="absolute top-3 left-14">
            <TrendBadge video={video} />
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
          {formatDuration(video.durationSeconds)}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-cyan text-[10px] px-2 py-1 rounded-full border border-cyan/20">
          <TrendingUp className="w-3 h-3" />
          {formatNumber(Math.round(viewsPerDay))}/day
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-blue transition-colors">
          {video.title}
        </h3>

        <div className="grid grid-cols-3 gap-2 mt-auto">
          <Stat icon={<Play className="w-3 h-3" />} value={formatNumber(video.viewCount)} label="Views" color="text-cyan" />
          <Stat icon={<ThumbsUp className="w-3 h-3" />} value={`${video.engagementRate.toFixed(1)}%`} label="Engagement"
            color={video.engagementTier === 'high' ? 'text-green' : video.engagementTier === 'normal' ? 'text-blue' : 'text-text-muted'} />
          <Stat icon={<Clock className="w-3 h-3" />} value={`${days}d ago`} label="Published" color="text-text-secondary" />
        </div>
      </div>

      <a
        href={video.youtubeUrl}
        target="_blank"
        rel="noreferrer"
        onClick={e => e.stopPropagation()}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm p-1.5 rounded-lg text-white/70 hover:text-white"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </motion.div>
  );
}

function SmallVideoRow({ video, rank }: { video: VideoData; rank: number }) {
  const { openDrawer } = useStore();
  const days = Math.max(1, differenceInDays(new Date(), parseISO(video.publishedAt)));
  const viewsPerDay = getMomentumVpd(video);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.05 }}
      onClick={() => openDrawer(video.id)}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-elevated/40 border border-transparent hover:border-border/50 transition-all cursor-pointer group"
    >
      <span className="text-xs font-mono text-text-muted w-5 text-center shrink-0">{rank + 4}</span>
      <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-surface">
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-text-primary line-clamp-1 group-hover:text-blue transition-colors">{video.title}</p>
          {video.isTrending && (
            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[9px] font-bold uppercase tracking-wider">
              🔥 Trending
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-text-muted font-mono">{formatNumber(video.viewCount)} views</span>
          <span className="text-xs text-cyan font-mono flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />{formatNumber(Math.round(viewsPerDay))}/day
          </span>
        </div>
      </div>
      <span className="text-xs text-text-muted shrink-0">{days}d ago</span>
    </motion.div>
  );
}

function Stat({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className={cn('flex items-center gap-1 text-[10px] font-medium', color)}>
        {icon} {label}
      </div>
      <span className="text-sm font-bold text-text-primary font-mono">{value}</span>
    </div>
  );
}

export function CrushingThisMonth() {
  const { result } = useStore();
  if (!result) return null;

  const recent = getRecentVideos(result.videos, 30);
  const featured = recent.slice(0, 3);
  const rest = recent.slice(3, 8);
  const hasRecent = recent.length > 0;
  const trendingCount = recent.filter(v => v.isTrending).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber/30 to-orange-600/20 flex items-center justify-center border border-amber/20">
            <Flame className="w-4 h-4 text-amber" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary leading-none">Crushing It This Month</h2>
            <p className="text-xs text-text-muted mt-0.5">Ranked by views per day — fastest growing videos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {trendingCount > 0 && (
            <span className="text-xs font-mono bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-1 rounded-full">
              🔥 {trendingCount} trending
            </span>
          )}
          <span className="text-xs font-mono bg-amber/10 text-amber border border-amber/20 px-2.5 py-1 rounded-full">
            {recent.length} video{recent.length !== 1 ? 's' : ''} this month
          </span>
        </div>
      </div>

      {!hasRecent ? (
        <div className="bg-surface border border-border/50 rounded-2xl p-8 text-center">
          <p className="text-text-secondary text-sm">No videos published in the last 30 days.</p>
          <p className="text-text-muted text-xs mt-1">Check the full video list below for all-time performance.</p>
        </div>
      ) : (
        <>
          <div className={cn(
            'grid gap-4',
            featured.length === 1 ? 'grid-cols-1 max-w-sm' :
            featured.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}>
            {featured.map((v, i) => <FeaturedVideoCard key={v.id} video={v} rank={i} />)}
          </div>

          {rest.length > 0 && (
            <div className="bg-surface/50 border border-border/40 rounded-2xl p-2">
              {rest.map((v, i) => <SmallVideoRow key={v.id} video={v} rank={i} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
