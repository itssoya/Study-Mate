import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

let googleScriptLoaded = false;
let googleScriptLoading = null;

function loadGoogleScript() {
  if (googleScriptLoaded) return Promise.resolve();
  if (googleScriptLoading) return googleScriptLoading;

  googleScriptLoading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      resolve();
    };
    document.body.appendChild(script);
  });

  return googleScriptLoading;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    loadGoogleScript().then(() => {
      if (cancelled || !googleButtonRef.current || !window.google) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await googleLogin(response.credential);
            navigate("/");
          } catch (_err) {
            setError("Google sign-in failed. Please try again.");
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
      });
    });

    return () => {
      cancelled = true;
    };
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-surface rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          Welcome back
        </h1>

        <p className="text-text-muted mb-6">
          Log in to keep your streak going.
        </p>

        {/* Google Login */}
        <div ref={googleButtonRef} className="mb-4 flex justify-center" />

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-primary-light/30" />
          <span className="text-xs text-text-muted">or</span>
          <div className="flex-1 h-px bg-primary-light/30" />
        </div>

        {/* Email + Password Login */}
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
              className="w-full border border-primary-light/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full border border-primary-light/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-lg py-2 font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Signup */}
        <p className="text-sm text-text-muted mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
