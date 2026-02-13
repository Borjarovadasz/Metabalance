import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Footer from "../components/Footer";
import "./CaloriesPage.css";
import calorieIcon from "../styles/Pictures/calorie.png";
import CaloriesHeader from "./CaloriesHeader";
import CalorieAddCard from "./CalorieAddCard";
import CalorieSummaryCard from "./CalorieSummaryCard";
import CalorieGoalCard from "./CalorieGoalCard";
import CalorieRecentCard from "./CalorieRecentCard";
import CalorieChartCard from "./CalorieChartCard";
import CalorieTipsCard from "./CalorieTipsCard";

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
        <CaloriesHeader
          icon={calorieIcon}
          title="Kalóriabevitel Naplózása"
          subtitle="Kövesse nyomon a kalóriákat, hogy elérje célját!"
        />
        <CalorieAddCard
          foodName={foodName}
          setFoodName={setFoodName}
          amount={amount}
          setAmount={setAmount}
          addMeasurement={addMeasurement}
        />
        <CalorieSummaryCard
          totalToday={totalToday}
          target={target}
          progress={progress}
        />
        <CalorieGoalCard
          goalInput={goalInput}
          setGoalInput={setGoalInput}
          saveGoal={saveGoal}
        />
        <CalorieRecentCard recent={recent} />
        <CalorieChartCard data={chartData} />
        <CalorieTipsCard />
      </div>
      <Footer />
    </div>
  );
}
