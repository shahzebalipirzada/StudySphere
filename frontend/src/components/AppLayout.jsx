import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import api from "../api/axios";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const queryClient = useQueryClient();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Study-time heartbeat: every 60s, if the tab is actually visible/focused,
  // report 1 minute of study time to the backend and refresh the dashboard.
  useEffect(() => {
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        await api.post("/users/track-study", { minutes: 1 });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      } catch {
        // silently ignore — not critical if a heartbeat is missed
      }
    };
    const interval = setInterval(tick, 60 * 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} dark={dark} setDark={setDark} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}