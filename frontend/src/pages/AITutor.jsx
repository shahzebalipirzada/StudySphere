import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Send, Plus, Trash2, Bot, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/Loader";

export default function AITutor() {
  const queryClient = useQueryClient();
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => (await api.get("/ai/chats")).data.chats,
  });

  useEffect(() => {
    if (!activeChat && chats?.length) setActiveChat(chats[0]._id);
  }, [chats]);

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", activeChat],
    queryFn: async () => (await api.get(`/ai/chats/${activeChat}/messages`)).data.messages,
    enabled: !!activeChat,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createChat = async () => {
    const res = await api.post("/ai/chats", {});
    queryClient.invalidateQueries({ queryKey: ["chats"] });
    setActiveChat(res.data.chat._id);
  };

  const deleteChat = async (id) => {
    await api.delete(`/ai/chats/${id}`);
    queryClient.invalidateQueries({ queryKey: ["chats"] });
    if (activeChat === id) setActiveChat(null);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    let chatId = activeChat;
    if (!chatId) {
      const res = await api.post("/ai/chats", {});
      chatId = res.data.chat._id;
      setActiveChat(chatId);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    }
    const content = input;
    setInput("");
    setSending(true);
    queryClient.setQueryData(["messages", chatId], (old = []) => [
      ...old,
      { _id: "temp-" + Date.now(), role: "user", content },
    ]);
    try {
      await api.post(`/ai/chats/${chatId}/messages`, { content });
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "AI Tutor failed to respond");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-4">
      <div className="w-64 card p-3 hidden md:flex flex-col">
        <button onClick={createChat} className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
          <Plus size={16} /> New chat
        </button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {chatsLoading ? (
            <Loader label="Loading chats..." />
          ) : (
            chats?.map((c) => (
              <div
                key={c._id}
                onClick={() => setActiveChat(c._id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm cursor-pointer ${
                  activeChat === c._id ? "bg-primary/10 text-primary" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate">{c.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(c._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 card flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeChat && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <Bot size={40} className="mb-3 text-primary" />
              <p className="font-medium text-secondary dark:text-slate-100">Ask me anything about your studies</p>
              <p className="text-sm mt-1">Explanations, examples, code, math, quizzes — I remember our conversation.</p>
            </div>
          )}
          {messagesLoading && <Loader label="Loading messages..." />}
          {messages?.map((m) => (
            <div key={m._id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-slate-200 dark:bg-slate-700" : "bg-primary text-white"
                }`}
              >
                {m.role === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm prose prose-sm dark:prose-invert prose-p:my-1 ${
                  m.role === "user" ? "bg-primary text-white prose-invert" : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {sending && <Loader label="AI Tutor is thinking..." />}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <textarea
            rows={1}
            className="input resize-none"
            placeholder="Ask about any topic, paste code, or request a quiz..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage} disabled={sending} className="btn-primary px-4">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
