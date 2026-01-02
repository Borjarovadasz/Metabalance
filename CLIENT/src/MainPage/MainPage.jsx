import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

export default function MainPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Péter");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  return (
    <div className="mainpage">
      {/* HEADER */}
      <header className="mp-header">
        <div className="mp-logo">Metabalance</div>

        <nav className="mp-nav">
          <a>Alvás</a>
          <a>Kalória</a>
          <a>Víz</a>
          <a>Hangulat</a>
          <a>Súly</a>
        </nav>

        <button
          className="mp-logout"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
        >
          Kijelentkezés
        </button>
      </header>

      {/* HERO */}
      <section className="mp-hero">
        <div className="mp-hero-left">
          <h1 className="mp-title">Üdv újra, {username}!</h1>
          <p className="mp-sub">
            Merre tart ma az egészséged? Kövesd nyomon minden adatod egy helyen.
          </p>
          <button className="mp-primary">Kalória naplózás</button>
        </div>

        <div className="mp-hero-imgbox">
          <img src="/running.jpg" alt="running" className="mp-hero-img" />
        </div>
      </section>

      {/* DAILY OVERVIEW */}
      <h2 className="mp-section-title">Napi áttekintés</h2>

      <div className="mp-cards">
        <div className="mp-card">
          <h3>Vízfogyasztás</h3>
          <p className="value">2.3 L</p>
          <p className="sub">Még 0.7 L hiányzik a célhoz.</p>
          <div className="progress"><div style={{ width: "77%" }} /></div>
        </div>

        <div className="mp-card">
          <h3>Kalóriabevitel</h3>
          <p className="value">1850 kcal</p>
          <p className="sub">250 kcal maradt.</p>
          <div className="progress"><div style={{ width: "88%" }} /></div>
        </div>

        <div className="mp-card">
          <h3>Alvás</h3>
          <p className="value">7 óra 45 perc</p>
          <p className="sub">Nagyon jó alvásminőség.</p>
        </div>

        <div className="mp-card">
          <h3>Hangulatnapló</h3>
          <p className="value">Boldog</p>
          <p className="sub">Értékeld a mai hangulatod!</p>
        </div>

        <div className="mp-card">
          <h3>Testsúly</h3>
          <p className="value">72.5 kg</p>
          <p className="sub">Jól haladsz!</p>
          <div className="progress"><div style={{ width: "50%" }} /></div>
        </div>
      </div>

      <footer className="mp-footer">
        © 2025 Metabalance. Minden jog fenntartva.
      </footer>
    </div>
  );
}
