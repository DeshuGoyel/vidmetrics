import { GoogleGenAI } from '@google/genai';
import type { VideoData, ChannelData, InsightCard } from './youtube.js';

const STOP_WORDS = new Set(['the','a','an','in','on','at','how','to','my','your','i','and','or','of','this','is','are','was','for','with','what','its','it','we','our','you','that','they','their','from','have','has','been','be','do','does','did','by','as','but','so','if','then','than','when','who','which','will','would','could','should','about','up','out','just','more','all','can','get','got','him','her','his','she','he','not','no','yes','new','one','two','three','four','five','six','seven','eight','nine','ten','are','was','every','heres','why','these','most','best','worst','ever','top','full','vs','dont','cant','wont','isnt','arent','wasnt','were','very','really','still','even','after','before','first','last','only','much','many','some','any','both','each','few','more','other','such','same','than','too','very','s','t','m','re','ll','d']);

function tokenize(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function algorithmicInsights(channel: ChannelData, videos: VideoData[]): InsightCard[] {
  const allTokens = videos.flatMap(v => tokenize(v.title));
  const freq = new Map<string, number>();
  for (const t of allTokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  const topKeywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const channelAvgViews = videos.length ? videos.reduce((s, v) => s + v.viewCount, 0) / videos.length : 0;

  let strategyTitle = 'Content Strategy Pattern';
  let strategyBody = 'Not enough data to determine strategy.';
  let strategyStat = '0% keyword concentration';

  if (topKeywords.length > 0) {
    const [topWord, topCount] = topKeywords[0];
    const topPercent = Math.round((topCount / videos.length) * 100);
    const topVideos = videos.filter(v => v.title.toLowerCase().includes(topWord));
    const topAvgViews = topVideos.length ? topVideos.reduce((s, v) => s + v.viewCount, 0) / topVideos.length : 0;
    const viewsDiff = channelAvgViews > 0 ? Math.round(((topAvgViews - channelAvgViews) / channelAvgViews) * 100) : 0;
    strategyBody = `"${topWord}" content makes up ${topPercent}% of videos, averaging ${Math.abs(viewsDiff)}% ${viewsDiff >= 0 ? 'more' : 'fewer'} views than channel average.`;
    strategyStat = `${topPercent}% keyword concentration`;
  }

  const dayCount = [0, 0, 0, 0, 0, 0, 0];
  const dayViews: number[][] = [[], [], [], [], [], [], []];
  for (const v of videos) {
    const day = new Date(v.publishedAt).getDay();
    dayCount[day]++;
    dayViews[day].push(v.viewCount);
  }
  const peakDay = dayCount.indexOf(Math.max(...dayCount));
  const peakDayAvg = dayViews[peakDay].length ? dayViews[peakDay].reduce((s, n) => s + n, 0) / dayViews[peakDay].length : 0;
  const otherDayViews = dayViews.flatMap((views, i) => i === peakDay ? [] : views);
  const otherDayAvg = otherDayViews.length ? otherDayViews.reduce((s, n) => s + n, 0) / otherDayViews.length : 0;
  const peakDayDiff = otherDayAvg > 0 ? Math.round(((peakDayAvg - otherDayAvg) / otherDayAvg) * 100) : 0;

  const sortedByDate = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  let avgDaysBetween = 0;
  if (sortedByDate.length > 1) {
    const first = new Date(sortedByDate[0].publishedAt).getTime();
    const last = new Date(sortedByDate[sortedByDate.length - 1].publishedAt).getTime();
    const spanDays = (last - first) / (1000 * 60 * 60 * 24);
    avgDaysBetween = Math.round((spanDays / (videos.length - 1)) * 10) / 10;
  }

  const topFive = [...videos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  const topAvgDuration = topFive.length ? topFive.reduce((s, v) => s + v.durationSeconds, 0) / topFive.length : 0;
  const topAvgTitleLength = topFive.length ? topFive.reduce((s, v) => s + v.title.split(' ').length, 0) / topFive.length : 0;
  const topWithNumbers = topFive.filter(v => /\d/.test(v.title)).length;
  const topNumberPercent = topFive.length ? Math.round((topWithNumbers / topFive.length) * 100) : 0;

  const half = Math.floor(sortedByDate.length / 2);
  const olderHalf = sortedByDate.slice(0, half);
  const newerHalf = sortedByDate.slice(half);
  const olderAvg = olderHalf.length ? olderHalf.reduce((s, v) => s + v.viewCount, 0) / olderHalf.length : 0;
  const newerAvg = newerHalf.length ? newerHalf.reduce((s, v) => s + v.viewCount, 0) / newerHalf.length : 0;
  const trendPct = olderAvg > 0 ? Math.round(((newerAvg - olderAvg) / olderAvg) * 100) : 0;
  const phase = Math.abs(trendPct) < 5 ? 'stable' : trendPct > 0 ? 'acceleration' : 'deceleration';

  return [
    {
      id: 'strategy',
      type: 'strategy',
      icon: '🎯',
      title: strategyTitle,
      body: strategyBody,
      stat: strategyStat,
      confidence: topKeywords.length > 0 ? 'high' : 'low',
    },
    {
      id: 'timing',
      type: 'timing',
      icon: '📅',
      title: 'Optimal Upload Pattern',
      body: `Posts every ${avgDaysBetween} days. ${DAY_NAMES[peakDay]} uploads average ${Math.abs(peakDayDiff)}% ${peakDayDiff >= 0 ? 'more' : 'fewer'} views than other days.`,
      stat: `Every ${avgDaysBetween} days avg`,
      confidence: videos.length >= 10 ? 'high' : 'medium',
    },
    {
      id: 'formula',
      type: 'formula',
      icon: '🔥',
      title: 'Top Video Formula',
      body: `Best videos average ${Math.round(topAvgDuration / 60)} min runtime with ${Math.round(topAvgTitleLength)}-word titles. ${topNumberPercent}% include a number in the title.`,
      stat: `${Math.round(topAvgDuration / 60)} min avg runtime`,
      confidence: topFive.length >= 5 ? 'high' : 'medium',
    },
    {
      id: 'trajectory',
      type: 'trajectory',
      icon: '📈',
      title: 'Growth Trajectory Signal',
      body: `Recent videos avg ${Math.abs(trendPct)}% ${trendPct >= 0 ? 'more' : 'fewer'} views than older content. Channel is in ${phase} phase.`,
      stat: `${trendPct >= 0 ? '+' : ''}${trendPct}% view trend`,
      confidence: videos.length >= 10 ? 'high' : 'low',
    },
  ];
}

async function geminiInsights(channel: ChannelData, videos: VideoData[]): Promise<InsightCard[]> {
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  if (!baseUrl || !apiKey) throw new Error('Gemini integration not configured');

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: '', baseUrl },
  });

  const now = new Date();
  const videoSummary = videos.slice(0, 30).map(v => {
    const daysSince = Math.max(1, Math.round((now.getTime() - new Date(v.publishedAt).getTime()) / 86400000));
    return {
      title: v.title,
      views: v.viewCount,
      likes: v.likeCount,
      comments: v.commentCount,
      published: v.publishedAt,
      durationSecs: v.durationSeconds,
      viewsPerDay: Math.round(v.viewCount / daysSince),
    };
  });

  const prompt = `You are a YouTube channel intelligence analyst. Analyze this channel's data and return exactly 4 sharp, specific insight cards as a JSON array.

Channel: ${channel.title}
Subscribers: ${channel.subscriberCount.toLocaleString()}
Total videos analyzed: ${videos.length}
Avg engagement rate: ${channel.avgEngagementRate}%

Recent videos (sorted newest first):
${JSON.stringify(videoSummary, null, 2)}

Return a JSON array of exactly 4 objects. Each object must have:
- "id": one of "strategy", "timing", "formula", "trajectory"
- "type": same as id
- "icon": a relevant emoji
- "title": max 8 words, punchy
- "body": max 35 words, include specific numbers from the data, actionable insight
- "stat": the key metric (e.g. "4.2M avg views", "Tuesday peak", "+23% trend")
- "confidence": "high", "medium", or "low"

Rules:
1. Use real numbers from the data — never generic statements
2. strategy: What content topics/themes drive the most views?
3. timing: When does this channel post and which days/cadence performs best?
4. formula: What do the top-performing videos have in common (length, title style, format)?
5. trajectory: Is this channel growing, declining, or stable? Use views/day trends.

Return ONLY the JSON array, no markdown, no explanation.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 8192 },
  });

  const text = response.text ?? '';
  const jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || text.match(/(\[[\s\S]*\])/);
  if (!jsonMatch) throw new Error('No JSON array in Gemini response');
  const jsonText = jsonMatch[1] || jsonMatch[0];

  const raw = JSON.parse(jsonText) as Partial<InsightCard>[];
  if (!Array.isArray(raw) || raw.length !== 4) throw new Error('Expected 4 insight cards');

  return raw.map((item, i) => ({
    id: item.id || ['strategy', 'timing', 'formula', 'trajectory'][i] || `insight-${i}`,
    type: item.type || 'strategy',
    icon: item.icon || '💡',
    title: item.title || 'Insight',
    body: item.body || '',
    stat: item.stat,
    confidence: item.confidence || 'medium',
  }));
}

async function openaiInsights(channel: ChannelData, videos: VideoData[]): Promise<InsightCard[]> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) throw new Error('No OpenAI key');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content: `You are a YouTube content strategist AI. Analyze channel data and return a JSON array of exactly 4 insight objects with this exact shape: [{ "type": "strategy"|"timing"|"formula"|"trajectory", "icon": "emoji", "title": "string (max 8 words)", "body": "string (max 30 words, specific with numbers)", "stat": "string (key metric)", "confidence": "high"|"medium"|"low" }]. Be specific. Use actual numbers from the data. No vague statements. Return only valid JSON array.`,
          },
          {
            role: 'user',
            content: JSON.stringify({
              channelTitle: channel.title,
              subscriberCount: channel.subscriberCount,
              videoCount: videos.length,
              avgEngagement: channel.avgEngagementRate,
              videos: videos.slice(0, 20).map(v => ({
                title: v.title,
                views: v.viewCount,
                likes: v.likeCount,
                comments: v.commentCount,
                published: v.publishedAt,
                duration: v.durationSeconds,
              })),
            }),
          },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);

    const data = await res.json() as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');

    const raw = JSON.parse(jsonMatch[0]) as Partial<InsightCard>[];
    if (!Array.isArray(raw) || raw.length !== 4) throw new Error('Invalid insight array');

    return raw.map((item, i) => ({
      id: item.id || `insight-${i}`,
      type: item.type || 'strategy',
      icon: item.icon || '💡',
      title: item.title || 'Insight',
      body: item.body || '',
      stat: item.stat,
      confidence: item.confidence || 'medium',
    }));
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function generateInsights(channel: ChannelData, videos: VideoData[]): Promise<InsightCard[]> {
  if (process.env.AI_INTEGRATIONS_GEMINI_BASE_URL && process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    try {
      return await geminiInsights(channel, videos);
    } catch (err) {
      console.warn('Gemini insights failed, trying next provider:', err);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      return await openaiInsights(channel, videos);
    } catch (err) {
      console.warn('OpenAI insights failed, falling back to algorithmic:', err);
    }
  }

  return algorithmicInsights(channel, videos);
}
