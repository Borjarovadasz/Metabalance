export default function StatCard({ card }) {
  return (
    <div className="stat-card" onClick={card.link}>
      <div className="stat-head">
        <div className="stat-title">{card.title}</div>
        {card.icon && (
          <img src={card.icon} alt={card.title} className="stat-icon" />
        )}
      </div>
      <div className="stat-value">{card.value}</div>
      <div className="stat-hint">{card.hint}</div>
      {card.bar !== null && (
        <div className="stat-bar">
          <div style={{ width: `${card.bar}%` }} />
        </div>
      )}
      <div className="stat-link">Megtekintés</div>
    </div>
  );
}
