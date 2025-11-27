import { Link } from "react-router-dom";

export default function DashboardNavbar() {
    return (
        <nav className="dashboard-nav border-bottom">
            <div className="container d-flex justify-content-between align-items-center py-3">

                <div className="d-flex align-items-center gap-2">
                    <img src="/logo.png" width="40" />
                    <span className="fw-bold text-danger">Metabalance</span>
                </div>

                <div className="d-flex align-items-center gap-4">
                    <Link className="nav-item-link">Kezdőlap</Link>
                    <Link className="nav-item-link">Alvás</Link>
                    <Link className="nav-item-link">Kalória</Link>
                    <Link className="nav-item-link">Víz</Link>
                    <Link className="nav-item-link">Hangulat</Link>
                    <Link className="nav-item-link">Súly</Link>

                    <Link to="/login" className="fw-bold text-dark text-decoration-none">
                        Kijelentkezés
                    </Link>
                </div>

            </div>
        </nav>
    );
}
