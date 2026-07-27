import { NavLink } from "react-router-dom";
import logo from "../assets/logo-with-name.png";
import {
  LayoutDashboard,
  Bot,
  NotebookPen,
  Search,
  Calculator,
  Youtube,
  User,
  X,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/search", label: "Smart Search", icon: Search },
  { to: "/calculators", label: "Calculator Hub", icon: Calculator },
  { to: "/youtube", label: "YouTube Hub", icon: Youtube },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white dark:bg-[#0B1120] border-r border-slate-100 dark:border-slate-800 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              <span>

                <img src={logo} alt="StudySphere Logo" />
              </span>
            </div>
            {/* <span className="font-semibold text-lg">StudySphere</span> */}
          </div>
          <button className="md:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
          StudySphere v1 · AI Student OS
        </div>
      </aside>
    </>
  );
}
