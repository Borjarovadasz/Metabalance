import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import heroImg from "../styles/Pictures/MainPageImg.jpeg";
import iconWater from "../styles/Pictures/water.png";
import iconCalorie from "../styles/Pictures/calorie.png";
import iconSleep from "../styles/Pictures/sleep.png";
import iconMood from "../styles/Pictures/mood.png";
import iconWeight from "../styles/Pictures/weight.png";
import Footer from "../components/Footer";
import "./MainPage.css";

export default function MainPage() {
  useAuthGuard();
  const navigate = useNavigate();
  const [username, setUsername] = useState("Felhasználó");
  const [stats, setStats] = useState({
    viz: 0,
    vizCel: null,
    kaloria: 0,
    kaloriaKeret: null,
    alvas: 0,
    testsuly: null,
    hangulat: null
  });

  useEffect(() => {
    const load = async () => {
      try {
        const user = await apiFetch("/api/users/me");
        setUsername(user.nev || "Felhasználó");
      } catch (err) {
        console.error("User fetch error", err.message);
      }
      try {
        const daily = await apiFetch("/api/statistics/daily");
        const newStats = {
          viz: daily.viz_liter || 0,
          vizCel: daily.viz_cel_liter ?? null,
          kaloria: daily.kaloria_kcal || 0,
          kaloriaKeret: daily.kaloria_keret_kcal ?? null,
          alvas: daily.alvas_ora || 0,
          testsuly: daily.testsuly_kg ?? null,
          hangulat: daily.hangulat_atlag ?? null
        };
        try {
          const lastSleep = await apiFetch("/api/measurements?tipus=ALVAS&limit=1");
          if (lastSleep.length) {
            newStats.alvas = Number(lastSleep[0].ertek) || newStats.alvas || 0;
          }
        } catch (err) {
          console.error("Alvás backup fetch error", err.message);
        }
        setStats(newStats);
      } catch (err) {
        console.error("Stats fetch error", err.message);
      }
    };
    load();
  }, []);

  const waterProgress = stats.vizCel
    ? Math.min(100, Math.round((stats.viz / stats.vizCel) * 100))
    : 0;

  const calorieProgress = stats.kaloriaKeret
    ? Math.min(100, Math.round((stats.kaloria / stats.kaloriaKeret) * 100))
    : 0;

  const weightGoal = 70;
  const weightProgress = stats.testsuly
    ? Math.min(100, Math.round((stats.testsuly / weightGoal) * 100))
    : 0;

  const cards = [
    {
      title: "Vízfogyasztás",
      value: `${stats.viz.toFixed(1)} ml`,
      hint: stats.vizCel
        ? `Még ${(Math.max(stats.vizCel - stats.viz, 0)).toFixed(1)} ml van hátra a mai cél eléréséhez.`
        : "Állíts be célt.",
      bar: waterProgress,
      icon: iconWater,
      link: () => navigate("/water")
    },
    {
      title: "Kalóriabevitel",
      value: `${Math.round(stats.kaloria)} kcal`,
      hint: stats.kaloriaKeret
        ? `${Math.max(stats.kaloriaKeret - stats.kaloria, 0)} kcal maradt a mai keretből.`
        : "Adj hozzá keretet.",
      bar: calorieProgress,
      icon: iconCalorie,
      link: () => navigate("/calories")
    },
    {
      title: "Alvás",
      value: `${stats.alvas.toFixed(2)} óra`,
      hint: "Kiváló alvásminőség az elmúlt éjszaka.",
      bar: null,
      icon: iconSleep,
      link: () => navigate("/sleep")
    },
    {
      title: "Hangulatnapló",
      value: stats.hangulat ? stats.hangulat.toFixed(1) : "-",
      hint: "Értékeld a mai hangulatod!",
      bar: null,
      icon: iconMood,
      link: () => navigate("/mood")
    },
    {
      title: "Testsúly",
      value: stats.testsuly ? `${stats.testsuly.toFixed(1)} kg` : "-",
      hint: "Jól haladsz!",
      bar: weightProgress,
      icon: iconWeight,
      link: () => navigate("/weight")
    }
  ];

  return (
    <div className="mainpage">
      <TopNav />
      <div className="mp-container">
        <div className="hero">
          <div className="hero-text">
            <h1>
              Üdv újra, {username}!<br />
              Merre tart ma az egészséged?
            </h1>
            <p>
              Kövesd nyomon az összes egészséggel kapcsolatos adatodat egyetlen helyen.
              Állíts be célokat, figyeld a fejlődésedet, és élj teljesebb életet
              a Metabalance segítségével.
            </p>
            <button className="hero-btn" onClick={() => navigate("/calories")}>
              Kalória naplózás
            </button>
          </div>
          <div className="hero-img-wrap">
            <img src={heroImg} alt="hero" className="hero-img" />
          </div>
        </div>

        <h2 className="section-title">Napi áttekintés</h2>
        <div className="card-grid">
          {cards.map((card) => (
            <div className="stat-card" key={card.title} onClick={card.link}>
              <div className="stat-head">
                <div className="stat-title">{card.title}</div>
                {card.icon && (
                  <img src={card.icon} alt={card.title} className="stat-icon" />
                )}
              </div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-hint">{card.hint}</div>
              {card.bar !== null && (
                <div className="stat-bar">
                  <div style={{ width: `${card.bar}%` }} />
                </div>
              )}
              <div className="stat-link">Megtekintés</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
