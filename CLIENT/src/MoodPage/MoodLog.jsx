export default function MoodLog({
  moods,
  selectedMood,
  setSelectedMood,
  note,
  setNote,
  saveMood
}) {
  return (
    <section className="mood-card">
      <h3>Hangulat rögzítése</h3>
      <div className="mood-row">
        {moods.map((m) => (
          <button
            key={m.label}
            className={`mood-btn ${selectedMood?.value === m.value ? "active" : ""}`}
            onClick={() => setSelectedMood(m)}
          >
            <div className="mood-icon">{m.icon}</div>
            <div className="mood-label">{m.label}</div>
          </button>
        ))}
      </div>
      <textarea
        className="mood-note"
        placeholder="Rövid jegyzet írása a hangulatodhoz..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button className="mood-save" onClick={saveMood}>Hangulat rögzítése</button>
    </section>
  );
}
