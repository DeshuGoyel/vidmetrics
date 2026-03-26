import { Router, type IRouter } from 'express';
import { fetchChannel, fetchVideoIds, fetchVideoDetails, enrichVideos } from '../lib/youtube.js';
import { calculateHealthScore } from '../lib/analytics.js';
import { generateInsights } from '../lib/insights.js';
import { DEMO_DATA } from '../lib/demoData.js';

const router: IRouter = Router();

router.get('/analyze', async (req, res) => {
  const url = req.query.url as string | undefined;

  if (!url) {
    res.status(400).json({ error: 'MISSING_URL', message: 'URL parameter is required.' });
    return;
  }

  if ((!process.env.YOUTUBE_API_KEY && !process.env.GOOGLE_API_KEY) || url === 'demo') {
    res.json(DEMO_DATA);
    return;
  }

  try {
    const channel = await fetchChannel(url);
    const videoIds = await fetchVideoIds(channel.uploadPlaylistId, 50);
    const rawVideos = await fetchVideoDetails(videoIds);
    const videos = enrichVideos(rawVideos);

    if (videos.length > 0) {
      channel.avgEngagementRate = parseFloat(
        (videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length).toFixed(2)
      );
    }

    channel.healthScore = calculateHealthScore(channel, videos);
    const insights = await generateInsights(channel, videos);

    res.setHeader('Cache-Control', 's-maxage=3600');
    res.json({
      channel,
      videos,
      insights,
      fetchedAt: new Date().toISOString(),
      isDemo: false,
    });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    req.log?.error({ err }, 'Analysis failed');

    switch (error.code) {
      case 'CHANNEL_NOT_FOUND':
        res.status(404).json({
          error: 'CHANNEL_NOT_FOUND',
          message: "We couldn't find that channel. Check the URL and try again.",
        });
        break;
      case 'QUOTA_EXCEEDED':
        res.status(429).json({
          error: 'QUOTA_EXCEEDED',
          message: 'YouTube API daily limit reached. Try again tomorrow.',
        });
        break;
      case 'INVALID_URL':
        res.status(400).json({
          error: 'INVALID_URL',
          message: 'Please enter a valid YouTube channel URL.',
        });
        break;
      default:
        res.status(500).json({
          error: 'SERVER_ERROR',
          message: 'Something went wrong. Please try again.',
        });
    }
  }
});

export default router;
