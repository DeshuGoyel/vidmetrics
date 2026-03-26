import { parseISO, subDays } from 'date-fns';
import type { VideoData, ChannelData } from './youtube.js';

export interface ChartPoint {
  date: string;
  value: number;
  title: string;
}

export interface CadencePoint {
  month: string;
  uploads: number;
  avgViews: number;
}

export type ChartMetric = 'views' | 'likes' | 'comments' | 'engagement';

export function calculateHealthScore(channel: ChannelData, videos: VideoData[]): number {
  if (videos.length === 0) return 50;

  const avgEngagement = videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length;
  const engagementScore = Math.min(100, (avgEngagement / 5) * 100);

  const now = new Date();
  const ninetyDaysAgo = subDays(now, 90);
  const thirtyDaysAgo = subDays(now, 30);
  const recentVideos = videos.filter(v => new Date(v.publishedAt) >= ninetyDaysAgo);
  const recentCount = videos.filter(v => new Date(v.publishedAt) >= thirtyDaysAgo).length;
  
  const consistencyScore = recentCount > 0 ? Math.min(100, recentCount * 25) : 0;

  const avgViews = videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length;
  const viewSubRatio = channel.subscriberCount > 0 
    ? Math.min(100, (avgViews / channel.subscriberCount) * 100)
    : 50;

  const recentActivityScore = videos.length > 0 
    ? Math.min(100, (recentVideos.length / videos.length) * 100 * 3)
    : 0;

  const sorted = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  const half = Math.floor(sorted.length / 2);
  const olderHalf = sorted.slice(0, half);
  const newerHalf = sorted.slice(half);
  const olderAvg = olderHalf.length ? olderHalf.reduce((s, v) => s + v.viewCount, 0) / olderHalf.length : 0;
  const newerAvg = newerHalf.length ? newerHalf.reduce((s, v) => s + v.viewCount, 0) / newerHalf.length : 0;
  const growthScore = olderAvg > 0 ? Math.min(100, Math.max(0, 50 + ((newerAvg - olderAvg) / olderAvg) * 50)) : 50;

  const weighted =
    engagementScore * 0.30 +
    consistencyScore * 0.20 +
    viewSubRatio * 0.20 +
    recentActivityScore * 0.15 +
    growthScore * 0.15;

  return Math.min(100, Math.round(weighted));
}

export function getTopVideos(videos: VideoData[], n = 10): VideoData[] {
  return [...videos].sort((a, b) => b.viewCount - a.viewCount).slice(0, n);
}

export function getRecentVideos(videos: VideoData[], days = 30): VideoData[] {
  const cutoff = subDays(new Date(), days);
  return videos.filter(v => new Date(v.publishedAt) >= cutoff);
}

export function getAvgMetric(videos: VideoData[], key: keyof VideoData): number {
  if (videos.length === 0) return 0;
  const values = videos.map(v => v[key] as number).filter(n => typeof n === 'number');
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

export function getChartData(videos: VideoData[], metric: ChartMetric): ChartPoint[] {
  const sorted = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

  const getValue = (v: VideoData): number => {
    switch (metric) {
      case 'views': return v.viewCount;
      case 'likes': return v.likeCount;
      case 'comments': return v.commentCount;
      case 'engagement': return v.engagementRate;
    }
  };

  if (sorted.length <= 30) {
    return sorted.map(v => ({
      date: v.publishMonth,
      value: getValue(v),
      title: v.title.slice(0, 40),
    }));
  }

  const byMonth = new Map<string, { total: number; count: number; title: string }>();
  for (const v of sorted) {
    const existing = byMonth.get(v.publishMonth);
    if (existing) {
      existing.total += getValue(v);
      existing.count += 1;
    } else {
      byMonth.set(v.publishMonth, { total: getValue(v), count: 1, title: v.title.slice(0, 40) });
    }
  }

  return Array.from(byMonth.entries()).map(([date, { total, count, title }]) => ({
    date,
    value: Math.round(total / count),
    title,
  }));
}

export function getUploadCadenceData(videos: VideoData[]): CadencePoint[] {
  const byMonth = new Map<string, { uploads: number; totalViews: number }>();

  for (const v of videos) {
    const existing = byMonth.get(v.publishMonth);
    if (existing) {
      existing.uploads += 1;
      existing.totalViews += v.viewCount;
    } else {
      byMonth.set(v.publishMonth, { uploads: 1, totalViews: v.viewCount });
    }
  }

  const sorted = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  const orderedMonths: string[] = [];
  for (const v of sorted) {
    if (!orderedMonths.includes(v.publishMonth)) {
      orderedMonths.push(v.publishMonth);
    }
  }

  return orderedMonths.map(month => {
    const data = byMonth.get(month) || { uploads: 0, totalViews: 0 };
    return {
      month,
      uploads: data.uploads,
      avgViews: data.uploads > 0 ? Math.round(data.totalViews / data.uploads) : 0,
    };
  });
}

export function getRadarData(channel: ChannelData, videos: VideoData[]): { subject: string; value: number }[] {
  if (videos.length === 0) return [];

  const avgEngagement = videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length;
  const viewVolume = Math.min(100, (videos.reduce((s, v) => s + v.viewCount, 0) / videos.length / 1000000) * 50);
  const engagement = Math.min(100, (avgEngagement / 5) * 100);
  
  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentCount = videos.filter(v => new Date(v.publishedAt) >= thirtyDaysAgo).length;
  const uploadRate = Math.min(100, recentCount * 25);

  const dates = videos.map(v => new Date(v.publishedAt).getTime()).sort((a, b) => a - b);
  let consistencyScore = 50;
  if (dates.length > 1) {
    const diffs: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      diffs.push(dates[i] - dates[i-1]);
    }
    const avgDiff = diffs.reduce((s, d) => s + d, 0) / diffs.length;
    const variance = diffs.reduce((s, d) => s + Math.abs(d - avgDiff), 0) / diffs.length;
    consistencyScore = Math.min(100, Math.max(0, 100 - (variance / avgDiff) * 50));
  }

  const reach = Math.min(100, channel.subscriberCount / 1000000 * 20);

  return [
    { subject: 'View Volume', value: Math.round(viewVolume) },
    { subject: 'Engagement', value: Math.round(engagement) },
    { subject: 'Upload Rate', value: Math.round(uploadRate) },
    { subject: 'Consistency', value: Math.round(consistencyScore) },
    { subject: 'Reach', value: Math.round(reach) },
  ];
}
