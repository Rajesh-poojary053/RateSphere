import ChangePassword from "../components/ChangePassword";
import "./owner-dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, Star, TrendingUp, LogOut, RefreshCw,
  Pencil, X, Save, MapPin, Mail, Users,
  LayoutDashboard, ShieldCheck, Upload, ImagePlus
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialStats = {
  totalStores: 0,
  totalRatings: 0,
  averageRating: 0
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(initialStats);
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [imageError, setImageError] = useState("");

  const [showChangePassword, setShowChangePassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    imageUrl: "",
    imagePublicId: ""
  });

  // ============================================
  // FETCH OWNER DASHBOARD
  // ============================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/owner/dashboard");

      setStats(response.data.stats || initialStats);
      setStores(response.data.stores || []);
      setRatings(response.data.recentRatings || []);

    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load owner dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "STORE_OWNER") {
      navigate("/", { replace: true });
      return;
    }

    fetchDashboard();
  }, [user]);

  // ============================================
  // OPEN EDIT STORE
  // ============================================

  const openEdit = (store) => {
    setEditing(store.id);

    setForm({
      name: store.name || "",
      email: store.email || "",
      address: store.address || "",
      imageUrl: store.imageUrl || "",
      imagePublicId: store.imagePublicId || ""
    });

    setSelectedImage(null);
    setPreviewImage(store.imageUrl || "");
    setImageError("");
  };

  // ============================================
  // HANDLE IMAGE SELECTION
  // ============================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      setImageError(
        "Only JPG, PNG and WEBP images are allowed."
      );
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError(
        "Image size must be less than 5 MB."
      );
      e.target.value = "";
      return;
    }

    if (previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    const preview = URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewImage(preview);
  };

  // ============================================
  // SAVE STORE AND UPLOAD IMAGE
  // ============================================

  const saveStore = async (e) => {
    e.preventDefault();

    if (!editing || saving) return;

    try {
      setSaving(true);
      setImageError("");

      let updatedImageUrl = form.imageUrl;
      let updatedPublicId = form.imagePublicId;

      // STEP 1: Upload new image to Cloudinary
      if (selectedImage) {
        setUploading(true);

        const imageData = new FormData();

        // IMPORTANT: Must match upload.single("image")
        imageData.append("image", selectedImage);

        const uploadResponse = await api.post(
          "/uploads/store-image",
          imageData
        );

        console.log(
          "Image upload response:",
          uploadResponse.data
        );

        if (!uploadResponse.data.success) {
          throw new Error(
            uploadResponse.data.message ||
            "Image upload failed."
          );
        }

        updatedImageUrl =
          uploadResponse.data.imageUrl ||
          uploadResponse.data.url;

        updatedPublicId =
          uploadResponse.data.publicId ||
          uploadResponse.data.imagePublicId;

        if (!updatedImageUrl) {
          throw new Error(
            "Image upload failed. No image URL returned."
          );
        }
      }

      // STEP 2: Update store details in PostgreSQL
      setUploading(false);

      const updateResponse = await api.put(
        `/owner/stores/${editing}`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          imageUrl: updatedImageUrl,
          imagePublicId: updatedPublicId
        }
      );

      if (!updateResponse.data.success) {
        throw new Error(
          updateResponse.data.message ||
          "Unable to update store."
        );
      }

      // STEP 3: Cleanup
      if (previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }

      setEditing(null);
      setSelectedImage(null);
      setPreviewImage("");
      setImageError("");

      // STEP 4: Refresh dashboard
      await fetchDashboard();

      alert("Store updated successfully!");

    } catch (err) {
      console.error("Store update error:", err);

      console.error(
        "Server response:",
        err.response?.data
      );

      setImageError(
        err.response?.data?.message ||
        err.message ||
        "Unable to update store."
      );

    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // ============================================
  // CLOSE EDIT MODAL
  // ============================================

  const closeEdit = () => {
    if (previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setEditing(null);
    setSelectedImage(null);
    setPreviewImage("");
    setImageError("");
  };

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // ============================================
  // STATISTICS
  // ============================================

  const statCards = [
    {
      title: "My Stores",
      value: stats.totalStores,
      icon: Store,
      color: "#a78bfa",
      description: "Registered businesses"
    },
    {
      title: "Total Ratings",
      value: stats.totalRatings,
      icon: Users,
      color: "#5eead4",
      description: "Customer feedback"
    },
    {
      title: "Average Rating",
      value: Number(stats.averageRating || 0).toFixed(1),
      icon: Star,
      color: "#fbbf24",
      description: "Customer satisfaction"
    }
  ];

  // ============================================
  // DASHBOARD UI
  // ============================================

  return (
    <div className="owner-layout">

      <aside className="owner-sidebar">

        <div className="owner-brand">
          <Star size={25} fill="currentColor" />
          <span>Rate<span>Sphere</span></span>
        </div>

        <div className="owner-badge">
          <ShieldCheck size={16} />
          STORE OWNER
        </div>

        <div className="owner-nav-title">
          WORKSPACE
        </div>

        <button
          className="owner-nav active"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth"
            })
          }
        >
          <LayoutDashboard size={19} />
          Overview
        </button>

        <button
          className="owner-nav"
          onClick={() =>
            document.getElementById("owner-stores")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Store size={19} />
          My Stores
        </button>

        <button
          className="owner-nav"
          onClick={() =>
            document.getElementById("owner-ratings")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Star size={19} />
          Customer Ratings
        </button>

        {/* CHANGE PASSWORD */}
        <button
          className={`owner-nav ${showChangePassword ? "active" : ""}`}
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

        <div className="owner-sidebar-bottom">

          <div className="owner-profile">

            <div className="owner-avatar">
              {user?.name?.charAt(0) || "O"}
            </div>

            <div>
              <strong>
                {user?.name || "Store Owner"}
              </strong>
              <span>Store Owner</span>
            </div>

          </div>

          <button
            className="owner-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sign Out
          </button>

        </div>

      </aside>

      <main className="owner-main">

        <header className="owner-header">

          <div>
            <span className="owner-overline">
              OWNER PORTAL
            </span>
            <h1>Business Dashboard</h1>
          </div>

          <div className="owner-header-right">

            <button
              className="owner-refresh"
              onClick={fetchDashboard}
              disabled={loading}
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            <div className="owner-header-user">
              <span>Welcome back</span>
              <strong>{user?.name || "Owner"}</strong>
            </div>

          </div>

        </header>

        <section className="owner-welcome">

          <div>

            <span className="owner-welcome-label">
              <TrendingUp size={15} />
              BUSINESS MANAGEMENT
            </span>

            <h2>
              Grow your business.
              <br />
              <span>Build customer trust.</span>
            </h2>

            <p>
              Monitor your store performance, understand customer
              feedback and manage your business information.
            </p>

          </div>

          <div className="owner-welcome-icon">
            <Store size={95} strokeWidth={1.2} />
          </div>

        </section>

        {error && (
          <div className="owner-error">
            {error}
            <button onClick={fetchDashboard}>
              Retry
            </button>
          </div>
        )}

        <section className="owner-section-heading">

          <div>
            <span>BUSINESS ANALYTICS</span>
            <h2>Performance Overview</h2>
          </div>

          <span className="owner-live">
            <i /> LIVE DATA
          </span>

        </section>

        <section className="owner-stat-grid">

          {statCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                className="owner-stat-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >

                <div
                  className="owner-stat-icon"
                  style={{ color: card.color }}
                >
                  <Icon size={23} />
                </div>

                <span>{card.title}</span>

                <strong>
                  {loading
                    ? "—"
                    : Number(card.value).toLocaleString("en-IN")}
                </strong>

                <p>{card.description}</p>

              </motion.div>
            );
          })}

        </section>

        {/* MY STORES */}

        <section
          id="owner-stores"
          className="owner-panel"
        >

          <div className="owner-panel-heading">
            <div>
              <span>YOUR BUSINESS NETWORK</span>
              <h2>My Stores</h2>
            </div>
          </div>

          {loading ? (
            <p className="owner-empty">
              Loading stores...
            </p>
          ) : stores.length ? (

            <div className="owner-store-grid">

              {stores.map((store) => (

                <div
                  className="owner-store-card"
                  key={store.id}
                >

                  <div className="owner-store-photo">

                    {store.imageUrl ? (
                      <img
                        src={store.imageUrl}
                        alt={`${store.name} store`}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="owner-no-photo">
                        <ImagePlus size={35} />
                        <span>No store photo available</span>
                      </div>
                    )}

                  </div>

                  <div className="owner-store-top">

                    <div className="owner-store-icon">
                      <Store size={24} />
                    </div>

                    <button
                      className="owner-edit"
                      onClick={() => openEdit(store)}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                  </div>

                  <h3>{store.name}</h3>

                  <p>
                    <Mail size={15} />
                    {store.email}
                  </p>

                  <p>
                    <MapPin size={15} />
                    {store.address}
                  </p>

                  <div className="owner-store-footer">

                    <span>
                      <Star
                        size={16}
                        fill="#fbbf24"
                        color="#fbbf24"
                      />
                      {Number(store.averageRating || 0).toFixed(1)} / 5
                    </span>

                    <span>
                      {store.totalRatings || 0} ratings
                    </span>

                  </div>

                </div>

              ))}

            </div>

          ) : (
            <p className="owner-empty">
              No stores have been assigned to your account.
              Contact the system administrator.
            </p>
          )}

        </section>

        {/* CUSTOMER RATINGS */}

        <section
          id="owner-ratings"
          className="owner-panel"
        >

          <div className="owner-panel-heading">
            <div>
              <span>CUSTOMER EXPERIENCE</span>
              <h2>Recent Customer Ratings</h2>
            </div>
          </div>

          {loading ? (
            <p className="owner-empty">
              Loading ratings...
            </p>
          ) : ratings.length ? (

            <div className="owner-rating-list">

              {ratings.map((rating) => (

                <div
                  className="owner-rating-item"
                  key={rating.id}
                >

                  <div className="owner-rating-avatar">
                    {rating.user?.name?.charAt(0) || "U"}
                  </div>

                  <div className="owner-rating-details">

                    <strong>
                      {rating.user?.name || "Customer"}
                    </strong>

                    <span>
                      {rating.store?.name}
                    </span>

                    <small>
                      {new Date(rating.createdAt)
                        .toLocaleDateString("en-IN")}
                    </small>

                  </div>

                  <div className="owner-rating-value">
                    <Star
                      size={17}
                      fill="#fbbf24"
                      color="#fbbf24"
                    />
                    <strong>{rating.value}/5</strong>
                  </div>

                </div>

              ))}

            </div>

          ) : (
            <p className="owner-empty">
              No customer ratings received yet.
            </p>
          )}

        </section>

        <footer className="owner-footer">
          <span>© 2026 RateSphere</span>
          <span>DISCOVER · RATE · TRUST</span>
          <span>Store Owner Portal</span>
        </footer>

      </main>

      {/* EDIT STORE MODAL */}

      {editing && (

        <div className="owner-modal-overlay">

          <form
            className="owner-modal"
            onSubmit={saveStore}
          >

            <div className="owner-modal-heading">

              <h2>Edit Store Details</h2>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
              >
                <X size={21} />
              </button>

            </div>

            <label>Store Name</label>

            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />

            <label>Store Email</label>

            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
            />

            <label>Store Address</label>

            <textarea
              required
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value
                })
              }
            />

            <label className="owner-upload-label">
              <ImagePlus size={17} />
              Store Photo
            </label>

            <div className="owner-image-preview">

              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Store preview"
                  onError={() =>
                    setImageError(
                      "Unable to load image preview."
                    )
                  }
                />
              ) : (
                <div className="owner-no-photo">
                  <ImagePlus size={35} />
                  <span>No photo selected</span>
                </div>
              )}

            </div>

            <label className="owner-file-button">

              <Upload size={17} />
              Choose New Photo

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                disabled={saving}
              />

            </label>

            <small className="owner-file-hint">
              JPG, PNG or WEBP. Maximum 5 MB.
            </small>

            {selectedImage && (
              <small>
                Selected: {selectedImage.name}
              </small>
            )}

            {imageError && (
              <div className="owner-image-error">
                {imageError}
              </div>
            )}

            <div className="owner-modal-actions">

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || uploading}
              >
                <Save size={17} />

                {uploading
                  ? "Uploading Photo..."
                  : saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      )}

    </div>
  );
}