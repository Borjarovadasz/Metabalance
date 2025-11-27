export default function Navbar() {
    return (
        <nav className="navbar bg-white border-bottom py-3">
            <div className="container d-flex justify-content-between align-items-center">

                <div className="d-flex align-items-center gap-2">
                    <img src="src/styles/Pictures/logo-removebg-preview.png" width="50" height="50" alt="logo" />
                    <span className="fw-semibold text-danger">Metabalance</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <a href="#" className="text-dark small text-decoration-none">Bejelentkezés</a>
                    <img src="src/styles/Pictures/navbar-login-icon.png" width="20" height="20" alt="login icon" />
                </div>
            </div>
        </nav>
    );
}
