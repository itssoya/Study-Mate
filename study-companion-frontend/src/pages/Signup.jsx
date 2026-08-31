import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, BookOpen, Brain, Trophy, Layers } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup, googleLogin } = useAuth();
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
      await signup(name, email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center px-6 py-12">
      {/* ambient background glow */}
      <div className="absolute w-[32rem] h-[32rem] rounded-full bg-primary-light/20 blur-3xl -top-40 -left-40" />
      <div className="absolute w-96 h-96 rounded-full bg-accent-light/25 blur-3xl -bottom-32 -right-20" />

      {/* large, faded illustration behind everything */}
      <img
        src="/education.svg"
        alt=""
        className="absolute right-10 bottom-10 w-[50rem] opacity-[0.15] pointer-events-none select-none"
      />

      {/* floating icons scattered across the whole page */}
      <div
        className="absolute top-16 left-[8%] w-12 h-12 rounded-2xl bg-surface shadow-lg flex items-center justify-center"
        style={{ animation: "float 7s ease-in-out infinite" }}
      >
        <BookOpen className="text-primary" size={20} />
      </div>
      <div
        className="absolute top-1/3 right-[10%] w-12 h-12 rounded-2xl bg-surface shadow-lg flex items-center justify-center"
        style={{
          animation: "float-slow 9s ease-in-out infinite",
          animationDelay: "0.5s",
        }}
      >
        <Brain className="text-accent" size={20} />
      </div>
      <div
        className="absolute bottom-24 left-[14%] w-12 h-12 rounded-2xl bg-surface shadow-lg flex items-center justify-center"
        style={{
          animation: "float 8s ease-in-out infinite",
          animationDelay: "1.2s",
        }}
      >
        <Trophy className="text-success" size={20} />
      </div>
      <div
        className="absolute bottom-1/3 right-[16%] w-12 h-12 rounded-2xl bg-surface shadow-lg flex items-center justify-center"
        style={{
          animation: "float-slow 6.5s ease-in-out infinite",
          animationDelay: "1.8s",
        }}
      >
        <Layers className="text-primary" size={20} />
      </div>

      {/* centered card */}
      <div className="relative z-10 w-full max-w-md bg-background rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-8 -translate-x-70">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            <img
              src="/Logo.gif"
              alt="StudyMate"
              className="w-full h-full object-contain"
            />
          </div>

          <span className="font-display text-xl text-primary">StudyMate</span>
        </div>

        <h1 className="font-display text-2xl text-text-primary text-center mb-1">
          Create your account
        </h1>
        <p className="text-text-muted text-center mb-8">
          Start building study momentum today.
        </p>

        <div ref={googleButtonRef} className="mb-6 flex justify-center" />

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-primary-light/30" />
          <span className="text-xs text-text-muted">or</span>
          <div className="flex-1 h-px bg-primary-light/30" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-primary mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-primary-light/40 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
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
              minLength={6}
              className="w-full border border-primary-light/40 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-lg py-2.5 font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-xs text-text-muted text-center mt-5">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>

        <p className="text-sm text-text-muted mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
