import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layers, CheckCircle2, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!window.google || !googleButtonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          await googleLogin(response.credential);
          navigate("/");
        } catch (err) {
          setError("Google sign-in failed. Please try again.");
        }
      },
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: 340,
      shape: "pill",
    });
  }, [googleLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left — form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-22 h-22 flex items-center justify-center shrink-0">
              <img
                src="/Logo.gif"
                alt="StudyMate"
                className="w-full h-full object-contain"
              />
            </div>

            <span className="font-display text-xl text-primary">StudyMate</span>
          </div>

          <h1 className="font-display text-3xl text-text-primary mb-1">
            Welcome back
          </h1>
          <p className="text-text-muted mb-8">
            Log in to keep your streak going.
          </p>

          <div ref={googleButtonRef} className="mb-6 flex justify-center" />

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-primary-light/30" />
            <span className="text-xs text-text-muted">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-primary-light/30" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-primary mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-primary-light/40 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-primary mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-primary-light/40 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-lg py-2.5 font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-sm text-text-muted mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right — animated panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-primary to-[#1F4630] items-center justify-center p-12">
        {/* soft background glow */}
        <div className="absolute w-96 h-96 rounded-full bg-accent-light/20 blur-3xl -top-20 -right-20" />
        <div className="absolute w-72 h-72 rounded-full bg-primary-light/20 blur-3xl bottom-0 -left-10" />

        {/* floating cards */}
        <div
          className="absolute top-24 left-16 bg-surface rounded-xl shadow-lg px-4 py-3 flex items-center gap-2"
          style={{ animation: "float 7s ease-in-out infinite" }}
        >
          <Layers className="text-primary" size={18} />
          <span className="text-sm font-medium text-text-primary">
            12 cards mastered
          </span>
        </div>

        <div
          className="absolute bottom-32 left-24 bg-surface rounded-xl shadow-lg px-4 py-3 flex items-center gap-2"
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
          className="absolute top-40 right-20 bg-surface rounded-xl shadow-lg px-4 py-3 flex items-center gap-2"
          style={{
            animation: "float 6s ease-in-out infinite",
            animationDelay: "2s",
          }}
        >
          <Flame className="text-accent" size={18} />
          <span className="text-sm font-medium text-text-primary">
            7 day streak
          </span>
        </div>

        {/* headline */}
        <div className="relative z-10 text-center max-w-md">
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Turn your notes into knowledge that sticks.
          </h2>
          <p className="text-white/80">
            Upload your material, and StudyMate builds quizzes and flashcards
            around exactly what you need to review — automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
