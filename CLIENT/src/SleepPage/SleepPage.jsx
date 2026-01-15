import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Footer from "../components/Footer";
import "./SleepPage.css";

export default function SleepPage() {
  useAuthGuard();
  const [goal, setGoal] = useState(null);
  const [goalInput, setGoalInput] = useState(8);
  const [bedtime, setBedtime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");
  const [totalSleep, setTotalSleep] = useState(7.5);
  const [todayLogged, setTodayLogged] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const goals = await apiFetch("/api/goals?tipus=ALVAS&aktiv=true");
        if (goals.length) {
          setGoal(goals[0]);
          setGoalInput(goals[0].celErtek);
        }
      } catch (err) {
        console.error(err.message);
      }
      try {
        const items = await apiFetch("/api/measurements?tipus=ALVAS&limit=7");
        const today = new Date().toISOString().slice(0, 10);
        const hasToday = items.some((i) => i.datum && i.datum.slice(0, 10) === today);
        setTodayLogged(hasToday);
        if (items.length) {
          const latest = items[0];
          setTotalSleep(Number(latest.ertek) || totalSleep);
        }
      } catch (err) {
        console.error(err.message);
      }
    };
    load();
  }, []);

  const saveGoal = async () => {
    if (!goalInput) return;
    const body = { celErtek: Number(goalInput), mertekegyseg: "óra", aktiv: true };
    try {
      if (goal) {
        await apiFetch(`/api/goals/${goal.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/api/goals", {
          method: "POST",
          body: JSON.stringify({ ...body, tipus: "ALVAS" })
        });
      }
      setGoal({ id: goal?.id || 0, celErtek: Number(goalInput) });
    } catch (err) {
      console.error(err.message);
    }
  };

  const addSleep = async () => {
    if (todayLogged) return;
    const [bH, bM] = bedtime.split(":").map(Number);
    const [wH, wM] = wakeTime.split(":").map(Number);
    let hours = wH + wM / 60 - (bH + bM / 60);
    if (hours < 0) hours += 24;
    setTotalSleep(hours);
    try {
      await apiFetch("/api/measurements", {
        method: "POST",
        body: JSON.stringify({
          tipus: "ALVAS",
          ertek: hours,
          mertekegyseg: "óra",
          datum: new Date().toISOString()
        })
      });
      setTodayLogged(true);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="sleep-page">
      <TopNav />
      <div className="sleep-container">
        <section className="sleep-card">
          <h3>Alvásnaplózás</h3>
          <div className="sleep-form-row">
            <div>
              <label>Lefekvés időpontja</label>
              <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
            </div>
            <div>
              <label>Felkelés időpontja</label>
              <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
            </div>
            <button onClick={addSleep} disabled={todayLogged}>
              {todayLogged ? "Már rögzítve" : "Alvás rögzítése"}
            </button>
          </div>
        </section>

        <section className="sleep-card center">
          <h3>Teljes alvásidő</h3>
          <div className="sleep-total">{totalSleep.toFixed(1)} óra</div>
          <div className="sleep-note">
            Pihentető alvás! Ne feledje, a jó alvás javítja a fókuszt és a hangulatot.
          </div>
        </section>

        <section className="sleep-card">
          <h3>Alvási idő az elmúlt 7 napban</h3>
          <div className="sleep-chart-placeholder">A grafikon ideiglenesen nem érhető el.</div>
        </section>

        <section className="sleep-card">
          <h3>Alvási tippek</h3>
          <ul className="sleep-tips">
            <li>Tartson rendszeres alvási ütemtervet, még hétvégén is.</li>
            <li>Gondoskodjon arról, hogy hálószobája sötét, csendes és hűvös legyen.</li>
            <li>Korlátozza a koffeint és az alkoholt lefekvés előtt.</li>
            <li>Rendszeresen mozogjon, de ne közvetlenül lefekvés előtt.</li>
            <li>Kerülje a nagy étkezéseket lefekvés előtt.</li>
          </ul>
        </section>
      </div>
      <Footer />
    </div>
  );
}
