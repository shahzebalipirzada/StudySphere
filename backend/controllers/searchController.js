import fetch from "node-fetch";
import Note from "../models/Note.js";
import { askAI } from "./aiController.js";

// Free, no-key Wikipedia summary
const fetchWikipediaSummary = async (query) => {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const title = searchData?.query?.search?.[0]?.title;
    if (!title) return null;

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();
    return {
      title: summaryData.title,
      extract: summaryData.extract,
      url: summaryData.content_urls?.desktop?.page,
      thumbnail: summaryData.thumbnail?.source,
    };
  } catch {
    return null;
  }
};

const fetchYoutubeResults = async (query) => {
  if (!process.env.YOUTUBE_API_KEY) return [];
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=4&q=${encodeURIComponent(
      query
    )}&key=${process.env.YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) return [];
    return (data.items || []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.channelTitle,
    }));
  } catch {
    return [];
  }
};

// @route GET /api/search?q=...
export const smartSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query required" });

    const [wikipedia, videos, aiExplanation, notes] = await Promise.all([
      fetchWikipediaSummary(q),
      fetchYoutubeResults(q),
      askAI([
        {
          role: "system",
          content:
            "You are a study assistant. Give a clear, well-structured explanation of the topic in under 200 words, using Markdown with headers/bullets where useful.",
        },
        { role: "user", content: q },
      ]).catch(() => "AI explanation unavailable right now."),
      Note.find({ user: req.user._id, $text: { $search: q } }).limit(5).catch(() => []),
    ]);

    res.json({
      success: true,
      results: {
        query: q,
        aiExplanation,
        wikipedia,
        videos,
        notes,
      },
    });
  } catch (err) {
    next(err);
  }
};
