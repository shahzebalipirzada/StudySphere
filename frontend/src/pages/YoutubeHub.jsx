import { useState } from "react";
import { Search, Youtube } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/Loader";

export default function YoutubeHub() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get("/youtube/search", { params: { q: query } });
      setVideos(res.data.videos);
      setActive(res.data.videos[0] || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "YouTube search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2"><Youtube className="text-danger" /> YouTube Hub</h1>
        <p className="text-slate-400 text-sm">Search educational videos and watch them without leaving StudySphere.</p>
      </div>

      <form onSubmit={search} className="flex gap-2">
        <div className="input flex items-center gap-2 flex-1">
          <Search size={16} className="text-slate-400" />
          <input
            className="flex-1 bg-transparent outline-none"
            placeholder="e.g. Linked lists explained"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary px-6" disabled={loading}>Search</button>
      </form>

      {loading && <Loader label="Finding the best videos..." />}

      {active && (
        <div className="card overflow-hidden">
          <div className="aspect-video">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${active.videoId}`}
              title={active.title}
              allowFullScreen
            />
          </div>
          <div className="p-4">
            <p className="font-medium">{active.title}</p>
            <p className="text-sm text-slate-400">{active.channelTitle}</p>
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {videos.map((v) => (
            <button
              key={v.videoId}
              onClick={() => setActive(v)}
              className={`card p-2 text-left hover:-translate-y-0.5 transition-transform ${active?.videoId === v.videoId ? "ring-2 ring-primary" : ""}`}
            >
              <img src={v.thumbnail} alt="" className="w-full aspect-video object-cover rounded-xl mb-2" />
              <p className="text-sm font-medium line-clamp-2 px-1">{v.title}</p>
              <p className="text-xs text-slate-400 px-1 pb-1">{v.channelTitle}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
