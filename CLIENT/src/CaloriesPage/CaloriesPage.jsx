import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Footer from "../components/Footer";
import "./CaloriesPage.css";
import calorieIcon from "../styles/Pictures/calorie.png";

export default function CaloriesPage() {
  useAuthGuard();
  const [goal, setGoal] = useState(null);
  const [goalInput, setGoalInput] = useState(2000);
  const [foodName, setFoodName] = useState("");
  const [amount, setAmount] = useState(0);
  const [list, setList] = useState([]);

  const load = async () => {
    try {
      const goals = await apiFetch("/api/goals?tipus=KALORIA&aktiv=true");
      if (goals.length) {
        setGoal(goals[0]);
        setGoalInput(goals[0].celErtek);
      }
    } catch (err) {
      console.error(err.message);
    }

    try {
      const items = await apiFetch("/api/measurements?tipus=KALORIA&limit=7");
      setList(items);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addMeasurement = async () => {
    if (!amount) return;
    await apiFetch("/api/measurements", {
      method: "POST",
      body: JSON.stringify({
        tipus: "KALORIA",
        ertek: Number(amount),
        mertekegyseg: "kcal",
        datum: new Date().toISOString(),
        megjegyzes: foodName || null
      })
    });
    setAmount(0);
    setFoodName("");
    await load();
  };

  const totalToday = list.reduce((sum, i) => sum + Number(i.ertek || 0), 0);
  const target = goal?.celErtek || Number(goalInput) || 0;
  const progress = target ? Math.min(100, Math.round((totalToday / target) * 100)) : 0;
  const recent = list.slice(0, 3);

  return (
    <div className="cal-page">
      <TopNav />
      <div className="cal-container">
        <header className="cal-header">
          <img src={calorieIcon} alt="Kalória" className="cal-icon" />
          <div>
            <h2 className="cal-title">Kalóriabevitel Naplózása</h2>
            <p className="cal-sub">Kövesse nyomon a kalóriákat, hogy elérje célját!</p>
          </div>
        </header>

        <section className="cal-card">
          <h3>Étel Hozzáadása</h3>
          <div className="cal-input-col">
            <input
              type="text"
              placeholder="Étel neve"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Kalória (pl. 250)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={addMeasurement}>Étel hozzáadása</button>
          </div>
        </section>

        <section className="cal-card">
          <div className="cal-summary-row">
            <div>
              <h3>Mai összefoglaló</h3>
              <div className="cal-summary">{totalToday} / {target} kcal</div>
            </div>
            <div className="cal-summary-note">Kalóriabevitel a célhoz képest</div>
          </div>
          <div className="cal-bar"><div style={{ width: `${progress}%` }} /></div>
        </section>

        <section className="cal-card">
          <h3>Legutóbb naplózott ételek</h3>
          {recent.length === 0 ? (
            <div className="cal-empty">Nincsenek bejegyzések ma.</div>
          ) : (
            <ul className="cal-recent-list">
              {recent.map((item, idx) => (
                <li key={idx}>{item.megjegyzes || "Ismeretlen étel"} • {item.ertek} kcal</li>
              ))}
            </ul>
          )}
        </section>

        <section className="cal-card">
          <h3>Napi kalóriabevitel az elmúlt 7 napban</h3>
          <div className="cal-chart-placeholder">A grafikon ideiglenesen nem érhető el.</div>
        </section>

        <section className="cal-card tips">
          <h3>Tippek a Kalória Kezeléséhez</h3>
          <ul>
            <li>Figyeljen a rejtett cukrokra az italokban és feldolgozott élelmiszerekben.</li>
            <li>Válasszon teljes értékű élelmiszereket, például gyümölcsöket, zöldségeket.</li>
            <li>Fogyasszon elegendő vizet, hogy teltségérzetet biztosítson és elkerülje a feles éhséget.</li>
            <li>Élvezzen lassan és élvezze az ételt, ez segít felismerni, mikor lakott jól.</li>
          </ul>
        </section>
      </div>
      <Footer />
    </div>
  );
}
