import StatCard from "./Statscard";

export default function StatsGrid() {
    return (
        <div className="container mt-5 stats-grid">

            <h4 className="fw-bold mb-4">Napi áttekintés</h4>

            <div className="row g-4">

                <StatCard
                    title="Vízfogyasztás"
                    value="2.3 L"
                    desc="Még 0.7 L van hátra a mai cél eléréséhez!"
                    progress={77}
                    footer="Megtekintés"
                    icon="💧"
                />

                <StatCard
                    title="Kalóriabevitel"
                    value="1850 kcal"
                    desc="250 kcal maradt a mai keretből."
                    progress={88}
                    footer="Megtekintés"
                    icon="🔥"
                />

                <StatCard
                    title="Alvás"
                    value="7 óra 45 perc"
                    desc="Kiváló alvásminőség az elmúlt éjszaka."
                    footer="Megtekintés"
                    icon="😴"
                />

                <StatCard
                    title="Hangulatnapló"
                    value="Boldog"
                    desc="Értékeld a mai hangulatodat!"
                    footer="Megtekintés"
                    icon="😊"
                />

                <StatCard
                    title="Testsúly"
                    value="72.5 kg"
                    desc="Jól haladsz!"
                    progress={80}
                    footer="Megtekintés"
                    icon="⚖️"
                />

            </div>
        </div>
    );
}
