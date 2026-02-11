import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Footer from "../components/Footer";
import "./CaloriesPage.css";
import calorieIcon from "../styles/Pictures/calorie.png";
import CalorieChart from "./CalorieChart";

export default function CaloriesPage() {
  useAuthGuard();
  const [foodName, setFoodName] = useState("");
  const [amount, setAmount] = useState(0);
  const [list, setList] = useState([]);
  const [goal, setGoal] = useState(null);
  const [goalInput, setGoalInput] = useState(2000);

  const load = async () => {
    try {
      const goals = await apiFetch("/api/goals?tipus=KALORIA&aktiv=1");
      if (goals.length) {
        setGoal(goals[0]);
        setGoalInput(goals[0].celErtek);
      }
    } catch (err) {
      console.error("Goal fetch error", err.message);
    }
    try {
      const today = new Date();
      const from = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      const fromStr = `${from.toISOString().slice(0, 10)}T00:00:00`;
      const toStr = `${today.toISOString().slice(0, 10)}T23:59:59`;
      const items = await apiFetch(
        `/api/measurements?tipus=KALORIA&datum_tol=${fromStr}&datum_ig=${toStr}&limit=500`
      );
      setList(items);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveGoal = async (value) => {
    if (!value) return;
    const body = { celErtek: Number(value), mertekegyseg: "kcal", aktiv: true };
    try {
      if (goal) {
        await apiFetch(`/api/goals/${goal.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/api/goals", {
          method: "POST",
          body: JSON.stringify({ ...body, tipus: "KALORIA" })
        });
      }
      await load();
    } catch (err) {
      console.error("Goal save error", err.message);
      alert(err.message || "Nem sikerült menteni a célt");
    }
  };

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

  const todayKey = new Date().toISOString().slice(0, 10);
  const totalToday = list
    .filter((i) => i.datum && i.datum.slice(0, 10) === todayKey)
    .reduce((sum, i) => sum + Number(i.ertek || 0), 0);
  const target = goal?.celErtek || Number(goalInput) || 0;
  const progress = target ? Math.min(100, Math.round((totalToday / target) * 100)) : 0;
  const recent = list.slice(0, 3);
  const dayTotals = () => {
    const days = [];
    const map = {};
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      days.push(key);
      map[key] = 0;
    }
    list.forEach((item) => {
      if (!item.datum) return;
      const key = item.datum.slice(0, 10);
      if (map[key] !== undefined) {
        map[key] += Number(item.ertek || 0);
      }
    });
    return days.map((key) => ({
      label: key.slice(5, 10),
      value: map[key]
    }));
  };
  const chartData = dayTotals();

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
              <div className="cal-summary">{totalToday} / {target || 0} kcal</div>
            </div>
            <div className="cal-summary-note">Kalóriabevitel a célhoz képest</div>
          </div>
          <div className="cal-bar"><div style={{ width: `${progress}%` }} /></div>
        </section>

        <section className="cal-card">
          <h3>Napi cél beállítása</h3>
          <div className="cal-subtext">Állítsa be a napi kalóriacélját.</div>
          <div className="cal-subtext cal-strong">Aktuális cél:</div>
          <div className="cal-slider-row">
            <input
              type="range"
              className="cal-slider"
              min="1200"
              max="4000"
              step="50"
              value={goalInput || 0}
              onChange={(e) => setGoalInput(e.target.value)}
              onMouseUp={(e) => saveGoal(e.target.value)}
              onTouchEnd={(e) => saveGoal(e.target.value)}
            />
            <div className="cal-slider-value">{goalInput || 0} kcal</div>
          </div>
          <div className="cal-subtext">Javasolt: 1800-2500 kcal (egyéni célok szerint).</div>
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
          <CalorieChart data={chartData} />
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
