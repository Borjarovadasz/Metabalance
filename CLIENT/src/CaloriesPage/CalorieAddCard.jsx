export default function CalorieAddCard({
  foodName,
  setFoodName,
  amount,
  setAmount,
  addMeasurement
}) {
  return (
    <section className="cal-card">
      <h3>Étel Hozzáadása</h3>
      <div className="cal-input-col">
        <input
          type="text"
          placeholder="Étel neve"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Kalória (pl. 250)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={addMeasurement}>Étel hozzáadása</button>
      </div>
    </section>
  );
}
