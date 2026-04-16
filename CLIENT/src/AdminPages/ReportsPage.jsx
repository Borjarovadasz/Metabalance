import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import "./AdminPage.css";

export default function ReportsPage() {
  useAuthGuard();
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);

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

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/api/errors");
        setErrors(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="admin-page">
      <TopNav adminOnly />
      <div className="admin-container">
        <aside className="admin-side">
          <div className="admin-title">Admin Kezelőpult</div>
          <div className="admin-menu">
            <div className="admin-menu-item" onClick={() => navigate("/admin")}>Felhasználók</div>
            <div className="admin-menu-item active">Jelentések</div>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-header">
            <div className="admin-header-title">Jelentések</div>
          </div>

          <div className="admin-table">
            <div className="admin-row admin-head">
              <div>Idő</div>
              <div>Email</div>
              <div>Üzenet</div>
            </div>
            {errors.map((e) => (
              <div className="admin-row" key={e.id}>
                <div>{String(e.created_at).slice(0, 19).replace("T", " ")}</div>
                <div>{e.email || "-"}</div>
                <div>{e.message}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
