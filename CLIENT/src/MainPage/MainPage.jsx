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
import MainHero from "./MainHero";
import StatCard from "./StatCard";
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
          const lastMood = await apiFetch("/api/measurements?tipus=HANGULAT&limit=1");
          if (lastMood.length) {
            newStats.hangulat = Number(lastMood[0].ertek) || newStats.hangulat;
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

  const moodLabel = (value) => {
    const map = {
      6: "Vidám",
      5: "Boldog",
      4: "Semleges",
      3: "Szomorú",
      2: "Dühös",
      1: "Stresszes"
    };
    return map[Number(value)] || "Ismeretlen";
  };

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
      value: stats.hangulat !== null ? moodLabel(stats.hangulat) : "-",
      hint: "Legutóbbi hangulatod.",
      bar: null,
      icon: iconMood,
      link: () => navigate("/mood")
    },
    {
      title: "Testsúly",
      value: stats.testsuly !== null ? `${stats.testsuly} kg` : "-",
      hint: "Legutóbbi testsúlyod.",
      bar: weightProgress,
      icon: iconWeight,
      link: () => navigate("/weight")
    }
  ];

  return (
    <div className="mainpage">
      <TopNav />
      <div className="mp-container">
        <MainHero
          username={username}
          heroImg={heroImg}
          onCta={() => navigate("/calories")}
        />

        <h2 className="section-title">Napi áttekintés</h2>
        <div className="card-grid">
          {cards.map((card) => (
            <StatCard key={card.title} card={card} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
