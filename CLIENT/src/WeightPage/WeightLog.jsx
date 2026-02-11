export default function WeightLog({
  currentWeight,
  setCurrentWeight,
  goalWeight,
  setGoalWeight,
  save
}) {
  return (
    <section className="weight-card">
      <h3>Napi súlybejegyzés</h3>
      <p className="weight-sub">Rögzítse jelenlegi súlyát és frissítse célját.</p>
      <div className="weight-form">
        <input
          type="number"
          placeholder="Jelenlegi súly (kg)"
          value={currentWeight}
          onChange={(e) => setCurrentWeight(e.target.value)}
        />
        <input
          type="number"
          placeholder="Súlycél (kg)"
          value={goalWeight}
          onChange={(e) => setGoalWeight(e.target.value)}
        />
        <button onClick={save}>+ Súly naplózása</button>
      </div>
    </section>
  );
}
