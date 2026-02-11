export default function WaterLog({
  totalToday,
  target,
  amount,
  setAmount,
  addMeasurement,
  loading
}) {
  return (
    <div className="water-box outline">
      <div className="water-label">Vízbevitel naplózása</div>
      <div className="water-subtext">Adja hozzá a napi vízfogyasztását.</div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="water-subtext">Jelenlegi bevitel:</div>
        <div className="water-goal-text">{`${totalToday} ml / ${target || 0} ml`}</div>
      </div>
      <div className="water-input-row mb-2">
        <button
          className="water-round-btn"
          onClick={() => setAmount((p) => Math.max(0, p - 50))}
        >
          -
        </button>
        <input
          type="number"
          className="water-input"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button
          className="water-round-btn"
          onClick={() => setAmount((p) => p + 50)}
        >
          +
        </button>
        <div className="water-unit">ml</div>
      </div>
      <button className="water-primary-btn" onClick={addMeasurement} disabled={loading}>
        {loading ? "Mentés..." : "Vízmennyiség rögzítése"}
      </button>
    </div>
  );
}
