export default function CalorieGoalCard({ goalInput, setGoalInput, saveGoal }) {
  return (
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
  );
}
