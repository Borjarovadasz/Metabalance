export default function SleepLog({
  bedtime,
  setBedtime,
  wakeTime,
  setWakeTime,
  addSleep,
  todayLogged
}) {
  return (
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
  );
}
