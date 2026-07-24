import { useState } from "react";
import { Menu, Moon, Sun, LogOut, Command } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// import logo from ".../public/logo-with-name.png";

export default function Navbar({ onMenuClick, dark, setDark }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    logout();
    toast.success("Logged out");
    navigate("/login");
    setLoggingOut(false);
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        {/* <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 w-72">
          <Command size={14} />
          <span>Press Ctrl+K to search</span>
        </div> */}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDark(!dark)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
