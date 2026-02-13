import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Footer from "../components/Footer";
import WaterLog from "./WaterLog";
import WaterProgress from "./WaterProgress";
import WaterGoal from "./WaterGoal";
import "./WaterPage.css";

export default function WaterPage() {
  useAuthGuard();
  const [goal, setGoal] = useState(null);
  const [goalInput, setGoalInput] = useState(1500);
  const [amount, setAmount] = useState(250);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const goals = await apiFetch("/api/goals?tipus=VIZ&aktiv=1");
      if (goals.length) {
        setGoal(goals[0]);
        setGoalInput(goals[0].celErtek);
      }
    } catch (err) {
      console.error("Goal fetch error", err.message);
    }
    try {
      const items = await apiFetch("/api/measurements?tipus=VIZ&limit=50");
      setList(items);
    } catch (err) {
      console.error("Measurement fetch error", err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveGoal = async (value) => {
    if (!value) return;
    const body = { celErtek: Number(value), mertekegyseg: "ml", aktiv: true };
    try {
      if (goal) {
        await apiFetch(`/api/goals/${goal.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/api/goals", {
          method: "POST",
          body: JSON.stringify({ ...body, tipus: "VIZ" })
        });
      }
      await loadData();
    } catch (err) {
      console.error("Goal save error", err.message);
      alert(err.message || "Nem sikerült menteni a célt");
    }
  };

  const addMeasurement = async () => {
    if (!amount) return;
    setLoading(true);
    const nowIso = new Date().toISOString();
    const payload = {
      tipus: "VIZ",
      ertek: Number(amount),
      mertekegyseg: "ml",
      datum: nowIso,
      megjegyzes: "Vízbevitel"
    };
    try {
      await apiFetch("/api/measurements", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setList((prev) => [{ id: `tmp-${nowIso}`, ...payload }, ...prev]);
      await loadData();
    } catch (err) {
      console.error("Víz rögzítés hiba", err.message);
      alert(err.message || "Nem sikerült rögzíteni a vízbevitelt");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const totalToday = list
    .filter((i) => i.datum && i.datum.slice(0, 10) === today)
    .reduce((sum, i) => sum + Number(i.ertek || 0), 0);

  const target = goal?.celErtek || Number(goalInput) || 0;
  const progress = target ? Math.min(100, Math.round((totalToday / target) * 100)) : 0;

  return (
    <div className="water-page">
      <TopNav />
        <div className="water-container">
        <div className="water-title">Vízfogyasztás követése</div>

        <WaterLog
          totalToday={totalToday}
          target={target}
          amount={amount}
          setAmount={setAmount}
          addMeasurement={addMeasurement}
          loading={loading}
        />

        <WaterProgress
          progress={progress}
          target={target}
          totalToday={totalToday}
        />

        <WaterGoal
          goalInput={goalInput}
          setGoalInput={setGoalInput}
          saveGoal={saveGoal}
        />
      </div>
      <Footer />
    </div>
  );
}
