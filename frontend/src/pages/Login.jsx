
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Star,
  ShoppingBag,
  Store,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      if (!response.data.success || !response.data.user || !response.data.token) {
        throw new Error(
          response.data.message || "Invalid login response."
        );
      }

      const { user, token } = response.data;

      // Save authenticated user through AuthContext
      login(user, token);

      // Navigate according to account role
      if (user.role === "SYSTEM_ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "STORE_OWNER") {
        navigate("/owner/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to connect. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="login-grid" />

      {/* Floating shopping visuals */}
      <motion.div
        className="floating-visual visual-bag"
        animate={{ y: [0, -18, 0], rotate: [-5, 3, -5] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <ShoppingBag size={34} />
      </motion.div>

      <motion.div
        className="floating-visual visual-star"
        animate={{ y: [0, 16, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Star size={32} fill="currentColor" />
        <span>5.0</span>
      </motion.div>

      <motion.div
        className="floating-visual visual-store"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      >
        <Store size={34} />
      </motion.div>

      <motion.div
        className="floating-visual visual-shield"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <ShieldCheck size={30} />
      </motion.div>

      {/* Navigation */}
      <header className="login-nav">
        <Link to="/login" className="brand">
          <div className="brand-icon">
            <Star size={22} fill="currentColor" />
          </div>
          <span>
            Rate<span className="brand-highlight">Sphere</span>
          </span>
        </Link>

        <div className="nav-right">
          <span>New to RateSphere?</span>
          <Link to="/register" className="nav-signup">
            Create account <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <section className="login-content">
        <motion.div
          className="login-intro"
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="eyebrow">
            <Sparkles size={14} />
            THE SMARTER WAY TO SHOP
          </div>

          <h1>
            Every choice
            <br />
            deserves a
            <br />
            <span>better story.</span>
          </h1>

          <p className="intro-description">
            Discover exceptional stores, explore genuine
            customer experiences, and find the places
            worth your trust.
          </p>

          <div className="intro-features">
            <div>
              <div className="feature-icon">
                <Star size={18} />
              </div>
              <span>Authentic ratings</span>
            </div>

            <div>
              <div className="feature-icon">
                <ShieldCheck size={18} />
              </div>
              <span>Trusted experiences</span>
            </div>

            <div>
              <div className="feature-icon">
                <Store size={18} />
              </div>
              <span>Discover great stores</span>
            </div>
          </div>

          <div className="trust-note">
            <div className="trust-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={13} fill="currentColor" />
              ))}
            </div>
            <span>Discover. Rate. Trust.</span>
          </div>
        </motion.div>

        {/* Login form */}
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="card-top-icon">
            <LockKeyhole size={22} />
          </div>

          <div className="card-heading">
            <span className="card-overline">WELCOME BACK</span>
            <h2>Sign in to RateSphere</h2>
            <p>Your next great discovery starts here.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="password-label">
              <label htmlFor="password">Password</label>
            </div>

            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="login-divider">
            <span>NEW TO RATESPHERE?</span>
          </div>

          <Link to="/register" className="create-account">
            Create your free account
          </Link>

          <div className="secure-note">
            <ShieldCheck size={15} />
            Your experience. Your trust. Your choice.
          </div>
        </motion.div>
      </section>

      <footer className="login-footer">
        <span>© 2026 RateSphere</span>
        <span>DISCOVER <i>•</i> RATE <i>•</i> TRUST</span>
        <span>Made for better choices.</span>
      </footer>
    </main>
  );
}
