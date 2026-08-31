import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UploadCloud,
  Brain,
  Sparkles,
  RefreshCcw,
  Users,
  BarChart3,
  FileText,
  Check,
  Circle,
  Crown,
  ArrowRight,
} from "lucide-react";

const showcaseFeatures = [
  {
    id: "upload",
    tab: "Upload",
    eyebrow: "Upload Any Material",
    headline: "Drop it in, we'll take it from here",
    description:
      "PDF, Word, or PowerPoint — AI extracts the subject and key topics automatically, no formatting or cleanup needed.",
    icon: UploadCloud,
    panel: "primary",
  },
  {
    id: "quizzes",
    tab: "Quizzes",
    eyebrow: "AI-Generated Quizzes",
    headline: "Real questions, built from your own notes",
    description:
      "No manual work. Every upload becomes a real quiz built from your actual material, not generic questions.",
    icon: Brain,
    panel: "accent",
  },
  {
    id: "flashcards",
    tab: "Flashcards",
    eyebrow: "Mistake-Driven Flashcards",
    headline: "Only the cards you actually need",
    description:
      "Flashcards aren't generic — they're created only from what you actually get wrong, so every card matters.",
    icon: Sparkles,
    panel: "primary",
  },
  {
    id: "retest",
    tab: "Retest",
    eyebrow: "Review, Retest, Repeat",
    headline: "Score 100%, mark it mastered",
    description:
      "Study your flashcards, then take a fresh retest. Score 100% and that topic is marked mastered for good.",
    icon: RefreshCcw,
    panel: "accent",
  },
  {
    id: "multiplayer",
    tab: "Quiz Rooms",
    eyebrow: "Live Multiplayer Quiz Rooms",
    headline: "Race your friends, live",
    description:
      "Upload material, get a room code, and race friends in real time — fastest correct answers win.",
    icon: Users,
    panel: "primary",
  },
  {
    id: "progress",
    tab: "Progress",
    eyebrow: "Real Progress Tracking",
    headline: "Watch the effort add up",
    description:
      "Accuracy trends, topic mastery, study streaks, and an activity heatmap — see your progress add up.",
    icon: BarChart3,
    panel: "accent",
  },
];

// Shared fanned card-stack backdrop — every preview panel sits on top of
// three offset, rotated cards so it reads as a deck rather than a single tile.
function CardStack({ children }) {
  return (
    <div className="relative w-full">
      <div className="absolute top-8 -right-9 w-full h-full bg-primary/20 rounded-2xl rotate-12" />
      <div className="absolute top-4 -right-6 w-full h-full bg-success/30 rounded-2xl -rotate-6" />
      <div className="absolute top-1.5 -right-3 w-full h-full bg-accent-light rounded-2xl rotate-3" />
      <div className="relative">{children}</div>
    </div>
  );
}

