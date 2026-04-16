import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { apiFetch } from "../api";
import Footer from "../components/Footer";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Kérlek töltsd ki az összes mezőt!");
      return;
    }

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      const user = await apiFetch("/api/users/me");
      const role = user?.szerepkor || "user";
      navigate(role === "admin" ? "/admin" : "/mainpage");
    } catch (err) {
      alert(err.message || "Bejelentkezési hiba");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">Üdv újra!</h1>
        <p className="login-subtitle">Jelentkezz be fiókodba</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">E-mail cím</label>
          <input
            type="email"
            className="login-input"
            placeholder="pelda@email.hu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="login-label">Jelszó</label>
          <input
            type="password"
            className="login-input"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              Emlékezz rám
            </label>
          </div>

          <button type="submit" className="login-button">Bejelentkezés</button>
        </form>

        <p className="signup-text">
          Ha még nincs fiókod{" "}
          <span
            className="signup-link"
            onClick={() => navigate("/register")}
            style={{ cursor: "pointer" }}
          >
            hozd létre most!
          </span>
        </p>
      </div>

      <Footer />
    </div>
  );
}
