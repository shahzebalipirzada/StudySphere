import fetch from "node-fetch";

// @route GET /api/youtube/search?q=...
export const searchYoutube = async (req, res, next) => {
  try {
    const { q, maxResults = 8 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query required" });

    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "YouTube API not configured. Set YOUTUBE_API_KEY in .env (free quota at Google Cloud Console).",
      });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(
      q
    )}&key=${process.env.YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ success: false, message: data?.error?.message || "YouTube API error" });
    }

    const videos = (data.items || []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json({ success: true, videos });
  } catch (err) {
    next(err);
  }
};
