export default function SleepSummary({ totalSleep }) {
  return (
    <section className="sleep-card center">
      <h3>Teljes alvásidő</h3>
      <div className="sleep-total">{totalSleep.toFixed(1)} óra</div>
      <div className="sleep-note">
        Pihentető alvás! Ne feledje, a jó alvás javítja a fókuszt és a hangulatot.
      </div>
    </section>
  );
}
