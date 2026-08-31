import { Link } from "react-router-dom";
import { Sparkles, Compass, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center px-6">
      <div className="absolute w-96 h-96 rounded-full bg-primary-light/20 blur-3xl -top-20 -left-20" />
      <div className="absolute w-80 h-80 rounded-full bg-accent-light/25 blur-3xl bottom-0 right-0" />

      <div
        className="absolute top-24 left-[15%] w-14 h-14 rounded-2xl bg-surface shadow-lg flex items-center justify-center"
        style={{ animation: "float 7s ease-in-out infinite" }}
      >
        <Compass className="text-primary" size={22} />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-30 h-30 flex items-center justify-center shrink-0">
            <img
              src="/Logo.gif"
              alt="StudyMate"
              className="w-full h-full object-contain"
            />
          </div>

          <span className="font-display text-xl text-primary">StudyMate</span>
        </div>
        <img
          src="/pagenotfound.gif"
          alt="404 — page not found"
          className="w-72 mx-auto mb-4"
        />

        <h1 className="font-display text-2xl text-text-primary mb-3">
          This page wandered off somewhere.
        </h1>
        <p className="text-text-muted mb-8">
          The page you're looking for doesn't exist, or may have moved. Let's
          get you back on track.
        </p>

        <Link
          to={user ? "/dashboard" : "/"}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={16} /> {user ? "Back to Dashboard" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}
