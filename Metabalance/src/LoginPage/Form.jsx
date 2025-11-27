export default function LoginForm() {
    return (
        <form className="px-4">

            {/* Email */}
            <label className="fw-bold small mb-1">E-mail cím</label>
            <input
                type="email"
                className="form-control mb-3"
                placeholder="pelda@email.hu"
            />

            {/* Password */}
            <div className="d-flex justify-content-between align-items-center">
                <label className="fw-bold small mb-1">Jelszó</label>
                <a href="#" className="small text-danger text-decoration-none">
                    Elfelejtetted a jelszavad?
                </a>
            </div>

            <input
                type="password"
                className="form-control mb-3"
                placeholder="********"
            />

            {/* Remember me */}
            <div className="d-flex align-items-center mb-3">
                <input type="checkbox" className="form-check-input me-2" />
                <label className="small">Emlékezz rám</label>
            </div>

            {/* Button */}
            <button
                type="submit"
                className="btn btn-danger w-100 rounded-pill fw-bold"
            >
                Bejelentkezés
            </button>
        </form>
    );
}