function MockPreview({ id }) {
  if (id === "upload") {
    return (
      <CardStack>
        <div className="w-full bg-surface rounded-2xl shadow-lg p-5">
          <p className="text-xs font-medium text-text-muted mb-4">
            Extracting topics…
          </p>
          <div className="flex flex-col gap-3">
            {[
              { name: "Cardiovascular_Physiology.pdf", pct: 100 },
              { name: "Block2_Review_Guide.docx", pct: 72 },
              { name: "Lecture_Slides_Wk4.pptx", pct: 34 },
            ].map((file) => (
              <div key={file.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-light/20 flex items-center justify-center shrink-0">
                  <FileText className="text-primary" size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-primary truncate">
                    {file.name}
                  </p>
                  <div className="h-1.5 rounded-full bg-primary-light/20 mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${file.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardStack>
    );
  }

  if (id === "quizzes") {
    return (
      <CardStack>
        <div className="w-full bg-surface rounded-2xl shadow-lg p-5">
          <p className="text-xs font-medium text-text-muted mb-3">
            Cardiovascular Physiology · Q3
          </p>
          <p className="text-sm text-text-primary mb-4 leading-snug">
            Which structure conducts electrical impulses through the heart?
          </p>
          <div className="flex flex-col gap-2">
            {["SA node", "AV valve", "Pericardium", "Vena cava"].map(
              (option, i) => (
                <div
                  key={option}
                  className={`flex items-center justify-between text-sm rounded-lg px-3 py-2 ${
                    i === 0
                      ? "bg-success/10 text-text-primary"
                      : "bg-primary-light/10 text-text-muted"
                  }`}
                >
                  {option}
                  {i === 0 && <Check className="text-success" size={15} />}
                </div>
              ),
            )}
          </div>
        </div>
      </CardStack>
    );
  }

  if (id === "flashcards") {
    return (
      <CardStack>
        <div className="bg-surface rounded-2xl shadow-lg p-6 flex flex-col items-center text-center gap-3">
          <p className="text-xs font-medium text-text-muted">
            Missed on Tuesday
          </p>
          <p className="font-display text-lg text-text-primary">
            Cardiac output = ?
          </p>
          <p className="text-xs text-text-muted">Tap to reveal</p>
        </div>
      </CardStack>
    );
  }

  if (id === "retest") {
    return (
      <CardStack>
        <div className="w-full bg-surface rounded-2xl shadow-lg p-5">
          <p className="text-xs font-medium text-text-muted mb-4">
            Cardiovascular Physiology · Block 2
          </p>
          <div className="flex flex-col gap-3.5">
            {[
              { label: "Cardiac anatomy and blood flow", done: true },
              { label: "Electrical conduction and the ECG", done: true },
              { label: "The cardiac cycle and pressure loops", done: false },
              { label: "Cardiac output and vascular resistance", done: false },
            ].map((topic) => (
              <div key={topic.label} className="flex items-center gap-2.5">
                {topic.done ? (
                  <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center shrink-0">
                    <Check className="text-white" size={10} />
                  </div>
                ) : (
                  <Circle className="text-primary-light shrink-0" size={16} />
                )}
                <span
                  className={`text-sm ${
                    topic.done
                      ? "text-text-muted line-through"
                      : "text-text-primary"
                  }`}
                >
                  {topic.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardStack>
    );
  }

  if (id === "multiplayer") {
    return (
      <CardStack>
        <div className="w-full bg-surface rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-text-muted">Room code</p>
            <p className="text-sm font-display text-text-primary tracking-wide">
              7X4K2
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { name: "Priya", score: 480, place: 1 },
              { name: "You", score: 420, place: 2 },
              { name: "Marco", score: 310, place: 3 },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between text-sm bg-primary-light/10 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {p.place === 1 ? (
                    <Crown className="text-accent" size={14} />
                  ) : (
                    <span className="w-3.5 text-center text-text-muted text-xs">
                      {p.place}
                    </span>
                  )}
                  <span className="text-text-primary">{p.name}</span>
                </div>
                <span className="text-text-muted">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </CardStack>
    );
  }

  if (id === "progress") {
    const bars = [40, 65, 55, 80, 72, 90, 85];
    return (
      <CardStack>
        <div className="w-full bg-surface rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-medium text-text-muted">This week</p>
            <p className="text-sm text-text-primary font-medium">
              85% accuracy
            </p>
          </div>
          <div className="flex items-end gap-2 h-24">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary rounded-t-md"
                style={{ height: `${h}%`, opacity: 0.4 + (h / 100) * 0.6 }}
              />
            ))}
          </div>
        </div>
      </CardStack>
    );
  }

  return null;
}

export default function FeatureShowcase() {
  const [activeId, setActiveId] = useState(showcaseFeatures[0].id);
  const active = showcaseFeatures.find((f) => f.id === activeId);
  const Icon = active.icon;
  const panelBg =
    active.panel === "primary" ? "bg-primary-light" : "bg-accent-light";

  return (
    <div>
      {/* Tab pills */}
      <div
        role="tablist"
        className="flex items-center gap-1 overflow-x-auto pb-2 mb-8 md:justify-center scrollbar-hide"
      >
        {showcaseFeatures.map((feature) => (
          <button
            key={feature.id}
            role="tab"
            aria-selected={feature.id === activeId}
            onClick={() => setActiveId(feature.id)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              feature.id === activeId
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {feature.tab}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div
        className={`rounded-[2rem] p-8 md:p-14 grid md:grid-cols-2 gap-10 md:gap-16 items-center transition-colors duration-500 ${panelBg}`}
      >
        <div>
          <p className="italic text-text-primary/70 mb-3">{active.eyebrow}</p>
          <h3 className="font-display text-3xl md:text-4xl text-text-primary leading-tight mb-4">
            {active.headline}
          </h3>
          <p className="text-text-primary/70 mb-8 max-w-sm">
            {active.description}
          </p>
          <div className="flex items-center gap-3 mb-10">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-text-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get started <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 rounded-full text-sm font-medium text-text-primary border border-text-primary/20 hover:bg-white/30 transition-colors"
            >
              Learn more
            </a>
          </div>
          <div className="w-11 h-11 rounded-full bg-white/60 flex items-center justify-center">
            <Icon className="text-text-primary" size={20} />
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="w-full max-w-xs">
            <MockPreview id={active.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
