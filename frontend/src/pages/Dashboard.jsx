import ChangePassword from "../components/ChangePassword";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Star, ShoppingBag, MapPin, ArrowRight,
  Sparkles, ShieldCheck, LogOut, Heart,
  SlidersHorizontal, TrendingUp, Store, Compass,
  X, ChevronDown, Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFavorites, setShowFavorites] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/stores");

      setStores(response.data.stores || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load stores."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const filteredStores = useMemo(() => {
    let result = stores.filter((store) =>
      `${store.name} ${store.address}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (showFavorites) {
      result = result.filter((store) =>
        favorites.includes(store.id)
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
      );
    } else if (sortBy === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [stores, search, sortBy, showFavorites, favorites]);

  const averageRating = stores.length
    ? (
        stores.reduce(
          (sum, store) =>
            sum + Number(store.averageRating || 0),
          0
        ) / stores.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="dashboard-page">

      <aside className={`dashboard-sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="dashboard-brand">
          <div className="brand-icon">
            <Star size={22} fill="currentColor" />
          </div>

          <span>
            Rate<span>Sphere</span>
          </span>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section">DISCOVER</div>

        <button
          className="sidebar-link active"
          onClick={() => {
            setShowFavorites(false);
            setMobileMenu(false);
          }}
        >
          <Compass size={19} />
          Discover Stores
        </button>

        <button
          className={`sidebar-link ${showFavorites ? "active" : ""}`}
          onClick={() => {
            setShowFavorites(true);
            setMobileMenu(false);
          }}
        >
          <Heart size={19} />
          My Favorites
          <span className="sidebar-count">{favorites.length}</span>
        </button>

        <button
          className="sidebar-link"
          onClick={() => navigate("/my-ratings")}
        >
          <Star size={19} />
          My Ratings
        </button>

        {/* CHANGE PASSWORD */}
        <button
          className={`sidebar-link ${showChangePassword ? "active" : ""}`}
          onClick={() => setShowChangePassword((prev) => !prev)}
        >
          <ShieldCheck size={19} />
          Change Password
        </button>

        {showChangePassword && (
          <div className="sidebar-password-panel">
            <button
              type="button"
              className="sidebar-password-close"
              onClick={() => setShowChangePassword(false)}
              aria-label="Close change password"
            >
              <X size={17} />
            </button>

            <ChangePassword />
          </div>
        )}

        <div className="sidebar-section sidebar-bottom-section">
          YOUR ACCOUNT
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-info">
              <strong>{user?.name || "User"}</strong>
              <span>RateSphere Member</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="dashboard-main">

        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={23} />
            </button>

            <div>
              <span className="dashboard-overline">
                YOUR DISCOVERY SPACE
              </span>

              <h2>
                Discover better. <span>Choose smarter.</span>
              </h2>
            </div>
          </div>

          <div className="header-profile">
            <div className="header-profile-text">
              <strong>{user?.name || "Welcome"}</strong>
              <span>Member</span>
            </div>

            <div className="profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <section className="welcome-banner">
          <div className="banner-content">
            <div className="banner-tag">
              <Sparkles size={14} />
              THE RATESPHERE EXPERIENCE
            </div>

            <h1>
              Find places
              <br />
              <span>worth trusting.</span>
            </h1>

            <p>
              Every great purchase starts with the right choice.
              Discover stores, explore genuine ratings, and
              shop with confidence.
            </p>

            <button
              className="banner-button"
              onClick={() =>
                document.getElementById("store-explorer")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Stores <ArrowRight size={17} />
            </button>

            <div className="banner-trust">
              <ShieldCheck size={17} />
              Discover. Rate. Trust.
            </div>
          </div>

          <div className="banner-art">
            <div className="art-circle circle-one" />
            <div className="art-circle circle-two" />

            <motion.div
              className="art-shopping"
              animate={{ y: [0, -14, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <ShoppingBag size={110} strokeWidth={1.1} />
            </motion.div>

            <motion.div
              className="art-rating"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Star fill="currentColor" size={18} />
              <strong>5.0</strong>
              <span>Trusted choices</span>
            </motion.div>
          </div>
        </section>

        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon"><Store size={21} /></div>
            <div>
              <span>Available Stores</span>
              <strong>{stores.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><Star size={21} /></div>
            <div>
              <span>Average Store Rating</span>
              <strong>{averageRating}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><Heart size={21} /></div>
            <div>
              <span>Your Favorites</span>
              <strong>{favorites.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={21} /></div>
            <div>
              <span>Shopping Community</span>
              <strong>Active</strong>
            </div>
          </div>
        </section>

        <section className="discovery-heading" id="store-explorer">
          <div>
            <span className="dashboard-overline">
              EXPLORE THE COLLECTION
            </span>

            <h2>
              {showFavorites ? "Your favorite stores" : "Discover stores"}
            </h2>

            <p>
              {showFavorites
                ? "Your personally saved shopping destinations."
                : "Explore destinations and find your next favourite store."}
            </p>
          </div>

          <div className="store-count">
            <ShoppingBag size={17} />
            {filteredStores.length} Stores
          </div>
        </section>

        <div className="store-toolbar">
          <div className="store-search">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search stores by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={17} />
              </button>
            )}
          </div>

          <div className="store-sort">
            <SlidersHorizontal size={17} />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A-Z</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        {loading && (
          <div className="dashboard-message">
            <Sparkles size={22} />
            Discovering amazing stores...
          </div>
        )}

        {error && (
          <div className="dashboard-error">{error}</div>
        )}

        {!loading && !error && filteredStores.length > 0 && (
          <div className="store-grid">
            {filteredStores.map((store, index) => (
              <motion.article
                className="store-card"
                key={store.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.07, 0.35) }}
                whileHover={{ y: -7 }}
              >
                {/* ACTUAL ADMIN-UPLOADED STORE IMAGE */}
                <div className="store-card-art">

                  {store.imageUrl ? (
                    <img
                      className="store-card-image"
                      src={store.imageUrl}
                      alt={store.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="store-art-icon">
                      <ShoppingBag size={42} />
                    </div>
                  )}

                  <span className="store-featured">
                    <Sparkles size={12} /> DISCOVER
                  </span>

                  <button
                    className={`store-heart ${
                      favorites.includes(store.id) ? "is-favorite" : ""
                    }`}
                    aria-label="Toggle favorite"
                    onClick={() => toggleFavorite(store.id)}
                  >
                    <Heart
                      size={18}
                      fill={
                        favorites.includes(store.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>

                <div className="store-card-content">
                  <h3>{store.name}</h3>

                  <div className="store-location">
                    <MapPin size={14} />
                    {store.address}
                  </div>

                  <div className="store-rating">
                    <div>
                      <Star size={17} fill="currentColor" />
                      <strong>
                        {Number(store.averageRating || 0).toFixed(1)}
                      </strong>
                    </div>

                    <span>
                      {store.totalRatings || 0} ratings
                    </span>
                  </div>

                  <button
                    className="store-view-button"
                    onClick={() => navigate(`/stores/${store.id}`)}
                  >
                    Explore Store <ArrowRight size={17} />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {!loading && !error && filteredStores.length === 0 && (
          <div className="empty-stores">
            <ShoppingBag size={38} />

            <h3>
              {showFavorites ? "No favorite stores yet" : "No stores found"}
            </h3>

            <p>
              {showFavorites
                ? "Save stores using the heart icon to find them here."
                : "Try another search or check back later."}
            </p>

            {showFavorites && (
              <button
                className="banner-button"
                onClick={() => setShowFavorites(false)}
              >
                Discover Stores <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        <footer className="dashboard-footer">
          <span>© 2026 RateSphere</span>
          <span>DISCOVER • RATE • TRUST</span>
          <span>Made for better choices.</span>
        </footer>
      </main>
    </div>
  );
}