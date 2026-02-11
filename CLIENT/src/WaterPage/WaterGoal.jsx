export default function WaterGoal({ goalInput, setGoalInput, saveGoal }) {
  return (
    <div className="water-box">
      <div className="water-label mb-1">Napi cél beállítása</div>
      <div className="water-subtext">Állítsa be a napi vízfogyasztási célját.</div>
      <div className="water-subtext fw-semibold">Aktuális cél:</div>
      <div className="water-slider-row">
        <input
          type="range"
          className="water-slider"
          min="500"
          max="4000"
          step="100"
          value={goalInput || 0}
          onChange={(e) => setGoalInput(e.target.value)}
          onMouseUp={(e) => saveGoal(e.target.value)}
          onTouchEnd={(e) => saveGoal(e.target.value)}
        />
        <div className="water-slider-value">{goalInput || 0} ml</div>
      </div>
      <div className="water-subtext mt-1">Javasolt: 8-10 pohár (2000-2500 ml).</div>
    </div>
  );
}
