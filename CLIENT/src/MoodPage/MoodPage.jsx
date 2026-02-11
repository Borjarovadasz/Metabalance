import { useEffect, useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Footer from "../components/Footer";
import MoodChart from "./MoodChart";
import MoodLog from "./MoodLog";
import "./MoodPage.css";

const moods = [
  { label: "Vidam", value: 6, icon: "😁" },
  { label: "Boldog", value: 5, icon: "☺️" },
  { label: "Semleges", value: 4, icon: "😶" },
  { label: "Szomoru", value: 3, icon: "😢" },
  { label: "Duhos", value: 2, icon: "🤬" },
  { label: "Stresszes", value: 1, icon: "😬" }
];

const toDateKey = (d) => d.toISOString().slice(0, 10);

export default function MoodPage() {
  useAuthGuard();
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));

  const load = async () => {
    try {
      const today = new Date();
      const from = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000);
      const fromStr = `${toDateKey(from)}T00:00:00`;
      const toStr = `${toDateKey(today)}T23:59:59`;
      const data = await apiFetch(
        `/api/measurements?tipus=HANGULAT&datum_tol=${fromStr}&datum_ig=${toStr}&limit=1000`
      );
      setItems(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveMood = async () => {
    if (!selectedMood) {
      alert("Valassz hangulatot!");
      return;
    }
    try {
      await apiFetch("/api/measurements", {
        method: "POST",
        body: JSON.stringify({
          tipus: "HANGULAT",
          ertek: selectedMood.value,
          mertekegyseg: "skala",
          datum: new Date().toISOString(),
          megjegyzes: note || null
        })
      });
      setNote("");
      setSelectedMood(null);
      await load();
    } catch (err) {
      console.error(err.message);
      alert("Nem sikerult menteni.");
    }
  };

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      days.push(toDateKey(d));
    }
    return days.map((key) => {
      const dayItems = items.filter((it) => it.datum && it.datum.slice(0, 10) === key);
      const avg =
        dayItems.length === 0
          ? 0
          : dayItems.reduce((sum, it) => sum + Number(it.ertek || 0), 0) / dayItems.length;
      return { label: key.slice(5, 10), value: Number(avg.toFixed(2)) };
    });
  }, [items]);

  const dayEntries = items
    .filter((it) => it.datum && it.datum.slice(0, 10) === selectedDate)
    .map((it) => ({
      time: it.datum ? it.datum.slice(11, 16) : "",
      mood: moods.find((m) => m.value === Number(it.ertek))?.label || "Hangulat",
      note: it.megjegyzes || ""
    }));

  const calendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = (firstDay.getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < startDay; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const key = toDateKey(new Date(year, month, d));
      cells.push({ day: d, key });
    }
    return { year, month, cells };
  }, []);

  const hasEntryMap = useMemo(() => {
    const map = {};
    items.forEach((it) => {
      if (!it.datum) return;
      const key = it.datum.slice(0, 10);
      map[key] = true;
    });
    return map;
  }, [items]);

  const monthName = new Date(calendar.year, calendar.month, 1).toLocaleString("hu-HU", {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="mood-page">
      <TopNav />
      <div className="mood-container">
        <MoodLog
          moods={moods}
          selectedMood={selectedMood}
          setSelectedMood={setSelectedMood}
          note={note}
          setNote={setNote}
          saveMood={saveMood}
        />

        <section className="mood-card">
          <h3>Hangulatelmenyek</h3>
          <MoodChart data={chartData} />
        </section>

        <section className="mood-card">
          <h3>Hangulat ({monthName})</h3>
          <div className="mood-calendar">
            {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((d) => (
              <div key={d} className="mood-cal-head">{d}</div>
            ))}
            {calendar.cells.map((cell, i) => {
              if (!cell) return <div key={`e-${i}`} className="mood-cal-cell empty" />;
              const isSelected = cell.key === selectedDate;
              const hasEntry = !!hasEntryMap[cell.key];
              return (
                <button
                  key={cell.key}
                  className={`mood-cal-cell ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedDate(cell.key)}
                >
                  {cell.day}
                  {hasEntry ? <span className="mood-dot" /> : null}
                </button>
              );
            })}
          </div>
          <div className="mood-day-details">
            <div className="mood-day-title">
              Napi bejegyzesek: {selectedDate}
            </div>
            {dayEntries.length === 0 ? (
              <div className="mood-day-empty">Nincs bejegyzes ezen a napon.</div>
            ) : (
              <ul className="mood-day-list">
                {dayEntries.map((entry, idx) => (
                  <li key={`${entry.time}-${idx}`}>
                    <strong>{entry.time}</strong> - {entry.mood}
                    {entry.note ? ` - ${entry.note}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
