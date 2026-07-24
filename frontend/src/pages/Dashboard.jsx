import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, Trophy, BookOpen, Bot, NotebookPen, Calculator, Youtube, Search } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import Loader from "../components/Loader";

const quickActions = [
  { to: "/ai-tutor", label: "Ask AI Tutor", icon: Bot, color: "bg-primary" },
  { to: "/notes", label: "New Note", icon: NotebookPen, color: "bg-success" },
  { to: "/calculators", label: "Calculator Hub", icon: Calculator, color: "bg-accent" },
  { to: "/youtube", label: "Watch & Learn", icon: Youtube, color: "bg-danger" },
];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/users/dashboard")).data.dashboard,
  });

  if (isLoading) return <Loader label="Loading your dashboard..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-semibold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-slate-400 mt-1">{data?.motivation}</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Day streak" value={data?.streak ?? 0} color="text-danger" />
        <StatCard icon={Trophy} label="XP" value={data?.xp ?? 0} color="text-accent" />
        <StatCard icon={BookOpen} label="Level" value={data?.level ?? 1} color="text-primary" />
        <StatCard icon={Search} label="Today's study" value={`${data?.todayStudyMinutes ?? 0}m`} color="text-success" />
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} className="card p-5 flex flex-col items-start gap-3 hover:-translate-y-0.5 transition-transform">
              <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center`}>
                <Icon size={18} />
              </div>
              <span className="font-medium text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-2">Getting started</h3>
          <ul className="text-sm text-slate-500 space-y-2 list-disc list-inside">
            <li>Ask the AI Tutor to explain a concept you're stuck on</li>
            <li>Create your first note and let AI summarize it</li>
            <li>Use Smart Search to research any topic in one place</li>
            <li>Generate a quiz to test yourself before an exam</li>
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-2">About this build</h3>
          <p className="text-sm text-slate-500">
            This is StudySphere v1 — Auth, Dashboard, AI Tutor, Notes, Smart Search, Calculator Hub, and
            YouTube integration, built entirely on free-tier APIs (Groq, YouTube Data API, Wikipedia).
            PDF Assistant, Flashcards UI, Quiz Generator UI, Study Planner and Gamification ship in v2/v3.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <Icon className={color} size={20} />
      <p className="text-2xl font-semibold mt-3">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
