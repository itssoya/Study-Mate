import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  BookOpen,
  Layers,
  HelpCircle,
  TrendingUp,
  Settings,
  Flame,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  { label: "My Library", path: "/library", icon: BookOpen },
  { label: "Flashcards", path: "/flashcards", icon: Layers },
  { label: "Quizzes", path: "/quizzes", icon: HelpCircle },
  { label: "Quiz Room", path: "/quiz-room", icon: Users },
  { label: "Progress", path: "/progress", icon: TrendingUp },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const streak = user?.streak ?? 0;
  const userName = user?.name ?? "";
  const avatarUrl = user?.avatarUrl;

  const SidebarContent = (
    <>
      <div className="px-6 py-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-primary">StudyMate</h1>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-text-muted hover:text-text-primary"
        >
          <X size={22} />
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-text-muted hover:bg-primary-light/10 hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — always visible at md+ */}
      <aside className="hidden md:flex md:flex-col w-64 bg-surface border-r border-primary-light/20">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar — slide-in drawer, only rendered when open */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface flex flex-col shadow-xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 border-b border-primary-light/20 bg-surface">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-text-primary"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <div className="flex items-center gap-1.5 bg-accent-light/20 text-accent px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium">
              <Flame size={16} />
              <span className="hidden sm:inline">{streak} Day Streak</span>
              <span className="sm:hidden">{streak}</span>
            </div>
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  {userName?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline text-sm font-medium text-text-primary">
                {userName}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
