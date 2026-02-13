export default function CalorieRecentCard({ recent }) {
  return (
    <section className="cal-card">
      <h3>Legutóbb naplózott ételek</h3>
      {recent.length === 0 ? (
        <div className="cal-empty">Nincsenek bejegyzések ma.</div>
      ) : (
        <ul className="cal-recent-list">
          {recent.map((item, idx) => (
            <li key={idx}>{item.megjegyzes || "Ismeretlen étel"} • {item.ertek} kcal</li>
          ))}
        </ul>
      )}
    </section>
  );
}
