export default function RegisterForm() {
    return (
        <form className="px-4">

            {/* Keresztnév + Vezetéknév */}
            <div className="row mb-3">
                <div className="col">
                    <label className="fw-bold small mb-1">Keresztnév</label>
                    <input type="text" className="form-control" placeholder="Keresztnév" />
                </div>

                <div className="col">
                    <label className="fw-bold small mb-1">Vezetéknév</label>
                    <input type="text" className="form-control" placeholder="Vezetéknév" />
                </div>
            </div>

            {/* Email */}
            <label className="fw-bold small mb-1">E-mail</label>
            <input type="email" className="form-control mb-3" placeholder="valaki@pelda.hu" />

            {/* Jelszó */}
            <label className="fw-bold small mb-1">Jelszó</label>
            <input type="password" className="form-control mb-3" placeholder="********" />

            {/* Jelszó megerősítése */}
            <label className="fw-bold small mb-1">Jelszó megerősítése</label>
            <input type="password" className="form-control mb-3" placeholder="********" />

            {/* Telefonszám */}
            <label className="fw-bold small mb-1">Telefonszám</label>
            <input type="text" className="form-control mb-3" />

            {/* Nem */}
            <label className="fw-bold small mb-1">Nem</label>
            <select className="form-control mb-4">
                <option>Férfi</option>
                <option>Nő</option>
            </select>

            {/* Gomb */}
            <button type="submit" className="btn btn-danger w-100 rounded-pill fw-bold">
                Regisztráció
            </button>

        </form>
    );
}
