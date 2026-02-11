import { useEffect, useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Footer from "../components/Footer";
import WeightChart from "./WeightChart";
import WeightLog from "./WeightLog";
import WeightSummary from "./WeightSummary";
import "./WeightPage.css";

const monthLabels = ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];

export default function WeightPage() {
  useAuthGuard();
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goal, setGoal] = useState(null);
  const [list, setList] = useState([]);

  const load = async () => {
    try {
      const goals = await apiFetch("/api/goals?tipus=TESTSULY&aktiv=1");
      if (goals.length) {
        setGoal(goals[0]);
        setGoalWeight(goals[0].celErtek);
      }
    } catch (err) {
      console.error("Goal fetch error", err.message);
    }
    try {
      const today = new Date();
      const from = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      const fromStr = `${from.toISOString().slice(0, 10)}T00:00:00`;
      const toStr = `${today.toISOString().slice(0, 10)}T23:59:59`;
      const items = await apiFetch(
        `/api/measurements?tipus=TESTSULY&datum_tol=${fromStr}&datum_ig=${toStr}&limit=1000`
      );
      setList(items);
    } catch (err) {
      console.error("Measurement fetch error", err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!currentWeight) {
      alert("Add meg a jelenlegi súlyt!");
      return;
    }
    try {
      await apiFetch("/api/measurements", {
        method: "POST",
        body: JSON.stringify({
          tipus: "TESTSULY",
          ertek: Number(currentWeight),
          mertekegyseg: "kg",
          datum: new Date().toISOString()
        })
      });
      if (goalWeight) {
        const body = { celErtek: Number(goalWeight), mertekegyseg: "kg", aktiv: true };
        if (goal) {
          await apiFetch(`/api/goals/${goal.id}`, { method: "PUT", body: JSON.stringify(body) });
        } else {
          await apiFetch("/api/goals", {
            method: "POST",
            body: JSON.stringify({ ...body, tipus: "TESTSULY" })
          });
        }
      }
      setCurrentWeight("");
      await load();
    } catch (err) {
      console.error(err.message);
      alert("Nem sikerult menteni.");
    }
  };

  const latestWeight = useMemo(() => {
    if (!list.length) return null;
    const sorted = [...list].sort((a, b) => new Date(b.datum) - new Date(a.datum));
    return Number(sorted[0]?.ertek || 0);
  }, [list]);

  const chartData = useMemo(() => {
    const months = [];
    const map = {};
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: monthLabels[d.getMonth()] });
      map[key] = null;
    }
    const sorted = [...list].sort((a, b) => new Date(b.datum) - new Date(a.datum));
    sorted.forEach((item) => {
      if (!item.datum) return;
      const d = new Date(item.datum);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (map[key] === null) {
        map[key] = Number(item.ertek || 0);
      }
    });
    return months.map((m) => ({ label: m.label, value: map[m.key] ?? 0 }));
  }, [list]);

  return (
    <div className="weight-page">
      <TopNav />
      <div className="weight-container">
        <h2 className="weight-title">Súlykövetés</h2>

        <WeightLog
          currentWeight={currentWeight}
          setCurrentWeight={setCurrentWeight}
          goalWeight={goalWeight}
          setGoalWeight={setGoalWeight}
          save={save}
        />

        <WeightSummary latestWeight={latestWeight} goalWeight={goalWeight} />

        <section className="weight-card weight-equal">
          <WeightChart data={chartData} goal={goalWeight ? Number(goalWeight) : null} />
        </section>
      </div>
      <Footer />
    </div>
  );
}
