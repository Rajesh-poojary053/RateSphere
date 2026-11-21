
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
  UserPlus,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanAddress = form.address.trim();

    if (cleanName.length < 20 || cleanName.length > 60) {
      setError("Name must contain 20-60 characters.");
      return;
    }

    if (!cleanAddress || cleanAddress.length > 400) {
      setError("Please enter a valid address.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 16) {
      setError("Password must contain 8-16 characters.");
      return;
    }

    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(form.password)) {
      setError("Password must contain at least one special character.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: cleanName,
        email: cleanEmail,
        address: cleanAddress,
        password: form.password,
      });

      const { user, token } = response.data;

      if (!user || !token) {
        throw new Error("Invalid registration response from server.");
      }

      // Update authentication context and localStorage
      login(user, token);

      setSuccess("Account created successfully! Redirecting...");

      // Redirect according to user role
      if (user.role === "SYSTEM_ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "STORE_OWNER") {
        navigate("/owner/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="login-grid" />

      <nav className="login-nav">
        <Link to="/login" className="brand">
          <span className="brand-icon">
            <ShoppingBag size={21} />
          </span>
          <span>
            Rate<span className="brand-highlight">Sphere</span>
          </span>
        </Link>

        <div className="nav-right">
          <span>Already a member?</span>
          <Link to="/login" className="nav-signup">
            Sign in <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <main className="login-content">
        <motion.section
          className="login-intro"
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow">
            <Sparkles size={13} />
            JOIN THE COMMUNITY
          </div>

          <h1>
            Your opinions.
            <br />
            Your <span>influence.</span>
          </h1>

          <p className="intro-description">
            Discover trusted stores, share your shopping experiences,
            and help others make smarter decisions.
          </p>

          <div className="intro-features">
            <div>
              <span className="feature-icon">
                <Star size={16} />
              </span>
              Honest ratings
            </div>

            <div>
              <span className="feature-icon">
                <ShieldCheck size={16} />
              </span>
              Trusted community
            </div>
          </div>

          <div className="trust-note">
            <Sparkles size={19} color="#8debdc" />
            <span>A smarter way to discover great stores.</span>
          </div>
        </motion.section>

        <motion.section
          className="login-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="card-top-icon">
            <UserPlus size={23} />
          </div>

          <div className="card-heading">
            <div className="card-overline">
              CREATE YOUR ACCOUNT
            </div>
            <h2>Join RateSphere</h2>
            <p>Enter your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              minLength={20}
              maxLength={60}
              required
            />

            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              placeholder="Your complete address"
              value={form.address}
              onChange={handleChange}
              maxLength={400}
              required
            />

            <label htmlFor="password">Password</label>

            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                maxLength={16}
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

            <p style={{ color: "#9294a8", fontSize: 10, marginBottom: 18 }}>
              8–16 characters, at least one uppercase letter
              and one special character.
            </p>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {success && (
              <p style={{ color: "#83e8d5", fontSize: 12, marginBottom: 15 }}>
                {success}
              </p>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="login-divider">
            OR
          </div>

          <Link to="/login" className="create-account">
            Already have an account? Sign in
          </Link>

          <div className="secure-note">
            <ShieldCheck size={14} />
            Your information is protected.
          </div>
        </motion.section>
      </main>

      <footer className="login-footer">
        <span>© 2026 RateSphere. All rights reserved.</span>
        <span>Discover. Rate. <i>Trust.</i></span>
      </footer>
    </div>
  );
}

export default Register;
