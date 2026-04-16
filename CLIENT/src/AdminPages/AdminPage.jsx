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
  const [gender, setGender] = useState("unknown");

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
    setGender("unknown");
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (editing.szerepkor === "admin") return;
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
      alert("Nem sikerült menteni");
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm("Biztosan törlöd ezt a felhasználót?")) return;
    try {
      await apiFetch(`/api/admin/users/${u.azonosito}`, { method: "DELETE" });
      await load();
    } catch (err) {
      console.error(err.message);
      alert("Nem sikerült törölni");
    }
  };

  const filtered = users.filter((u) =>
    (u.nev || "").toLowerCase().includes(query.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(query.toLowerCase())
  );

  const saveCreate = async () => {
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      alert("Minden mező kötelező");
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
          vezeteknev: lastName,
          gender
        })
      });
      setCreating(false);
      await load();
    } catch (err) {
      console.error(err.message);
      alert("Nem sikerült létrehozni");
    }
  };

  return (
    <div className="admin-page">
      <TopNav adminOnly />
      <div className="admin-container">
        <aside className="admin-side">
          <div className="admin-title">Admin Kezelőpult</div>
          <div className="admin-menu">
            <div className="admin-menu-item active">Felhasználók</div>
            <div className="admin-menu-item" onClick={() => navigate("/admin/reports")}>Jelentések</div>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-header">
            <div className="admin-header-title">Felhasználókezelés</div>
            <button className="admin-add" onClick={openCreate}>+ Új felhasználó hozzáadása</button>
          </div>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Felhasználók keresése..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="admin-table">
            <div className="admin-row admin-head">
              <div>Név</div>
              <div>Email</div>
              <div>Műveletek</div>
            </div>
            {filtered.map((u) => (
              <div className="admin-row" key={u.azonosito}>
                <div>{u.nev}</div>
                <div>{u.email}</div>
                <div className="admin-actions">
                  <button className="admin-edit" onClick={() => openEdit(u)}>Szerkesztés</button>
                  <button
                    className="admin-delete"
                    onClick={() => removeUser(u)}
                    disabled={u.szerepkor === "admin"}
                    title={u.szerepkor === "admin" ? "Admin nem törölhető innen" : "Törlés"}
                  >
                    Törlés
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {editing ? (
        <div className="admin-modal-backdrop" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-title">Felhasználó szerkesztése</div>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={editing?.szerepkor === "admin"}
              />
            </label>
            <label>
              Jelszó
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={editing?.szerepkor === "admin"}
              />
            </label>
            <label>
              Szerepkör
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={editing?.szerepkor === "admin"}
              >
                <option value="user" disabled={editing?.szerepkor === "admin"}>user</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <div className="admin-modal-actions">
              <button className="admin-cancel" onClick={() => setEditing(null)}>Mégsem</button>
              <button
                className="admin-save"
                onClick={saveEdit}
                disabled={editing?.szerepkor === "admin"}
                title={editing?.szerepkor === "admin" ? "Admin adatai itt nem módosíthatók" : "Mentés"}
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {creating ? (
        <div className="admin-modal-backdrop" onClick={() => setCreating(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-title">Új felhasználó</div>
            <label>
              Vezetéknév
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label>
              Keresztnév
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Jelszó
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label>
              Szerepkör
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <label>
              Nem
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">Férfi</option>
                <option value="female">Nő</option>
                <option value="other">Egyéb</option>
                <option value="unknown">Nem adom meg</option>
              </select>
            </label>
            <div className="admin-modal-actions">
              <button className="admin-cancel" onClick={() => setCreating(false)}>Mégsem</button>
              <button className="admin-save" onClick={saveCreate}>Létrehozás</button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
