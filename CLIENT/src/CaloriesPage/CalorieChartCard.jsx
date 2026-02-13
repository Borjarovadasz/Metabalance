import CalorieChart from "./CalorieChart";

export default function CalorieChartCard({ data }) {
  return (
    <section className="cal-card">
      <h3>Napi kalóriabevitel az elmúlt 7 napban</h3>
      <CalorieChart data={data} />
    </section>
  );
}
