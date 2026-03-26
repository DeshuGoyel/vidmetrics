import { format, parseISO, subDays } from 'date-fns';

const YT = 'https://www.googleapis.com/youtube/v3';
const KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;

export interface ChannelData {
  id: string;
  handle: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  subscriberCount: number;
  totalViewCount: number;
  videoCount: number;
  createdAt: string;
  country?: string;
  uploadPlaylistId: string;
  healthScore: number;
  avgEngagementRate: number;
}

export interface VideoData {
  id: string;
  title: string;
  thumbnailUrl: string;
  description: string;
  publishedAt: string;
  durationIso: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
  engagementTier: 'high' | 'normal' | 'low';
  relativeViewScore: number;
  isRecent: boolean;
  isTrending: boolean;
  isTopAllTime: boolean;
  publishMonth: string;
  keywords: string[];
  youtubeUrl: string;
}

export interface InsightCard {
  id: string;
  type: 'strategy' | 'timing' | 'formula' | 'trajectory';
  icon: string;
  title: string;
  body: string;
  stat?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  channel: ChannelData;
  videos: VideoData[];
  insights: InsightCard[];
  fetchedAt: string;
  isDemo: boolean;
}

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  const watchMatch = trimmed.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  return null;
}

async function fetchChannelIdFromVideo(videoId: string): Promise<string> {
  if (!KEY) throw { code: 'NO_API_KEY' };
  const url = `${YT}/videos?part=snippet&id=${videoId}&key=${KEY}`;
  const res = await fetch(url);
  if (res.status === 403) throw { code: 'QUOTA_EXCEEDED' };
  if (!res.ok) throw { code: 'API_ERROR', message: `HTTP ${res.status}` };
  const data = await res.json() as Record<string, unknown>;
  const items = data.items as Record<string, unknown>[] | undefined;
  if (!items || items.length === 0) throw { code: 'CHANNEL_NOT_FOUND' };
  const snippet = (items[0] as Record<string, unknown>).snippet as Record<string, unknown>;
  return snippet.channelId as string;
}

export function parseChannelInput(input: string): { param: string; value: string } | { videoId: string } {
  const trimmed = input.trim();

  const videoId = extractVideoId(trimmed);
  if (videoId) return { videoId };

  if (trimmed.includes('youtube.com/@')) {
    const match = trimmed.match(/youtube\.com\/@([^/?&]+)/);
    if (match) return { param: 'forHandle', value: `@${match[1]}` };
  }
  if (trimmed.includes('youtube.com/channel/')) {
    const match = trimmed.match(/youtube\.com\/channel\/(UC[^/?&]+)/);
    if (match) return { param: 'id', value: match[1] };
  }
  if (trimmed.includes('youtube.com/c/')) {
    const match = trimmed.match(/youtube\.com\/c\/([^/?&]+)/);
    if (match) return { param: 'forUsername', value: match[1] };
  }
  if (trimmed.includes('youtube.com/user/')) {
    const match = trimmed.match(/youtube\.com\/user\/([^/?&]+)/);
    if (match) return { param: 'forUsername', value: match[1] };
  }
  if (trimmed.startsWith('@')) {
    return { param: 'forHandle', value: trimmed };
  }
  if (trimmed.startsWith('UC') && trimmed.length > 20) {
    return { param: 'id', value: trimmed };
  }
  if (trimmed.length > 0 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return { param: 'forHandle', value: `@${trimmed}` };
  }

  throw { code: 'INVALID_URL' };
}

export async function fetchChannel(input: string): Promise<ChannelData> {
  if (!KEY) throw { code: 'NO_API_KEY' };

  const parsed = parseChannelInput(input);

  let param: string;
  let value: string;

  if ('videoId' in parsed) {
    const channelId = await fetchChannelIdFromVideo(parsed.videoId);
    param = 'id';
    value = channelId;
  } else {
    param = parsed.param;
    value = parsed.value;
  }

  const url = `${YT}/channels?part=snippet,statistics,contentDetails&${param}=${encodeURIComponent(value)}&key=${KEY}`;

  const res = await fetch(url);

  if (res.status === 403) throw { code: 'QUOTA_EXCEEDED' };
  if (!res.ok) throw { code: 'API_ERROR', message: `HTTP ${res.status}` };

  const data = await res.json() as Record<string, unknown>;
  const items = data.items as Record<string, unknown>[] | undefined;
  if (!items || items.length === 0) throw { code: 'CHANNEL_NOT_FOUND' };

  const item = items[0] as Record<string, unknown>;
  const snippet = item.snippet as Record<string, unknown>;
  const statistics = item.statistics as Record<string, unknown>;
  const contentDetails = item.contentDetails as Record<string, unknown>;
  const relatedPlaylists = contentDetails.relatedPlaylists as Record<string, unknown>;
  const thumbnails = snippet.thumbnails as Record<string, Record<string, string>>;

  return {
    id: item.id as string,
    handle: (snippet.customUrl as string) || (snippet.title as string),
    title: snippet.title as string,
    description: snippet.description as string,
    thumbnailUrl: thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || '',
    subscriberCount: parseInt(statistics.subscriberCount as string) || 0,
    totalViewCount: parseInt(statistics.viewCount as string) || 0,
    videoCount: parseInt(statistics.videoCount as string) || 0,
    createdAt: snippet.publishedAt as string,
    country: snippet.country as string | undefined,
    uploadPlaylistId: relatedPlaylists.uploads as string,
    healthScore: 0,
    avgEngagementRate: 0,
  };
}

