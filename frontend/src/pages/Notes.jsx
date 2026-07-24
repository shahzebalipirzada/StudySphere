import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Plus, Trash2, Sparkles, Pin, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/Loader";

export default function Notes() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState({ title: "", content: "" });
  const [summarizing, setSummarizing] = useState(false);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", search],
    queryFn: async () => (await api.get("/notes", { params: search ? { search } : {} })).data.notes,
  });

  const activeNote = notes?.find((n) => n._id === activeId);

  const createNote = async () => {
    const res = await api.post("/notes", { title: "Untitled note", content: "" });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    setActiveId(res.data.note._id);
    setEditing({ title: res.data.note.title, content: res.data.note.content });
  };

  const selectNote = (n) => {
    setActiveId(n._id);
    setEditing({ title: n.title, content: n.content });
  };

  const saveNote = async () => {
    if (!activeId) return;
    await api.put(`/notes/${activeId}`, editing);
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    toast.success("Saved");
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    if (activeId === id) setActiveId(null);
  };

  const togglePin = async (n) => {
    await api.put(`/notes/${n._id}`, { pinned: !n.pinned });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  const summarize = async () => {
    if (!activeId) return;
    setSummarizing(true);
    try {
      await api.put(`/notes/${activeId}`, editing);
      const res = await api.post(`/notes/${activeId}/summarize`);
      toast.success("Summary generated");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      alert(res.data.summary); // simple display; could be a modal
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to summarize");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-4">
      <div className="w-72 card p-3 flex flex-col overflow-hidden">
        <div className="flex gap-2 mb-3">
          <div className="input flex items-center gap-2 flex-1 min-w-0">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              className="flex-1 min-w-0 bg-transparent outline-none text-sm"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={createNote} className="btn-primary px-3 shrink-0">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {isLoading ? (
            <Loader label="Loading notes..." />
          ) : notes?.length ? (
            notes.map((n) => (
              <div
                key={n._id}
                onClick={() => selectNote(n)}
                className={`group flex items-start justify-between px-3 py-2.5 rounded-xl cursor-pointer ${
                  activeId === n._id ? "bg-primary/10" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <p className="text-xs text-slate-400 truncate">{n.content?.slice(0, 40) || "Empty note"}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); togglePin(n); }}>
                    <Pin size={13} className={n.pinned ? "text-accent fill-accent" : "text-slate-400"} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteNote(n._id); }}>
                    <Trash2 size={13} className="text-slate-400 hover:text-danger" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No notes yet</p>
          )}
        </div>
      </div>

      <div className="flex-1 card p-6 flex flex-col">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <input
                className="text-xl font-semibold bg-transparent outline-none flex-1 min-w-0"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                onBlur={saveNote}
              />
              <button onClick={summarize} disabled={summarizing} className="btn-secondary flex items-center gap-2 text-sm shrink-0">
                <Sparkles size={14} /> {summarizing ? "Summarizing..." : "AI Summarize"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
              <textarea
                className="input flex-1 h-full resize-none font-mono text-sm"
                placeholder="Write in Markdown..."
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                onBlur={saveNote}
              />
              <div className="input h-full overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{editing.content || "*Preview appears here*"}</ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">Select or create a note to begin</div>
        )}
      </div>
    </div>
  );
}