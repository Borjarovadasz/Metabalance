import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Footer from "../components/Footer";
import "./SleepPage.css";
import SleepChart from "./SleepChart";
import SleepLog from "./SleepLog";
import SleepSummary from "./SleepSummary";

export default function SleepPage() {
  useAuthGuard();
  const [bedtime, setBedtime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");
  const [totalSleep, setTotalSleep] = useState(7.5);
  const [todayLogged, setTodayLogged] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date();
        const from = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        const fromStr = `${from.toISOString().slice(0, 10)}T00:00:00`;
        const toStr = `${today.toISOString().slice(0, 10)}T23:59:59`;
        const items = await apiFetch(
          `/api/measurements?tipus=ALVAS&datum_tol=${fromStr}&datum_ig=${toStr}&limit=500`
        );
        setList(items);
        const todayKey = today.toISOString().slice(0, 10);
        const hasToday = items.some((i) => i.datum && i.datum.slice(0, 10) === todayKey);
        setTodayLogged(hasToday);
        const todayTotal = items
          .filter((i) => i.datum && i.datum.slice(0, 10) === todayKey)
          .reduce((sum, i) => sum + Number(i.ertek || 0), 0);
        if (todayTotal > 0) {
          setTotalSleep(todayTotal);
        } else if (items.length) {
          const latest = items[0];
          setTotalSleep(Number(latest.ertek) || totalSleep);
        }
      } catch (err) {
        console.error(err.message);
      }
    };
    load();
  }, []);


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
      const todayKey = new Date().toISOString().slice(0, 10);
      setList((prev) => [
        {
          id: `tmp-${todayKey}`,
          tipus: "ALVAS",
          ertek: hours,
          mertekegyseg: "óra",
          datum: new Date().toISOString()
        },
        ...prev
      ]);
    } catch (err) {
      console.error(err.message);
    }
  };

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
    const labels = ["Vas", "Hét", "Kedd", "Sze", "Csü", "Pén", "Szo"];
    return days.map((key) => {
      const dayIdx = new Date(key + "T00:00:00").getDay();
      return {
        label: labels[dayIdx],
        value: map[key]
      };
    });
  };
  const chartData = dayTotals();

  return (
    <div className="sleep-page">
      <TopNav />
      <div className="sleep-container">
        <SleepLog
          bedtime={bedtime}
          setBedtime={setBedtime}
          wakeTime={wakeTime}
          setWakeTime={setWakeTime}
          addSleep={addSleep}
          todayLogged={todayLogged}
        />

        <SleepSummary totalSleep={totalSleep} />

        <section className="sleep-card">
          <h3>Alvási idő az elmúlt 7 napban</h3>
          <SleepChart data={chartData} />
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