export async function fetchVideoIds(playlistId: string, max = 50): Promise<string[]> {
  if (!KEY) throw { code: 'NO_API_KEY' };

  const url = `${YT}/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=${max}&key=${KEY}`;
  const res = await fetch(url);

  if (res.status === 403) throw { code: 'QUOTA_EXCEEDED' };
  if (!res.ok) throw { code: 'API_ERROR', message: `HTTP ${res.status}` };

  const data = await res.json() as Record<string, unknown>;
  const items = (data.items as Record<string, unknown>[]) || [];

  return items.map((item) => {
    const contentDetails = item.contentDetails as Record<string, unknown>;
    return contentDetails.videoId as string;
  });
}

function parseDurationISO(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

const STOP_WORDS = new Set(['the','a','an','in','on','at','how','to','my','your','i','and','or','of','this','is','are','was','for','with','what','its','it','we','our','you','that','they','their','from','have','has','been','be','do','does','did','by','as','but','so','if','then','than','when','who','which','will','would','could','should','about','up','out','just','more','all','can','get','got','him','her','his','she','he','not','no','yes','new','one','two','three','four','five','six','seven','eight','nine','ten','are','was']);

function extractKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 3);
}

interface RawVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  contentDetails: {
    duration: string;
  };
}

export async function fetchVideoDetails(videoIds: string[]): Promise<Omit<VideoData, 'relativeViewScore'|'isTrending'|'isTopAllTime'|'engagementTier'|'publishMonth'>[]> {
  if (!KEY) throw { code: 'NO_API_KEY' };

  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const results = await Promise.all(chunks.map(async (chunk) => {
    const ids = chunk.join(',');
    const url = `${YT}/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${KEY}`;
    const res = await fetch(url);

    if (res.status === 403) throw { code: 'QUOTA_EXCEEDED' };
    if (!res.ok) throw { code: 'API_ERROR', message: `HTTP ${res.status}` };

    const data = await res.json() as { items: RawVideoItem[] };
    return (data.items || []).map((item) => {
      const views = parseInt(item.statistics.viewCount) || 0;
      const likes = parseInt(item.statistics.likeCount) || 0;
      const comments = parseInt(item.statistics.commentCount) || 0;
      const engagementRate = views > 0 ? (likes + comments) / views * 100 : 0;
      const durationSeconds = parseDurationISO(item.contentDetails.duration);
      const publishedAt = item.snippet.publishedAt;
      const pubDate = new Date(publishedAt);
      const isRecent = pubDate >= thirtyDaysAgo;

      return {
        id: item.id,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        description: item.snippet.description || '',
        publishedAt,
        durationIso: item.contentDetails.duration,
        durationSeconds,
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        engagementRate,
        isRecent,
        keywords: extractKeywords(item.snippet.title),
        youtubeUrl: `https://youtube.com/watch?v=${item.id}`,
      };
    });
  }));

  return results.flat();
}

export function enrichVideos(videos: Omit<VideoData, 'relativeViewScore'|'isTrending'|'isTopAllTime'|'engagementTier'|'publishMonth'>[]): VideoData[] {
  if (videos.length === 0) return [];

  const sorted = [...videos].sort((a, b) => b.viewCount - a.viewCount);
  const maxViews = sorted[0].viewCount || 1;
  const avgViews = videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length;

  return sorted.map((v, i) => ({
    ...v,
    relativeViewScore: (v.viewCount / maxViews) * 100,
    isTrending: v.isRecent && v.viewCount > avgViews * 1.5,
    isTopAllTime: i === 0,
    engagementTier: v.engagementRate > 5 ? 'high' : v.engagementRate > 2 ? 'normal' : 'low',
    publishMonth: format(parseISO(v.publishedAt), 'MMM yyyy'),
  }));
}
