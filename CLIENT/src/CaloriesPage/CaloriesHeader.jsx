export default function CaloriesHeader({ icon, title, subtitle }) {
  return (
    <header className="cal-header">
      <img src={icon} alt="Kalória" className="cal-icon" />
      <div>
        <h2 className="cal-title">{title}</h2>
        <p className="cal-sub">{subtitle}</p>
      </div>
    </header>
  );
}
