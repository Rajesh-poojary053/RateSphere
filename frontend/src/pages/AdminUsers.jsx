
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Pencil, Trash2, RefreshCw } from "lucide-react";
import api from "../services/api";

const emptyForm = {
  name: "", email: "", address: "", password: "", role: "NORMAL_USER"
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/users", {
        params: { search, role, page, limit: 10 }
      });
      setUsers(res.data.users || []);
      setPages(res.data.pagination?.pages || 1);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search, role, page]);

  const openCreate = () => {
    setEditing("new");
    setForm(emptyForm);
  };

  const openEdit = (u) => {
    setEditing(u.id);
    setForm({
      name: u.name,
      email: u.email,
      address: u.address,
      password: "",
      role: u.role
    });
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      if (editing === "new") {
        await api.post("/admin/users", form);
        alert("User created successfully");
      } else {
        const data = { ...form };
        if (!data.password) delete data.password;
        await api.put(`/admin/users/${editing}`, data);
        alert("User updated successfully");
      }

      setEditing(null);
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Operation failed");
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete user ${u.name}? This cannot be undone.`)) return;

    try {
      await api.delete(`/admin/users/${u.id}`);
      alert("User deleted successfully");
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Unable to delete user");
    }
  };

  const field = (name, placeholder, type = "text", required = true) => (
    <input
      style={styles.input}
      type={type}
      placeholder={placeholder}
      value={form[name]}
      required={required}
      onChange={e => setForm({ ...form, [name]: e.target.value })}
    />
  );

  return (
    <main style={styles.page}>
      <button style={styles.back} onClick={() => navigate("/admin/dashboard")}>
        <ArrowLeft size={17}/> Dashboard
      </button>

      <header style={styles.header}>
        <div>
          <span style={styles.label}>ADMINISTRATION</span>
          <h1>User Management</h1>
          <p>Manage all registered RateSphere accounts.</p>
        </div>
        <button style={styles.primary} onClick={openCreate}>
          <Plus size={18}/> Add User
        </button>
      </header>

      <section style={styles.card}>
        <div style={styles.toolbar}>
          <div style={styles.search}>
            <Search size={18}/>
            <input
              placeholder="Search name, email or address..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select style={styles.input} value={role}
            onChange={e => { setRole(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="NORMAL_USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
          </select>
          <button style={styles.secondary} onClick={load}>
            <RefreshCw size={16}/> Refresh
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {loading ? <p>Loading users...</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead><tr>
                <th>Name</th><th>Email</th><th>Address</th>
                <th>Role</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.address}</td>
                    <td><span style={styles.badge}>{u.role}</span></td>
                    <td>
                      <button style={styles.iconButton} title="Edit"
                        onClick={() => openEdit(u)}><Pencil size={17}/></button>
                      <button style={styles.deleteButton} title="Delete"
                        disabled={u.role === "SYSTEM_ADMIN"}
                        onClick={() => remove(u)}><Trash2 size={17}/></button>
                    </td>
                  </tr>
                ))}
                {!users.length && <tr><td colSpan="5">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        <div style={styles.pagination}>
          <button style={styles.secondary} disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button style={styles.secondary} disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </section>

      {editing !== null && (
        <div style={styles.overlay}>
          <form style={styles.modal} onSubmit={save}>
            <h2>{editing === "new" ? "Create User" : "Edit User"}</h2>
            {field("name", "Full name")}
            {field("email", "Email address", "email")}
            {field("address", "Full address")}
            {field("password", editing === "new" ? "Password (minimum 8 characters)" : "New password (leave blank to keep current)", "password", editing === "new")}
            <select style={styles.input} value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
            </select>
            <div style={styles.actions}>
              <button type="button" style={styles.secondary}
                onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" style={styles.primary}>Save User</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

const styles = {
  page: { minHeight:"100vh", background:"#090914", color:"#f5f3ff", padding:35, fontFamily:"Arial,sans-serif" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:15, margin:"30px 0" },
  label: { color:"#a78bfa", fontSize:11, letterSpacing:2 },
  card: { background:"#151524", border:"1px solid #302d45", borderRadius:14, padding:24 },
  back: { display:"flex", gap:8, padding:12, color:"#c4b5fd", background:"#201b35", border:"1px solid #393052", borderRadius:8, cursor:"pointer" },
  primary: { display:"flex", alignItems:"center", gap:8, padding:"12px 18px", color:"white", background:"#8055dc", border:0, borderRadius:8, cursor:"pointer" },
  secondary: { display:"flex", alignItems:"center", gap:8, padding:11, color:"#ddd6fe", background:"#242238", border:"1px solid #393052", borderRadius:8, cursor:"pointer" },
  toolbar: { display:"flex", gap:12, flexWrap:"wrap", marginBottom:20 },
  search: { flex:1, minWidth:200, display:"flex", gap:10, alignItems:"center", padding:"0 12px", background:"#090914", border:"1px solid #393052", borderRadius:8 },
  input: { width:"100%", minWidth:150, padding:12, color:"#f5f3ff", background:"#090914", border:"1px solid #393052", borderRadius:8, boxSizing:"border-box" },
  table: { width:"100%", minWidth:750, borderCollapse:"collapse", textAlign:"left" },
  badge: { padding:6, background:"#29213f", color:"#c4b5fd", borderRadius:5, fontSize:11 },
  iconButton: { padding:8, background:"#29213f", color:"#c4b5fd", border:0, borderRadius:6, cursor:"pointer", marginRight:7 },
  deleteButton: { padding:8, background:"#3b1925", color:"#fb7185", border:0, borderRadius:6, cursor:"pointer" },
  pagination: { display:"flex", alignItems:"center", justifyContent:"center", gap:20, marginTop:25 },
  overlay: { position:"fixed", inset:0, zIndex:200, background:"#000b", display:"grid", placeItems:"center", padding:15 },
  modal: { width:"min(450px,100%)", display:"grid", gap:13, padding:25, background:"#171627", border:"1px solid #494064", borderRadius:15, boxSizing:"border-box" },
  actions: { display:"flex", justifyContent:"flex-end", gap:10, marginTop:10 },
  error: { color:"#fb7185" }
};
