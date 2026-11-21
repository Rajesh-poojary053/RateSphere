
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Search, Pencil, Trash2,
  RefreshCw, Upload, Image as ImageIcon, X
} from "lucide-react";
import api from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  address: "",
  ownerId: "",
  imageUrl: "",
  imagePublicId: ""
};

export default function AdminStores() {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [storeRes, userRes, adminRes] = await Promise.all([
        api.get("/admin/stores", {
          params: { search, page, limit: 10 }
        }),
        api.get("/admin/users", {
          params: { role: "STORE_OWNER", limit: 100 }
        }),
        api.get("/admin/users", {
          params: { role: "SYSTEM_ADMIN", limit: 100 }
        })
      ]);

      setStores(storeRes.data.stores || []);
      setPages(storeRes.data.pagination?.pages || 1);

      setOwners([
        ...(userRes.data.users || []),
        ...(adminRes.data.users || [])
      ]);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const openCreate = () => {
    setEditing("new");
    setForm(emptyForm);
    setImageFile(null);
    setPreview("");
  };

  const openEdit = (store) => {
    setEditing(store.id);
    setForm({
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId,
      imageUrl: store.imageUrl || "",
      imagePublicId: store.imagePublicId || ""
    });
    setImageFile(null);
    setPreview(store.imageUrl || "");
  };

  const closeModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setPreview("");
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      alert("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be below 5 MB.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      let imageData = {
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId
      };

      // Upload image first
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await api.post(
          "/uploads/store-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );

        imageData = {
          imageUrl: uploadRes.data.imageUrl,
          imagePublicId: uploadRes.data.publicId
        };
      }

      const payload = {
        ...form,
        ...imageData
      };

      if (editing === "new") {
        await api.post("/admin/stores", payload);
        alert("Store created successfully!");
      } else {
        await api.put(`/admin/stores/${editing}`, payload);
        alert("Store updated successfully!");
      }

      closeModal();
      load();

    } catch (e) {
      alert(e.response?.data?.message || "Store operation failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (store) => {
    if (!window.confirm(`Delete ${store.name}?`)) return;

    try {
      await api.delete(`/admin/stores/${store.id}`);
      alert("Store deleted successfully!");
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Unable to delete store");
    }
  };

  const field = (name, placeholder, type = "text") => (
    <input
      style={styles.input}
      type={type}
      placeholder={placeholder}
      required
      value={form[name]}
      onChange={(e) =>
        setForm({ ...form, [name]: e.target.value })
      }
    />
  );

  return (
    <main style={styles.page}>
      <button
        style={styles.back}
        onClick={() => navigate("/admin/dashboard")}
      >
        <ArrowLeft size={17} /> Dashboard
      </button>

      <header style={styles.header}>
        <div>
          <span style={styles.label}>ADMINISTRATION</span>
          <h1>Store Management</h1>
          <p>Manage registered businesses on RateSphere.</p>
        </div>

        <button style={styles.primary} onClick={openCreate}>
          <Plus size={18} /> Add Store
        </button>
      </header>

      <section style={styles.card}>
        <div style={styles.toolbar}>
          <div style={styles.search}>
            <Search size={18} />
            <input
              placeholder="Search store name, email or address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <button style={styles.secondary} onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {loading ? (
          <p>Loading stores...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Store</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Owner</th>
                  <th>Ratings</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.imageUrl ? (
                        <img
                          src={s.imageUrl}
                          alt={s.name}
                          style={styles.thumbnail}
                        />
                      ) : (
                        <ImageIcon size={25} />
                      )}
                    </td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.address}</td>
                    <td>{s.owner?.name || "—"}</td>
                    <td>{s._count?.ratings ?? 0}</td>
                    <td>
                      <button
                        style={styles.iconButton}
                        onClick={() => openEdit(s)}
                        title="Edit"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        style={styles.deleteButton}
                        onClick={() => remove(s)}
                        title="Delete"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}

                {!stores.length && (
                  <tr>
                    <td colSpan="7">No stores found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={styles.pagination}>
          <button
            style={styles.secondary}
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>

          <span>Page {page} of {pages}</span>

          <button
            style={styles.secondary}
            disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </section>

      {editing !== null && (
        <div style={styles.overlay}>
          <form style={styles.modal} onSubmit={save}>
            <h2>{editing === "new" ? "Create Store" : "Edit Store"}</h2>

            {field("name", "Store name")}
            {field("email", "Store email", "email")}
            {field("address", "Complete store address")}

            <select
              style={styles.input}
              required
              value={form.ownerId}
              onChange={(e) =>
                setForm({ ...form, ownerId: e.target.value })
              }
            >
              <option value="">Select store owner</option>

              {owners.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>

            <label style={styles.uploadLabel}>
              <Upload size={18} />
              {imageFile ? imageFile.name : "Choose Store Image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImage}
                style={{ display: "none" }}
              />
            </label>

            {preview && (
              <div style={styles.previewContainer}>
                <img
                  src={preview}
                  alt="Store preview"
                  style={styles.preview}
                />
                <button
                  type="button"
                  style={styles.removePreview}
                  onClick={() => {
                    setImageFile(null);
                    setPreview("");
                    setForm({
                      ...form,
                      imageUrl: "",
                      imagePublicId: ""
                    });
                  }}
                >
                  <X size={16} /> Remove Image
                </button>
              </div>
            )}

            <div style={styles.actions}>
              <button
                type="button"
                style={styles.secondary}
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.primary}
                disabled={saving || !owners.length}
              >
                {saving ? "Saving..." : "Save Store"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#090914",
    color: "#f5f3ff",
    padding: 35,
    fontFamily: "Arial,sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 15,
    margin: "30px 0"
  },
  label: { color: "#a78bfa", fontSize: 11, letterSpacing: 2 },
  card: {
    background: "#151524",
    border: "1px solid #302d45",
    borderRadius: 14,
    padding: 24
  },
  back: {
    display: "flex",
    gap: 8,
    padding: 12,
    color: "#c4b5fd",
    background: "#201b35",
    border: "1px solid #393052",
    borderRadius: 8,
    cursor: "pointer"
  },
  primary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 18px",
    color: "white",
    background: "#8055dc",
    border: 0,
    borderRadius: 8,
    cursor: "pointer"
  },
  secondary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 11,
    color: "#ddd6fe",
    background: "#242238",
    border: "1px solid #393052",
    borderRadius: 8,
    cursor: "pointer"
  },
  toolbar: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap"
  },
  search: {
    flex: 1,
    minWidth: 200,
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "0 12px",
    background: "#090914",
    border: "1px solid #393052",
    borderRadius: 8
  },
  input: {
    width: "100%",
    padding: 12,
    color: "#f5f3ff",
    background: "#090914",
    border: "1px solid #393052",
    borderRadius: 8,
    boxSizing: "border-box"
  },
  table: {
    width: "100%",
    minWidth: 950,
    borderCollapse: "collapse",
    textAlign: "left"
  },
  thumbnail: {
    width: 55,
    height: 45,
    objectFit: "cover",
    borderRadius: 7
  },
  iconButton: {
    padding: 8,
    background: "#29213f",
    color: "#c4b5fd",
    border: 0,
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 7
  },
  deleteButton: {
    padding: 8,
    background: "#3b1925",
    color: "#fb7185",
    border: 0,
    borderRadius: 6,
    cursor: "pointer"
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 25
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background: "#000b",
    display: "grid",
    placeItems: "center",
    padding: 15,
    overflowY: "auto"
  },
  modal: {
    width: "min(450px,100%)",
    display: "grid",
    gap: 13,
    padding: 25,
    background: "#171627",
    border: "1px solid #494064",
    borderRadius: 15,
    boxSizing: "border-box",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  uploadLabel: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    border: "1px dashed #8055dc",
    borderRadius: 8,
    color: "#c4b5fd",
    cursor: "pointer"
  },
  previewContainer: {
    display: "grid",
    gap: 10
  },
  preview: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 9
  },
  removePreview: {
    display: "flex",
    gap: 7,
    justifyContent: "center",
    alignItems: "center",
    background: "#3b1925",
    color: "#fb7185",
    border: 0,
    padding: 9,
    borderRadius: 7,
    cursor: "pointer"
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10
  },
  error: { color: "#fb7185" }
};
