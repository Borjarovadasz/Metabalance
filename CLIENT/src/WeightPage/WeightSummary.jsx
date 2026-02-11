export default function WeightSummary({ latestWeight, goalWeight }) {
  return (
    <section className="weight-card weight-equal">
      <h3>Testsúly változása</h3>
      <p className="weight-sub">Az elmúlt 6 hónap statisztikái a céljához viszonyítva.</p>
      <div className="weight-summary">
        <div>
          <div className="weight-summary-label">Jelenlegi súly</div>
          <div className="weight-summary-value">{latestWeight ? `${latestWeight} kg` : "-"}</div>
        </div>
        <div>
          <div className="weight-summary-label">Cél súly</div>
          <div className="weight-summary-value">{goalWeight ? `${goalWeight} kg` : "-"}</div>
        </div>
      </div>
    </section>
  );
}
