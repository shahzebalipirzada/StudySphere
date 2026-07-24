import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Search, BookOpen, Youtube, NotebookPen, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/Loader";

export default function SmartSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await api.get("/search", { params: { q: query } });
      setResults(res.data.results);
    } catch (err) {
      toast.error(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Smart Search</h1>
        <p className="text-slate-400 text-sm">
          One search across AI explanations, Wikipedia, YouTube, and your notes.
        </p>
      </div>

      <form onSubmit={search} className="flex gap-2">
        <div className="input flex items-center gap-2 flex-1">
          <Search size={16} className="text-slate-400" />
          <input
            className="flex-1 bg-transparent outline-none"
            placeholder="e.g. Operating System Deadlock"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary px-6" disabled={loading}>
          Search
        </button>
      </form>

      {loading && <Loader label="Gathering the best explanations..." />}

      {results && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Search size={16} className="text-primary" /> AI Explanation</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{results.aiExplanation}</ReactMarkdown>
            </div>
          </div>

          {results.wikipedia && (
            <div className="card p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><BookOpen size={16} className="text-accent" /> Wikipedia</h3>
              <p className="text-sm text-slate-500 mb-2">{results.wikipedia.extract}</p>
              <a href={results.wikipedia.url} target="_blank" rel="noreferrer" className="text-primary text-sm inline-flex items-center gap-1">
                Read more <ExternalLink size={12} />
              </a>
            </div>
          )}

          {results.videos?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Youtube size={16} className="text-danger" /> Related Videos</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {results.videos.map((v) => (
                  <a
                    key={v.videoId}
                    href={`https://youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl p-2 -m-2"
                  >
                    <img src={v.thumbnail} alt="" className="w-24 h-16 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{v.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{v.channelTitle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {results.notes?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><NotebookPen size={16} className="text-success" /> Your related notes</h3>
              <div className="space-y-2">
                {results.notes.map((n) => (
                  <div key={n._id} className="text-sm px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <p className="font-medium">{n.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
