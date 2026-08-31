import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

const featureGroups = [
  {
    label: "Learn",
    items: [
      {
        image: "/icons/upload.png", // image link here
        title: "Upload Any Material",
        description: "PDF, Word, or PowerPoint — parsed automatically.",
      },
      {
        image: "/icons/AI.png", // image link here
        title: "AI-Generated Quizzes",
        description: "Real questions built from your own notes.",
      },
    ],
  },
  {
    label: "Retain",
    items: [
      {
        image: "/icons/mistake.png", // image link here
        title: "Mistake-Driven Flashcards",
        description: "Built only from what you actually got wrong.",
      },
      {
        image: "/icons/review.png", // image link here
        title: "Review, Retest, Repeat",
        description: "Retest until a topic is marked mastered.",
      },
    ],
  },
  {
    label: "Compete & Track",
    items: [
      {
        image: "/icons/multiplayer.png", // image link here
        title: "Live Multiplayer Quiz Rooms",
        description: "Race friends live with a shared room code.",
      },
      {
        image: "/icons/progress.png", // image link here
        title: "Progress Tracking",
        description: "Accuracy trends, streaks, and a study heatmap.",
      },
    ],
  },
];

export default function LandingNavbar() {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setFeaturesOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary-light/20">
      {/* This wrapper is the positioning context for the full-width dropdown below */}
      <div className="relative" ref={menuRef}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src="/Logo.gif"
                alt="StudyMate"
                className="w-full h-full object-contain"
              />
            </div>

            <span className="font-display text-lg text-text-primary">
              StudyMate
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setFeaturesOpen((v) => !v)}
              className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-text-primary hover:bg-primary-light/10 transition-colors"
            >
              Features
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  featuresOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <a
              href="/#how-it-works"
              className="px-4 py-2 rounded-full text-sm font-medium text-text-primary hover:bg-primary-light/10 transition-colors"
            >
              How it works
            </a>
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-text-primary px-4 py-2 rounded-full hover:bg-primary-light/10 transition-colors"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="text-sm font-medium bg-primary text-white px-5 py-2 rounded-full hover:bg-primary/90 transition-colors"
            >
              Start for Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-text-primary"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Full-width mega menu */}
        {featuresOpen && (
          <div className="hidden md:block absolute left-0 right-0 top-full">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="mt-3 bg-background rounded-3xl shadow-2xl border border-primary-light/20 p-8 md:p-12 grid grid-cols-3 gap-x-10 gap-y-10">
                {featureGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-medium text-text-muted tracking-wide mb-5">
                      {group.label}
                    </p>

                    <div className="flex flex-col gap-6">
                      {group.items.map(({ image, title, description }) => (
                        <Link
                          key={title}
                          to="/#features"
                          onClick={() => setFeaturesOpen(false)}
                          className="flex items-start gap-4 group"
                        >
                          {/* PNG ICON */}
                          <div className="w-11 h-11 rounded-xl bg-primary-light/20 flex items-center justify-center shrink-0 group-hover:bg-primary-light/30 transition-colors overflow-hidden">
                            <img
                              src={image}
                              alt=""
                              className="w-6 h-6 object-contain"
                            />
                          </div>

                          <div>
                            <p className="text-base font-medium text-text-primary">
                              {title}
                            </p>

                            <p className="text-sm text-text-muted leading-snug">
                              {description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-primary-light/20 px-6 py-4 flex flex-col gap-5 bg-background">
          {featureGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-text-muted mb-2">
                {group.label}
              </p>

              <div className="flex flex-col gap-2">
                {group.items.map(({ image, title }) => (
                  <a
                    key={title}
                    href="/#features"
                    className="flex items-center gap-2 text-sm text-text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {/* PNG ICON */}
                    <img
                      src={image}
                      alt=""
                      className="w-4 h-4 object-contain"
                    />

                    {title}
                  </a>
                ))}
              </div>
            </div>
          ))}

          <a
            href="/#how-it-works"
            className="text-sm font-medium text-text-primary"
            onClick={() => setMobileOpen(false)}
          >
            How it works
          </a>

          <div className="flex flex-col gap-2 pt-3 border-t border-primary-light/20">
            <Link
              to="/login"
              className="text-sm font-medium text-text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="text-sm font-medium bg-primary text-white text-center px-5 py-2 rounded-full"
              onClick={() => setMobileOpen(false)}
            >
              Start for Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
