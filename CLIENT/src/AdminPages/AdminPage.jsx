import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import "./AdminPage.css";

export default function AdminPage() {
  useAuthGuard();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = await apiFetch("/api/users/me");
        if (user?.szerepkor !== "admin") {
          navigate("/mainpage");
        }
      } catch {
        navigate("/login");
      }
    };
    checkRole();
  }, [navigate]);

  const load = async () => {
    try {
      const data = await apiFetch("/api/admin/users");
      setUsers(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (u) => {
    setEditing(u);
    setEmail(u.email || "");
    setPassword("");
    setRole(u.szerepkor || "user");
  };

  const openCreate = () => {
    setCreating(true);
    setEmail("");
    setPassword("");
    setRole("user");
    setFirstName("");
    setLastName("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await apiFetch(`/api/admin/users/${editing.azonosito}`, {
        method: "PUT",
        body: JSON.stringify({
          email,
          jelszo: password || undefined
        })
      });
      if (role && role !== editing.szerepkor) {
        await apiFetch(`/api/admin/users/${editing.azonosito}/role`, {
          method: "PUT",
          body: JSON.stringify({ szerepkor: role })
        });
      }
      setEditing(null);
      await load();
    } catch (err) {
      console.error(err.message);
      alert("Nem sikerult menteni");
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm("Biztosan torlod ezt a felhasznalot?")) return;
    try {
      await apiFetch(`/api/admin/users/${u.azonosito}`, { method: "DELETE" });
      await load();
    } catch (err) {
      console.error(err.message);
      alert("Nem sikerult torolni");
    }
  };

  const filtered = users.filter((u) =>
    (u.nev || "").toLowerCase().includes(query.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(query.toLowerCase())
  );

  const saveCreate = async () => {
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      alert("Minden mezo kotelezo");
      return;
    }
    try {
      await apiFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          jelszo: password,
          szerepkor: role,
          aktiv: true,
          keresztnev: firstName,
          vezeteknev: lastName
        })
      });
      setCreating(false);
      await load();
    } catch (err) {
      console.error(err.message);
      alert("Nem sikerult letrehozni");
    }
  };

  return (
    <div className="admin-page">
      <TopNav adminOnly />
      <div className="admin-container">
        <aside className="admin-side">
          <div className="admin-title">Admin Kezelopult</div>
          <div className="admin-menu">
            <div className="admin-menu-item active">Felhasznalok</div>
            <div className="admin-menu-item" onClick={() => navigate("/admin/reports")}>Jelentesek</div>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-header">
            <div className="admin-header-title">Felhasznalokezeles</div>
            <button className="admin-add" onClick={openCreate}>+ Uj felhasznalo hozzaadasa</button>
          </div>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Felhasznalok keresese..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="admin-table">
            <div className="admin-row admin-head">
              <div>Nev</div>
              <div>Email</div>
              <div>Muveletek</div>
            </div>
            {filtered.map((u) => (
              <div className="admin-row" key={u.azonosito}>
                <div>{u.nev}</div>
                <div>{u.email}</div>
                <div className="admin-actions">
                  <button className="admin-edit" onClick={() => openEdit(u)}>Szerkesztes</button>
                  <button className="admin-delete" onClick={() => removeUser(u)}>Torles</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {editing ? (
        <div className="admin-modal-backdrop" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-title">Felhasznalo szerkesztese</div>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Jelszo
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label>
              Szerepkor
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user" disabled={editing?.szerepkor === "admin"}>user</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <div className="admin-modal-actions">
              <button className="admin-cancel" onClick={() => setEditing(null)}>Megse</button>
              <button className="admin-save" onClick={saveEdit}>Mentes</button>
            </div>
          </div>
        </div>
      ) : null}

      {creating ? (
        <div className="admin-modal-backdrop" onClick={() => setCreating(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-title">Uj felhasznalo</div>
            <label>
              Vezeteknev
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label>
              Keresztnev
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Jelszo
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label>
              Szerepkor
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <div className="admin-modal-actions">
              <button className="admin-cancel" onClick={() => setCreating(false)}>Megse</button>
              <button className="admin-save" onClick={saveCreate}>Letrehozas</button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
