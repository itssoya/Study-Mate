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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  { label: "My Library", path: "/library", icon: BookOpen },
  { label: "Flashcards", path: "/flashcards", icon: Layers },
  { label: "Quizzes", path: "/quizzes", icon: HelpCircle },
  { label: "Quiz Room", path: "/quiz-room", icon: Users }, // add this
  { label: "Progress", path: "/progress", icon: TrendingUp },
  { label: "Settings", path: "/settings", icon: Settings },
];
export default function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  const streak = user?.streak ?? 0;
  const userName = user?.name ?? "";
  const avatarUrl = user?.avatarUrl;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-surface border-r border-primary-light/20 flex flex-col">
        <div className="px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <img
                src="/Logo.gif"
                alt="StudyMate"
                className="w-full h-full object-contain"
              />
            </div>

            <span className="font-display text-xl text-primary">StudyMate</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
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
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-end gap-4 px-8 py-5 border-b border-primary-light/20 bg-surface">
          <div className="flex items-center gap-1.5 bg-accent-light/20 text-accent px-3 py-1.5 rounded-full text-sm font-medium">
            <Flame size={16} />
            {streak} Day Streak
          </div>
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                {userName?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-text-primary">
              {userName}
            </span>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
