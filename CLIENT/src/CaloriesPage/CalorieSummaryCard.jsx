export default function CalorieSummaryCard({ totalToday, target, progress }) {
  return (
    <section className="cal-card">
      <div className="cal-summary-row">
        <div>
          <h3>Mai összefoglaló</h3>
          <div className="cal-summary">{totalToday} / {target || 0} kcal</div>
        </div>
        <div className="cal-summary-note">Kalóriabevitel a célhoz képest</div>
      </div>
      <div className="cal-bar"><div style={{ width: `${progress}%` }} /></div>
    </section>
  );
}
