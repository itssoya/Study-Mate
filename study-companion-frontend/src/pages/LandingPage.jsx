import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Trophy, ArrowRight, CheckCircle2, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LandingNavbar from "../components/LandingNavbar";
import FeatureShowcase from "../components/FeatureShowcase";

const steps = [
  {
    title: "Upload your notes",
    description: "Drop in a PDF, DOCX, or PPTX from any class.",
  },
  {
    title: "Take the quiz",
    description: "AI builds questions from your material instantly.",
  },
  {
    title: "Master your weak spots",
    description: "Missed questions become flashcards — review, retest, done.",
  },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div className="bg-background">
      {/* Header */}
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 md:px-12 pt-16 pb-24 max-w-7xl mx-auto">
        <div className="absolute w-96 h-96 rounded-full bg-primary-light/20 blur-3xl -top-20 -left-20 -z-10" />
        <div className="absolute w-80 h-80 rounded-full bg-accent-light/25 blur-3xl top-40 right-0 -z-10" />

        <div className="max-w-3xl mx-auto text-center relative">
          <div
            className="absolute -top-6 left-4 md:left-16 bg-surface rounded-xl shadow-lg px-4 py-3 flex items-center gap-2"
            style={{ animation: "float 7s ease-in-out infinite" }}
          >
            <Flame className="text-accent" size={18} />
            <span className="text-sm font-medium text-text-primary">
              7 day streak
            </span>
          </div>
          <div
            className="absolute top-10 right-2 md:right-10 bg-surface rounded-xl shadow-lg px-4 py-3 flex items-center gap-2"
            style={{
              animation: "float-slow 8s ease-in-out infinite",
              animationDelay: "1s",
            }}
          >
            <CheckCircle2 className="text-success" size={18} />
            <span className="text-sm font-medium text-text-primary">
              Topic mastered
            </span>
          </div>
          <div
            className="absolute bottom-0 left-2 md:left-10 bg-surface rounded-xl shadow-lg px-4 py-3 flex items-center gap-2 hidden sm:flex"
            style={{
              animation: "float 9s ease-in-out infinite",
              animationDelay: "2s",
            }}
          >
            <Trophy className="text-primary" size={18} />
            <span className="text-sm font-medium text-text-primary">
              Quiz room won
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl text-text-primary leading-tight mb-6">
            Turn your notes into knowledge that sticks.
          </h1>
          <p className="text-text-muted text-lg mb-10 max-w-xl mx-auto">
            Upload your lecture notes and StudyMate builds quizzes, generates
            flashcards from your actual mistakes, and tells you exactly what
            you've mastered — automatically.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Start Studying Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 rounded-full font-medium text-text-primary border border-primary-light/40 hover:bg-primary-light/10 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="px-6 md:px-12 py-20 max-w-6xl mx-auto scroll-mt-24"
      >
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-4xl text-text-primary mb-3">
            Everything you need to actually retain it
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Not another generic flashcard app — every feature exists to close
            the specific gaps in what you know.
          </p>
        </div>

        <FeatureShowcase />
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="px-6 md:px-12 py-20 bg-primary/5 scroll-mt-24"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-text-primary text-center mb-14">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-display text-xl flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-display text-lg text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-text-muted text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-4xl text-text-primary mb-4">
          Ready to build real momentum?
        </h2>
        <p className="text-text-muted mb-8">
          Free to start. No credit card required.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          Get Started <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-light/20 px-6 md:px-12 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <img
                src="/Logo.gif"
                alt="StudyMate"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-text-muted text-sm leading-relaxed">
              Turn your notes into knowledge that sticks.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary mb-3">
              Product
            </p>
            <div className="flex flex-col gap-2 text-sm text-text-muted">
              <a
                href="/#features"
                className="hover:text-text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="hover:text-text-primary transition-colors"
              >
                How it works
              </a>
              <Link
                to="/signup"
                className="hover:text-text-primary transition-colors"
              >
                Start for Free
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary mb-3">
              Account
            </p>
            <div className="flex flex-col gap-2 text-sm text-text-muted">
              <Link
                to="/login"
                className="hover:text-text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hover:text-text-primary transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary mb-3">Legal</p>
            <div className="flex flex-col gap-2 text-sm text-text-muted">
              <a href="#" className="hover:text-text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-primary-light/20 text-sm text-text-muted">
          © 2026 StudyMate
        </div>
      </footer>
    </div>
  );
}
