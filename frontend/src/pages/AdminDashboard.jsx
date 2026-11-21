
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, Star, LogOut,
  Search, Bell, TrendingUp, ShieldCheck, Menu,
  RefreshCw, ArrowUpRight, Activity
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./admin-dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardRes, usersRes, storesRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users?page=1&limit=5&sortBy=createdAt&order=desc"),
        api.get("/admin/stores?page=1&limit=5")
      ]);

      setStats(dashboardRes.data.stats || {});
      setUsers(usersRes.data.users || []);
      setStores(storesRes.data.stores || []);
    } catch (err) {
      console.error("Admin dashboard error:", err.response?.data || err);
      setError(err.response?.data?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "SYSTEM_ADMIN") {
      navigate("/dashboard", { replace: true });
      return;
    }
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "purple",
      description: "Registered accounts"
    },
    {
      title: "Total Stores",
      value: stats.totalStores,
      icon: Store,
      color: "aqua",
      description: "Available businesses"
    },
    {
      title: "Total Ratings",
      value: stats.totalRatings,
      icon: Star,
      color: "gold",
      description: "Customer feedback"
    }
  ];

  return (
    <div className="admin-layout">

      {mobileMenu && (
        <div
          className="admin-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`admin-sidebar ${mobileMenu ? "admin-sidebar-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <Star size={22} fill="currentColor" />
          </div>
          <span>Rate<span>Sphere</span></span>
        </div>

        <div className="admin-role-label">
          <ShieldCheck size={15} /> ADMIN CONTROL
        </div>

        <div className="admin-nav-label">WORKSPACE</div>

        <button className="admin-nav-item active">
          <LayoutDashboard size={19} />
          Overview
        </button>

        <button
          className="admin-nav-item"
          onClick={() => navigate("/admin/users")}
        >
          <Users size={19} />
          User Management
        </button>

        <button
          className="admin-nav-item"
          onClick={() => navigate("/admin/stores")}
        >
          <Store size={19} />
          Store Management
        </button>

        <div className="admin-sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-avatar">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <strong>{user?.name || "Administrator"}</strong>
              <span>System Administrator</span>
            </div>
          </div>

          <button className="admin-logout" onClick={handleLogout}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">

        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-mobile-menu"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={23} />
            </button>

            <div>
              <span className="admin-overline">ADMINISTRATION</span>
              <h1>Dashboard Overview</h1>
            </div>
          </div>

          <div className="admin-header-right">
            <button
              className="admin-refresh"
              onClick={fetchDashboard}
              disabled={loading}
              title="Refresh dashboard"
            >
              <RefreshCw size={17} />
            </button>

            <div className="admin-header-user">
              <span>Welcome back</span>
              <strong>{user?.name || "Admin"}</strong>
            </div>

            <div className="admin-avatar">
              {user?.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        <section className="admin-welcome">
          <div>
            <div className="admin-welcome-tag">
              <Activity size={14} /> SYSTEM CONTROL CENTER
            </div>
            <h2>
              Manage your platform.
              <br />
              <span>Monitor everything.</span>
            </h2>
            <p>
              Monitor users, manage stores, and track customer
              engagement across the RateSphere ecosystem.
            </p>
          </div>

          <div className="admin-welcome-art">
            <div className="admin-art-circle" />
            <ShieldCheck size={100} strokeWidth={1.2} />
            <div className="admin-art-label">
              <span>PLATFORM STATUS</span>
              <strong><i /> Operational</strong>
            </div>
          </div>
        </section>

        {error && (
          <div className="admin-error">
            {error}
            <button onClick={fetchDashboard}>Try again</button>
          </div>
        )}

        <section className="admin-section-heading">
          <div>
            <span>PLATFORM ANALYTICS</span>
            <h2>Platform Statistics</h2>
          </div>
          <span className="admin-live-status">
            <i /> LIVE DATA
          </span>
        </section>

        <section className="admin-stat-grid">
          {statCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                className={`admin-stat-card ${card.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="admin-stat-top">
                  <div className="admin-stat-icon">
                    <Icon size={22} />
                  </div>
                  <ArrowUpRight size={18} />
                </div>

                <span>{card.title}</span>

                <strong>
                  {loading ? "—" : Number(card.value || 0).toLocaleString("en-IN")}
                </strong>

                <p>{card.description}</p>
              </motion.div>
            );
          })}
        </section>

        <section className="admin-data-grid">

          <div className="admin-data-card">
            <div className="admin-data-heading">
              <div>
                <span>COMMUNITY</span>
                <h3>Recent Users</h3>
              </div>
              <button onClick={() => navigate("/admin/users")}>
                View all <ArrowUpRight size={16} />
              </button>
            </div>

            {loading ? (
              <p className="admin-loading">Loading users...</p>
            ) : users.length ? (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="admin-table-user">
                            <div className="admin-small-avatar">
                              {item.name?.charAt(0) || "U"}
                            </div>
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>{item.email}</td>
                        <td>
                          <span className={`role-badge ${item.role === "SYSTEM_ADMIN" ? "role-admin" : item.role === "STORE_OWNER" ? "role-owner" : "role-user"}`}>
                            {item.role?.replaceAll("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-loading">No users found.</p>
            )}
          </div>

          <div className="admin-data-card">
            <div className="admin-data-heading">
              <div>
                <span>BUSINESS NETWORK</span>
                <h3>Recent Stores</h3>
              </div>
              <button onClick={() => navigate("/admin/stores")}>
                View all <ArrowUpRight size={16} />
              </button>
            </div>

            {loading ? (
              <p className="admin-loading">Loading stores...</p>
            ) : stores.length ? (
              <div className="admin-store-list">
                {stores.map((store) => (
                  <div className="admin-store-item" key={store.id}>
                    <div className="admin-store-icon">
                      <Store size={20} />
                    </div>
                    <div className="admin-store-info">
                      <strong>{store.name}</strong>
                      <span>{store.email}</span>
                      <small>{store.address}</small>
                    </div>
                    <ArrowUpRight size={17} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-loading">No stores found.</p>
            )}
          </div>

        </section>

        <footer className="admin-footer">
          <span>© 2026 RateSphere</span>
          <span>DISCOVER · RATE · TRUST</span>
          <span>Administration Portal</span>
        </footer>
      </main>
    </div>
  );
}
