export default function StatCard({ title, value, desc, progress, footer, icon }) {
    return (
        <div className="col-md-4 col-lg-3">
            <div className="stat-card shadow-sm p-4">

                <div className="d-flex justify-content-between">
                    <h6 className="fw-bold">{title}</h6>
                    <span className="icon-small">{icon}</span>
                </div>

                <h3 className="fw-bold mt-2 mb-1">{value}</h3>

                <p className="text-secondary small">{desc}</p>

                {progress && (
                    <>
                        <div className="progress my-2" style={{ height: "5px" }}>
                            <div
                                className="progress-bar"
                                style={{ width: `${progress}%`, background: "#E86C6C" }}
                            ></div>
                        </div>
                    </>
                )}

                <div className="text-danger small fw-bold mt-2">{footer}</div>

            </div>
        </div>
    );
}
